using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using localgp.Models;
using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using localgp.Data;
using localgp.Data.DTO;

namespace localgp.Controllers
{
    [Authorize(Roles = "Patient,Admin")]
   
    [Route("api/[controller]")]
    [ApiController]
    public class PatientController : ControllerBase
    {
        
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly ApplicationDbContext _context;
        private readonly EmailService _emailService;

        public PatientController(UserManager<ApplicationUser> userManager, ApplicationDbContext context, EmailService emailService)
        {
            _userManager = userManager;
            _context = context;
            _emailService = emailService;
        }
        // Example endpoint for patient
        [HttpGet("dashboard")]
        public IActionResult GetPatientDashboard()
        {
            return Ok(new { message = "Welcome to the Patient Dashboard" });
        }

        
        
        
        [HttpGet("details")]
        [Authorize ]
        public async Task<IActionResult> GetUserDetails()
        {
            var username = User.FindFirstValue(ClaimTypes.Name);
            if (string.IsNullOrEmpty(username))
            {
                return NotFound(new { message = "User not found (username missing)" });
            }

            var user = await _userManager.FindByNameAsync(username);
            if (user == null)
            {
                return NotFound(new { message = $"User not found for username: {username}" });
            }

            var userWithDoctor = await _context.Users
                .Include(u => u.Doctor)
                .ThenInclude(d => d.Availabilities)
                .FirstOrDefaultAsync(u => u.Id == user.Id);

            if (userWithDoctor == null)
            {
                return NotFound(new { message = $"User details not found for userId: {user.Id}" });
            }

            var userDetails = new DoctorModel()
            {
                FirstName = userWithDoctor.FirstName,
                LastName = userWithDoctor.LastName,
                Username = userWithDoctor.UserName,
                Email = userWithDoctor.Email,
                PhoneNumber = userWithDoctor.PhoneNumber,
                Address = userWithDoctor.Address,
                City = userWithDoctor.City,
                Country = userWithDoctor.Country,
                PostCode = userWithDoctor.PostCode,
                DateOfBirth = userWithDoctor.DateOfBirth,
                Gender = userWithDoctor.Gender,
                Specialization = userWithDoctor.Doctor?.Specialization,
                YearsOfExperience = userWithDoctor.Doctor?.YearsOfExperience,
                Education = userWithDoctor.Doctor?.Education,
                Availability = userWithDoctor.Doctor?.Availabilities.Select(a => new AvailabilityModel
                {
                    DayOfWeek = a.DayOfWeek,
                    StartTime = a.StartTime,
                    EndTime = a.EndTime
                }).ToList()
            };

            return Ok(userDetails);
        }

        [HttpPut("update")]
        [Authorize]
        public async Task<IActionResult> UpdateUserDetails([FromBody] UserDetailsDTO model)
        {
            var username = User.FindFirstValue(ClaimTypes.Name);
            if (string.IsNullOrEmpty(username))
            {
                return NotFound(new { message = "User not found (username missing)" });
            }

            var user = await _userManager.FindByNameAsync(username);
            if (user == null)
            {
                return NotFound(new { message = $"User not found for username: {username}" });
            }

            var userWithDoctor = await _context.Users
                .Include(u => u.Doctor) // Include doctor details if applicable
                .FirstOrDefaultAsync(u => u.Id == user.Id);

            if (userWithDoctor == null)
            {
                return NotFound(new { message = $"User details not found for userId: {user.Id}" });
            }

            // Update user properties
            userWithDoctor.FirstName = model.FirstName;
            userWithDoctor.LastName = model.LastName;
            userWithDoctor.UserName = model.Username;
            userWithDoctor.Email = model.Email;
            userWithDoctor.PhoneNumber = model.PhoneNumber;
            userWithDoctor.Address = model.Address;
            userWithDoctor.City = model.City;
            userWithDoctor.Country = model.Country;
            userWithDoctor.PostCode = model.PostCode;
            userWithDoctor.DateOfBirth = model.DateOfBirth;
            userWithDoctor.Gender = model.Gender;

            // Update doctor properties if applicable
            if (userWithDoctor.Doctor != null)
            {
                userWithDoctor.Doctor.Specialization = model.Specialization;
                userWithDoctor.Doctor.YearsOfExperience = model.YearsOfExperience ?? 0;
                userWithDoctor.Doctor.Education = model.Education;
                
                // Update availability
                _context.DoctorAvailabilities.RemoveRange(userWithDoctor.Doctor.Availabilities);
                userWithDoctor.Doctor.Availabilities = model.Availability.Select(a => new DoctorAvailability
                {
                    DayOfWeek = a.DayOfWeek,
                    StartTime = a.StartTime,
                    EndTime = a.EndTime
                }).ToList();
            }

            var result = await _userManager.UpdateAsync(userWithDoctor);

            if (result.Succeeded)
            {
                return Ok(new { message = "User details updated successfully" });
            }

            return BadRequest(result.Errors);
        }
        [HttpGet("Patientdetails")]
        [Authorize]
        public async Task<IActionResult> GetPatientDetails()
        {
            var username = User.FindFirstValue(ClaimTypes.Name);
            if (string.IsNullOrEmpty(username))
            {
                return NotFound(new { message = "User not found (username missing)" });
            }

            var user = await _userManager.FindByNameAsync(username);
            if (user == null)
            {
                return NotFound(new { message = $"User not found for username: {username}" });
            }

            var userWithPatient = await _context.Users
                .Include(u => u.Patient) // Include patient details if applicable
                .FirstOrDefaultAsync(u => u.Id == user.Id);

            if (userWithPatient == null || userWithPatient.Patient == null)
            {
                return NotFound(new { message = "Patient details not found" });
            }

            return Ok(new { firstName = userWithPatient.FirstName, lastName = userWithPatient.LastName });
        }
        
