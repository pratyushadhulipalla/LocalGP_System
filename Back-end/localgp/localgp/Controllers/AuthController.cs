using localgp.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using OtpNet;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using localgp.Data;
using localgp.Data.DTO;
using Microsoft.IdentityModel.Logging;
using System.Text;
using System.Threading;
using System.Xml;
using Google.Apis.Auth.OAuth2;
using Google.Apis.Auth.OAuth2.Flows;
using Google.Apis.Auth.OAuth2.Requests;
using Google.Apis.Auth.OAuth2.Responses;
using Microsoft.EntityFrameworkCore;


namespace localgp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly IConfiguration _configuration;
        private readonly EmailService _emailService;
        private readonly ApplicationDbContext _context;
        private readonly HttpClient _httpClient;
        
        private static readonly Dictionary<string, string> _otpStore = new();

        public AuthController(UserManager<ApplicationUser> userManager, SignInManager<ApplicationUser> signInManager, IConfiguration configuration, EmailService emailService, RoleManager<IdentityRole> roleManager, ApplicationDbContext context)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _configuration = configuration;
            _emailService = emailService;
            _roleManager = roleManager;
            _context = context;
            _httpClient = new HttpClient();
            

        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterModel model)
        {
            if (ModelState.IsValid)
            {
                var existingUser = await _userManager.FindByEmailAsync(model.Email);
                if (existingUser != null)
                {
                    return BadRequest(new { message = "Email is already registered." });
                }
                var user = new ApplicationUser
                {
                    UserName = model.Username,
                    Email = model.Email,
                    FirstName = model.FirstName,
                    LastName = model.LastName,
                    DateOfBirth = DateTime.SpecifyKind(model.DateOfBirth, DateTimeKind.Utc),
                    Gender = model.Gender,
                    PhoneNumber = model.Phone,
                    Address = model.Address,
                    City = model.City,
                    Country = model.Country,
                    PostCode = model.PostCode,
                };
                try
                {
                    
                    var emailBody = $"<h1>Welcome to Local GP</h1><p>You have successfully registered with the username: {model.Username}</p>";
                    await _emailService.SendEmailAsync(model.Email, "Registration Successful", emailBody);
                    
                    var result = await _userManager.CreateAsync(user, model.Password);

                    if (result.Succeeded)
                    {
                        
                        // // Generate email confirmation token
                        // var token = await _userManager.GenerateEmailConfirmationTokenAsync(user);
                        // var confirmationLink = Url.Action("ConfirmEmail", "Auth", new { userId = user.Id, token }, Request.Scheme);

                        // Default to "Patient" role if the role is null or empty
                        var role = string.IsNullOrEmpty(model.Role) ? "Patient" : model.Role;

                        // Ensure the role exists
                        if (!await _roleManager.RoleExistsAsync(role))
                        {
                            await _roleManager.CreateAsync(new IdentityRole(role));
                        }
                        
                        await _userManager.AddToRoleAsync(user, role);
                        
                        
                        // Create a Patient entry
                        if (role == "Patient")
                        {
                            var patient = new Patient
                            {
                                UserId = user.Id,
                                // Populate other patient-specific properties if any
                            };
                            _context.Patients.Add(patient);
                            await _context.SaveChangesAsync();
                        }
                        
                   
                        
                       
                        return Ok(new { Message = "User registered successfully" });
                    }
                    else
                    {
                        return BadRequest(result.Errors);
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine(ex.Message);
                    Console.WriteLine("Duplicate email entries found in the database.");

                    return StatusCode(500, "Internal Server error");
                }

            }
            return BadRequest(ModelState);
        }
        
        [HttpGet("confirm-email")]
        public async Task<IActionResult> ConfirmEmail(string userId, string token)
        {
            if (string.IsNullOrWhiteSpace(userId) || string.IsNullOrWhiteSpace(token))
            {
                return BadRequest("User ID and token are required");
            }

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return NotFound("User not found");
            }

            var result = await _userManager.ConfirmEmailAsync(user, token);
            if (result.Succeeded)
            {
                return Ok("Email confirmed successfully");
            }

            return BadRequest("Error confirming email");
        }

        
        [HttpPost("register-doctor")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> RegisterDoctor([FromBody] DoctorModel model)
        {
            if (ModelState.IsValid)
            {
                if (model.Password != model.ConfirmPassword)
                {
                    return BadRequest(new { message = "Passwords do not match." });
                }
                
                var existingUser = await _userManager.FindByEmailAsync(model.Email);
                if (existingUser != null)
                {
                    return BadRequest(new { message = "Email is already registered." });
                }
                
                // Verify the license number
                var validLicense = await _context.DoctorValidations
                    .FirstOrDefaultAsync(v => v.FirstName == model.FirstName &&
                                              v.LastName == model.LastName &&
                                              v.LicenseNumber == model.LicenseNumber);
                if (validLicense == null)
                {
                    return BadRequest(new { message = "Invalid license number." });
                }

                var user = new ApplicationUser
                {
                    UserName = model.Username,
                    Email = model.Email,
                    FirstName = model.FirstName,
                    LastName = model.LastName,
                    DateOfBirth = DateTime.SpecifyKind(model.DateOfBirth, DateTimeKind.Utc),
                    Gender = model.Gender,
                    PhoneNumber = model.PhoneNumber,
                    Address = model.Address,
                    City = model.City,
                    Country = model.Country,
                    PostCode = model.PostCode,
                };

                try
                {
                    var result = await _userManager.CreateAsync(user, model.Password);

                    if (result.Succeeded)
                    {
                        // Ensure the "Doctor" role exists
                        if (!await _roleManager.RoleExistsAsync("Doctor"))
                        {
                            await _roleManager.CreateAsync(new IdentityRole("Doctor"));
                        }

                        await _userManager.AddToRoleAsync(user, "Doctor");

                        // Save additional doctor information
                        var doctor = new Doctor
                        {
                            UserId = user.Id,
                            Specialization = model.Specialization,
                            YearsOfExperience = model.YearsOfExperience,
                            Education = model.Education,
                            LicenseNumber = model.LicenseNumber,
                            Availabilities = model.Availability.Select(a => new DoctorAvailability
                            {
                                DayOfWeek = a.DayOfWeek,
                                StartTime = a.StartTime,
                                EndTime = a.EndTime
                            }).ToList()
                        };

                        _context.Doctors.Add(doctor);
                        await _context.SaveChangesAsync();

                        var emailBody = $"<h1>Welcome to Local GP</h1><p>You have been registered as a doctor with the username: {model.Username} and Password : {model.Password}</p>";
                        await _emailService.SendEmailAsync(model.Email, "Registration Successful", emailBody);
                        return Ok(new { Message = "Doctor registered successfully" });
                    }
                    else
                    {
                        return BadRequest(result.Errors);
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine(ex.Message);
                    return StatusCode(500, "Internal Server error");
                }
            }
            return BadRequest(ModelState);
        }
        
        [HttpPost("verify-license")]
        public async Task<IActionResult> VerifyLicense([FromBody] LicenseVerificationModel model)
        {
            var isValid = await _context.DoctorValidations
                .AnyAsync(v => v.LicenseNumber == model.LicenseNumber.Trim());
    
            return Ok(new { isValid });
        }


    
        

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginModel model)
        {
            var user = await _userManager.FindByNameAsync(model.Username);
            if (user != null && await _userManager.CheckPasswordAsync(user, model.Password))
            {
                var key = KeyGeneration.GenerateRandomKey(20);
                var totp = new Totp(key);
                var otp = totp.ComputeTotp(DateTime.UtcNow);

                // Store the OTP against the user for verification
                _otpStore[user.UserName] = otp;

                // Send OTP to user's email
                var emailBody = $"<h1>Your OTP Code</h1><p>Your OTP code is: {otp}</p>";
                await _emailService.SendEmailAsync(user.Email, "OTP Verification", emailBody);

                return Ok(new { Message = "OTP has been sent to your email." + user.Email });
            }
            return Unauthorized(new { message = "Invalid login attempt" });
        }
        [HttpPost("verify-otp")]
        public async Task<IActionResult> VerifyOtp([FromBody] VerifyOtpModel model)
        {
            if (_otpStore.TryGetValue(model.UserName, out var storedOtp))
            {
                if (storedOtp == model.Otp)
                {
                    _otpStore.Remove(model.UserName);

                    var user = await _userManager.FindByNameAsync(model.UserName);
                    if (user == null)
                    {
                        return BadRequest(new { message = "Invalid User." });
                    }

                    var claims = new List<Claim>
                    {
                        new Claim(JwtRegisteredClaimNames.Sub, user.UserName),
                        new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                        new Claim(ClaimTypes.Name, user.UserName), 
                        new Claim(ClaimTypes.NameIdentifier, user.Id)  // Ensure the user ID is added here
                        
                    };

                    var userRoles = await _userManager.GetRolesAsync(user);
                    claims.AddRange(userRoles.Select(role => new Claim(ClaimTypes.Role, role)));
                    
                    // Fetch doctor object if the user is a doctor
                    var doctor = await _context.Doctors.FirstOrDefaultAsync(d => d.UserId == user.Id);
                    if (doctor != null)
                    {
                        claims.Add(new Claim("doctorId", doctor.Id.ToString())); // Include doctorId if the user is a doctor
                    }
                    
                    // Fetch patient object if the user is a patient
                    var patient = await _context.Patients.FirstOrDefaultAsync(p => p.UserId == user.Id);
                    if (patient != null)
                    {
                        claims.Add(new Claim("patientId", patient.Id.ToString())); // Include patientId if the user is a patient
                    }

                    var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));
                    var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

                    var token = new JwtSecurityToken(
                        issuer: _configuration["Jwt:Issuer"],
                        audience: _configuration["Jwt:Issuer"],
                        claims: claims,
                        expires: DateTime.Now.AddMinutes(30),
                        signingCredentials: creds);

                    return Ok(new
                    {
                        token = new JwtSecurityTokenHandler().WriteToken(token),
                        user = new
                        {
                            user.UserName,
                            Roles = userRoles,
                            PatientId = patient?.Id, // Include patientId in the response if it exists
                            DoctorId = doctor?.Id, 
                            user.Id
                        }
                    });
                }

                return Unauthorized(new { message = "Invalid OTP" });
            }

            return BadRequest(new { message = "OTP not found or expired." });
        }
        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordModel model)
        {
            var user = await _userManager.FindByEmailAsync(model.Email);
            if (user == null)
            {
                return BadRequest("User not found");
            }

            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            var resetLink =$"http://localhost:3000/reset-password/{token}/{model.Email}";

            var emailBody = $"Please reset your password by clicking <a href='{resetLink}'>here</a>.";

            try
            {
                await _emailService.SendEmailAsync(model.Email, "Reset Password", emailBody);
                return Ok(new { Message = "Password reset link has been sent to your email" });
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                return StatusCode(500, "Error sending email");
            }
        }

        [HttpGet("reset-password")]
        public IActionResult ResetPassword(string token, string email)
        {
            if (token == null || email == null)
            {
                return BadRequest("Invalid password reset token or email.");
            }

            return Ok(new { token, email });
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordModel model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var user = await _userManager.FindByEmailAsync(model.Email);
            if (user == null)
            {
                return BadRequest("User not found");
            }

            var result = await _userManager.ResetPasswordAsync(user, model.Token, model.Password);
            if (result.Succeeded)
            {
                return Ok(new { Message = "Password has been reset successfully" });
            }

            return BadRequest(result.Errors);
        }
        
        private async Task<TokenResponse> ExchangeCodeForTokensAsync(string code)
        {
            var clientSecrets = new ClientSecrets
            {
                ClientId = _configuration["GoogleCalendar:ClientId"],
                ClientSecret = _configuration["GoogleCalendar:ClientSecret"]
            };

            var tokenRequest = new AuthorizationCodeTokenRequest
            {
                Code = code,
                RedirectUri = _configuration["GoogleCalendar:RedirectUri"],
                ClientId = clientSecrets.ClientId,
                ClientSecret = clientSecrets.ClientSecret
            };

            var flow = new GoogleAuthorizationCodeFlow(new GoogleAuthorizationCodeFlow.Initializer
            {
                ClientSecrets = clientSecrets,
                Scopes = new[] { "https://www.googleapis.com/auth/calendar" }
            });

            return await flow.FetchTokenAsync("user", tokenRequest, CancellationToken.None);
        }

        
        [HttpGet("callback")]
        public async Task<IActionResult> Callback(string code)
        {
            if (string.IsNullOrEmpty(code))
            {
                return BadRequest("Authorization code is missing.");
            }

            try
            {
                var tokenResponse = await ExchangeCodeForTokensAsync(code);
                if (tokenResponse != null)
                {
                    // Store tokens or perform further actions
                    return Ok(new
                    {
                        AccessToken = tokenResponse.AccessToken,
                        RefreshToken = tokenResponse.RefreshToken
                    });
                }

                return BadRequest("Unable to retrieve tokens.");
            }
            catch (Exception ex)
            {
                // Log the error for debugging
                Console.WriteLine($"Error during OAuth callback: {ex.Message}");
                return StatusCode(500, "Internal server error during OAuth callback.");
            }
        }

        [HttpGet("redirect")]
        public async Task<IActionResult> HandleZoomRedirect(string code, string state)
        {
            // Exchange the authorization code for an access token
            var tokenResponse = await ExchangeCodeForTokenAsync(code);
            
            if (tokenResponse == null)
            {
                return BadRequest("Failed to retrieve access token.");
            }

            // Process the token and redirect to a relevant page
            // Example: Redirect to the home page or a dashboard
            return Redirect("/dashboard");
        }

        private async Task<string> ExchangeCodeForTokenAsync(string code)
        {
            var clientId = _configuration["Zoom:ClientId"];
            var clientSecret = _configuration["Zoom:ClientSecret"];
            var redirectUri = _configuration["Zoom:RedirectUri"];

            var request = new HttpRequestMessage(HttpMethod.Post, "https://zoom.us/oauth/token")
            {
                Content = new StringContent($"grant_type=authorization_code&code={code}&redirect_uri={redirectUri}", Encoding.UTF8, "application/x-www-form-urlencoded")
            };
            var basicAuthHeaderValue = Convert.ToBase64String(Encoding.UTF8.GetBytes($"{clientId}:{clientSecret}"));
            request.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Basic", basicAuthHeaderValue);

            var response = await _httpClient.SendAsync(request);

            if (!response.IsSuccessStatusCode)
            {
                return null;
            }

            var responseContent = await response.Content.ReadAsStringAsync();
            // Deserialize and process the token response as needed
            // Example: Save the access token and refresh token
            // var tokenResponse = JsonConvert.DeserializeObject<TokenResponse>(responseContent);

            return responseContent; // Adjust this to return what you need
        }
    

       
    }
}


    