        [HttpGet("upcoming-appointments")]
        [Authorize]
        public async Task<IActionResult> GetUpcomingAppointments()
        {
            var username = User.FindFirstValue(ClaimTypes.Name);
            if (string.IsNullOrEmpty(username))
            {
                return NotFound(new { message = "User not found (username missing)" });
            }

            var user = await _userManager.FindByNameAsync(username);
            if (user == null)
            {
                return NotFound(new { message = $"User not found for username: {username}" });
            }
            var userWithPatient = await _context.Users
                .Include(u => u.Patient) // Include patient details if applicable
                .FirstOrDefaultAsync(u => u.Id == user.Id);

            if (userWithPatient == null || userWithPatient.Patient == null)
            {
                Console.WriteLine("Patient details not found for the user.");
                return NotFound("Patient details not found for the user.");
            }

            var patientId = userWithPatient.Patient.Id;
            Console.WriteLine($"Patient ID: {patientId}"); // Debugging

            var appointments = await _context.Appointments
                .Include(a => a.Doctor).ThenInclude(d => d.User) // Include doctor and user details
                .Include(a => a.Patient).ThenInclude(p => p.User) // Include patient and user details
                .Where(a => a.PatientId == patientId && a.Date >= DateTime.UtcNow)
                .Select(a => new
                {
                    Date = a.Date.ToString("dd/MM/yyyy"), // Format the date for frontend
                    Time = a.Time.ToString(@"hh\:mm"), // Format the time for frontend
                    DoctorName = a.Doctor.User.FirstName + " " + a.Doctor.User.LastName
                })
                .ToListAsync();

            Console.WriteLine($"Fetched {appointments.Count} upcoming appointments"); // Debugging
            foreach (var appointment in appointments)
            {
                Console.WriteLine($"Appointment: {appointment.Date} {appointment.Time} with {appointment.DoctorName}"); // Debugging
            }

            return Ok(appointments);
        }
        
        [HttpGet("doctor/{doctorId}/availability")]
[Authorize]
public async Task<IActionResult> GetDoctorAvailability(int doctorId)
{
    try
    {
        var doctor = await _context.Doctors
            .Include(d => d.Availabilities)
            .Include(d => d.Holidays)
            .FirstOrDefaultAsync(d => d.Id == doctorId);

        if (doctor == null)
        {
            return NotFound(new { message = "Doctor not found" });
        }

        var availabilityEvents = new List<AvailabilityEvent>();

        var startDate = DateTime.UtcNow.Date;
        var endDate = startDate.AddMonths(3); // Show availabilities for 3 months

        var specificDates = doctor.Availabilities
            .Where(a => a.Date != DateTime.MinValue)
            .Select(a => a.Date.Date)
            .Distinct()
            .ToHashSet();

        var weeklyAvailabilities = doctor.Availabilities
            .Where(a => a.Date == DateTime.MinValue)
            .GroupBy(a => a.DayOfWeek)
            .Select(g => g.First())
            .ToList();

        // Add weekly availabilities
        foreach (var availability in weeklyAvailabilities)
        {
            if (availability.StartTime == TimeSpan.Zero && availability.EndTime == TimeSpan.Zero)
            {
                continue; // Skip invalid availabilities
            }

            if (string.IsNullOrEmpty(availability.DayOfWeek))
            {
                continue; // Skip invalid availabilities
            }

            var dayOfWeek = Enum.Parse<DayOfWeek>(availability.DayOfWeek);
            for (var date = startDate; date <= endDate; date = date.AddDays(1))
            {
                if (date.DayOfWeek == dayOfWeek && !doctor.Holidays.Any(h => h.Date.Date == date) && !specificDates.Contains(date))
                {
                    availabilityEvents.Add(new AvailabilityEvent
                    {
                        Date = date,
                        StartTime = availability.StartTime,
                        EndTime = availability.EndTime,
                        IsHoliday = false
                    });
                }
            }
        }

        // Add specific date availabilities
        foreach (var availability in doctor.Availabilities.Where(a => a.Date != DateTime.MinValue))
        {
            if (!doctor.Holidays.Any(h => h.Date.Date == availability.Date.Date))
            {
                availabilityEvents.Add(new AvailabilityEvent
                {
                    Date = availability.Date.Date,
                    StartTime = availability.StartTime,
                    EndTime = availability.EndTime,
                    IsHoliday = false
                });
            }
        }

        // Add holidays
        foreach (var holiday in doctor.Holidays)
        {
            availabilityEvents.Add(new AvailabilityEvent
            {
                Date = holiday.Date,
                StartTime = TimeSpan.Zero,
                EndTime = TimeSpan.Zero,
                IsHoliday = true
            });
        }

        return Ok(availabilityEvents);
    }
    catch (Exception ex)
    {
        // Log the detailed error
        Console.WriteLine($"Error in GetDoctorAvailability: {ex}");
        return StatusCode(500, new { message = $"An error occurred while fetching availability: {ex.Message}" });
    }
}

        [Authorize(Roles = "Patient")]
        [HttpPost("submit-feedback")]
        public async Task<IActionResult> SubmitFeedback([FromBody] FeedbackDto feedbackDto)
        {
            var appointment = await _context.Appointments.FindAsync(feedbackDto.AppointmentId);
            if (appointment == null || appointment.PatientId != feedbackDto.PatientId)
            {
                return BadRequest(new { message = "Invalid appointment or unauthorized access." });
            }

            var feedback = new Feedback
            {
                AppointmentId = feedbackDto.AppointmentId,
                PatientId = feedbackDto.PatientId,
                DoctorId = feedbackDto.DoctorId,
                Rating = feedbackDto.Rating,
                FeedbackText = feedbackDto.FeedbackText
            };

            _context.Feedbacks.Add(feedback);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Feedback submitted successfully." });
        }
        
        [Authorize(Roles = "Patient")]
        [HttpGet("feedback/{appointmentId}")]
        public async Task<IActionResult> GetFeedbackForAppointment(int appointmentId)
        {
            var feedback = await _context.Feedbacks
                .Where(f => f.AppointmentId == appointmentId)
                .FirstOrDefaultAsync();

            if (feedback == null)
            {
                return NotFound(new { message = "Feedback not found for this appointment." });
            }

            var feedbackDto = new FeedbackDto
            {
                AppointmentId = feedback.AppointmentId,
                PatientId = feedback.PatientId,
                DoctorId = feedback.DoctorId,
                Rating = feedback.Rating,
                FeedbackText = feedback.FeedbackText
            };

            return Ok(feedbackDto);
        }
        
        [Authorize(Roles = "Patient")]
        [HttpPost("contact-admin")]
        public async Task<IActionResult> ContactAdmin([FromBody] ContactAdminDto model)
        {
            if (string.IsNullOrEmpty(model.Message))
            {
                return BadRequest("Message cannot be empty.");
            }

            // Assuming you have an admin email stored in your config
            var adminEmail = "localgpteam.staff@gmail.com"; 
            
            // Prepare the subject line with the sender's name
            var subject = $"Message from patient :  {model.SenderName}";

            // Send an email to the admin (use your email service)
            try
            {
                await _emailService.SendEmailAsync(adminEmail, subject, model.Message);
                return Ok(new { message = "Message sent successfully" });
            }
            catch (Exception ex)
            {
                // Log the exception and return an error response
                Console.WriteLine($"Error sending email: {ex.Message}");
                return StatusCode(500, "An error occurred while sending the message.");
            }
        }






    }
    
    }
