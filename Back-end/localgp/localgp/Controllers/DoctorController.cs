using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using localgp.Models;
using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using localgp.Data;
using localgp.Data.DTO;
using System.Linq;

namespace localgp.Controllers
{
    [Authorize(Roles = "Doctor")]
    [Route("api/[controller]")]
    [ApiController]
    public class DoctorController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly ApplicationDbContext _context;
        private readonly EmailService _emailService;

        public DoctorController(UserManager<ApplicationUser> userManager, ApplicationDbContext context, EmailService emailService)
        {
            _userManager = userManager;
            _context = context;
            _emailService = emailService;
        }

        [HttpGet("details")]
        [Authorize]
        public async Task<IActionResult> GetUserDetails()
        {
            try
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

                var userDetails = new UserDetailsDTO
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
                    LicenseNumber = userWithDoctor.Doctor?.LicenseNumber,
                   
                    Availability = userWithDoctor.Doctor?.Availabilities.Select(a => new AvailabilityModel
                    {
                        DayOfWeek = a.DayOfWeek,
                        StartTime = a.StartTime,
                        EndTime = a.EndTime
                    }).ToList()
                };

                return Ok(userDetails);
            }
            catch (Exception ex)
            {
                // Log the error (you can use any logging framework here)
                Console.WriteLine($"Error in GetUserDetails: {ex.Message}");
                return StatusCode(500, new { message = "An error occurred while fetching user details" });
            }
        }

        [HttpPut("update")]
        [Authorize]
        public async Task<IActionResult> UpdateUserDetails([FromBody] DoctorModel model)
        {
            try
            {
                Console.WriteLine("Incoming update request:", model);

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
                    await _context.SaveChangesAsync();
                    return Ok(new { message = "User details updated successfully" });
                }

                return BadRequest(result.Errors);
            }
            catch (Exception ex)
            {
                // Log the error
                Console.WriteLine($"Error in UpdateUserDetails: {ex.Message}");
                return StatusCode(500, new { message = "An error occurred while updating user details" });
            }
        }

        [HttpGet("upcoming-appointments")]
        [Authorize]
        public async Task<IActionResult> GetUpcomingAppointments()
        {
            try
            {
                var username = User.Identity.Name; // Get the username from the token
                Console.WriteLine($"Fetching upcoming appointments for username: {username}");

                var user = await _userManager.FindByNameAsync(username);
                if (user == null)
                {
                    return NotFound(new { message = $"User not found for username: {username}" });
                }

                var doctor = await _context.Doctors.FirstOrDefaultAsync(d => d.UserId == user.Id);
                if (doctor == null)
                {
                    return NotFound(new { message = "Doctor not found" });
                }

                var upcomingAppointments = await _context.Appointments
                    .Where(a => a.DoctorId == doctor.Id && a.Date >= DateTime.UtcNow)
                    .Select(a => new
                    {
                        a.Id,
                        a.Date,
                        a.Time,
                        PatientName = a.Patient.User.FirstName + " " + a.Patient.User.LastName
                    })
                    .ToListAsync();

                return Ok(upcomingAppointments);
            }
            catch (Exception ex)
            {
                // Log the error
                Console.WriteLine($"Error in GetUpcomingAppointments: {ex.Message}");
                return StatusCode(500, new { message = "An error occurred while fetching upcoming appointments" });
            }
        }
        
       


        [HttpDelete("cancel-appointment/{appointmentId}")]
        [Authorize]
        public async Task<IActionResult> CancelAppointment(int appointmentId)
        {
            try
            {
                var appointment = await _context.Appointments.FindAsync(appointmentId);

                if (appointment == null)
                {
                    return NotFound(new { message = "Appointment not found" });
                }

                _context.Appointments.Remove(appointment);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Appointment cancelled successfully" });
            }
            catch (Exception ex)
            {
                // Log the error
                Console.WriteLine($"Error in CancelAppointment: {ex.Message}");
                return StatusCode(500, new { message = "An error occurred while cancelling the appointment" });
            }
        }

        [HttpPut("update-availability")]
        [Authorize(Roles = "Doctor")]
        public async Task<IActionResult> UpdateAvailability([FromBody] List<AvailabilityModel> availability)
        {
            var username = User.Identity.Name;
            var user = await _userManager.FindByNameAsync(username);
            if (user == null)
            {
                return NotFound(new { message = $"User not found for username: {username}" });
            }

            var doctor = await _context.Doctors.Include(d => d.Availabilities).FirstOrDefaultAsync(d => d.UserId == user.Id);
            if (doctor == null)
            {
                return NotFound(new { message = "Doctor not found" });
            }

            // Clear existing availabilities
            _context.DoctorAvailabilities.RemoveRange(doctor.Availabilities);

            // Add new availabilities
            foreach (var a in availability)
            {
                doctor.Availabilities.Add(new DoctorAvailability
                {
                    DayOfWeek = a.DayOfWeek,
                    StartTime = a.StartTime,
                    EndTime = a.EndTime
                });
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "Availability updated successfully" });
        }
        
        
        
        [HttpPost("add-availability-date")]
        [Authorize(Roles = "Doctor")]
        public async Task<IActionResult> AddAvailabilityDate([FromBody] AddAvailabilityDateModel model)
        {
            try
            {
                var username = User.Identity.Name;
                var user = await _userManager.FindByNameAsync(username);
                if (user == null)
                {
                    return NotFound(new { message = $"User not found for username: {username}" });
                }

                var doctor = await _context.Doctors.Include(d => d.Availabilities).FirstOrDefaultAsync(d => d.UserId == user.Id);
                if (doctor == null)
                {
                    return NotFound(new { message = "Doctor not found" });
                }

                if (model.Date == null)
                {
                    return BadRequest(new { message = "Date cannot be null" });
                }

                if (model.StartTime == null || model.EndTime == null)
                {
                    return BadRequest(new { message = "Start and End times cannot be null" });
                }
                
                
                // Check for existing availability on the same date
                var existingAvailability = doctor.Availabilities.FirstOrDefault(a => a.Date.Date == model.Date.Date);
                if (existingAvailability != null)
                {
                    return BadRequest(new { message = "Availability already exists for this date" });
                }

                var availability = new DoctorAvailability
                {
                    Date = model.Date,
                    StartTime = model.StartTime,
                    EndTime = model.EndTime,
                    DayOfWeek = model.Date.DayOfWeek.ToString(),
                    DoctorId = doctor.Id
                };

                doctor.Availabilities.Add(availability);
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    date = availability.DayOfWeek,
                    startTime = availability.StartTime,
                    endTime = availability.EndTime,
                    dayOfWeek = availability.DayOfWeek,
                    isHoliday = false
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in AddAvailabilityDate: {ex}");
                return StatusCode(500, new { message = $"An error occurred while adding availability: {ex.Message}" });
            }
        }


        [HttpPost("add-holiday")]
        [Authorize(Roles = "Doctor")]
        public async Task<IActionResult> AddHoliday([FromBody] DoctorHolidayModel model)
        {
            try
            {
                var username = User.Identity.Name;
                var user = await _userManager.FindByNameAsync(username);
                if (user == null)
                {
                    return NotFound(new { message = $"User not found for username: {username}" });
                }

                var doctor = await _context.Doctors.Include(d => d.Holidays)
                    .FirstOrDefaultAsync(d => d.UserId == user.Id);
                if (doctor == null)
                {
                    return NotFound(new { message = "Doctor not found" });
                }

                // Convert the date to UTC
                var holidayDate = DateTime.SpecifyKind(model.Date, DateTimeKind.Utc);

                Console.WriteLine($"Adding holiday for doctor {doctor.Id} on {holidayDate}");

                if (doctor.Holidays.Any(h => h.Date.Date == holidayDate.Date))
                {
                    return BadRequest(new { message = "Holiday already exists for this date" });
                }

                doctor.Holidays.Add(new DoctorHoliday
                {
                    Date = holidayDate,
                    DoctorId = doctor.Id
                });

                await _context.SaveChangesAsync();

                return Ok(new { message = "Holiday added successfully" });
            }
            catch (Exception ex)
            {
                // Log the error with detailed information
                Console.WriteLine($"Error in AddHoliday: {ex.Message}");
                Console.WriteLine(ex.StackTrace);
                return StatusCode(500, new { message = "An error occurred while adding the holiday" });
            }
        }

        [HttpDelete("delete-holiday/{date}")]
        [Authorize(Roles = "Doctor")]
        public async Task<IActionResult> DeleteHoliday(DateTime date)
        {
            try
            {
                var username = User.Identity.Name;
                var user = await _userManager.FindByNameAsync(username);
                if (user == null)
                {
                    return NotFound(new { message = $"User not found for username: {username}" });
                }

                var doctor = await _context.Doctors.Include(d => d.Holidays).FirstOrDefaultAsync(d => d.UserId == user.Id);
                if (doctor == null)
                {
                    return NotFound(new { message = "Doctor not found" });
                }

                var holiday = doctor.Holidays.FirstOrDefault(h => h.Date.Date == date.Date);
                if (holiday == null)
                {
                    return NotFound(new { message = "Holiday not found" });
                }

                _context.DoctorHolidays.Remove(holiday);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Holiday deleted successfully" });
            }
            catch (Exception ex)
            {
                // Log the error
                Console.WriteLine($"Error in DeleteHoliday: {ex}");
                return StatusCode(500, new { message = "An error occurred while deleting the holiday: {ex.Message}" });
            }
        }

     [HttpGet("availability")]
[Authorize]
public async Task<IActionResult> GetAvailability()
{
    try
    {
        var username = User.Identity.Name;
        var user = await _userManager.FindByNameAsync(username);
        if (user == null)
        {
            return NotFound(new { message = $"User not found for username: {username}" });
        }

        var doctor = await _context.Doctors
            .Include(d => d.Availabilities)
            .Include(d => d.Holidays)
            .FirstOrDefaultAsync(d => d.UserId == user.Id);

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
        Console.WriteLine($"Error in GetAvailability: {ex}");
        return StatusCode(500, new { message = $"An error occurred while fetching availability: {ex.Message}" });
    }
}


        [HttpPost("add-update-availability")]
        [Authorize]
        public async Task<IActionResult> AddUpdateAvailability([FromBody] AvailabilityModel model)
        {
            try
            {
            var username = User.Identity.Name;
            var user = await _userManager.FindByNameAsync(username);
            if (user == null)
            {
                return NotFound(new { message = $"User not found for username: {username}" });
            }

            var doctor = await _context.Doctors.Include(d => d.Availabilities)
                .FirstOrDefaultAsync(d => d.UserId == user.Id);
            if (doctor == null)
            {
                return NotFound(new { message = "Doctor not found" });
            }

            var availability = doctor.Availabilities.FirstOrDefault(a => a.DayOfWeek == model.DayOfWeek);
            if (availability != null)
            {
                availability.StartTime = model.StartTime;
                availability.EndTime = model.EndTime;
            }
            else
            {
                doctor.Availabilities.Add(new DoctorAvailability
                {
                    DayOfWeek = model.DayOfWeek,
                    StartTime = model.StartTime,
                    EndTime = model.EndTime,
                    DoctorId = doctor.Id
                });
            }

            await _context.SaveChangesAsync();

            return Ok(new { message = "Availability added/updated successfully" });
        }
        catch (Exception ex)
        {
            // Log the error
            Console.WriteLine($"Error in AddUpdateAvailability: {ex.Message}");
            return StatusCode(500, new { message = "An error occurred while updating availability" });
        }
        
        }
        
        
        [HttpDelete("delete-availability/{date}")]
        [Authorize(Roles = "Doctor")]
        public async Task<IActionResult> DeleteAvailability(DateTime date)
        {
            try
            {
                var username = User.Identity.Name;
                var user = await _userManager.FindByNameAsync(username);
                if (user == null)
                {
                    return NotFound(new { message = $"User not found for username: {username}" });
                }

                var doctor = await _context.Doctors.Include(d => d.Availabilities).FirstOrDefaultAsync(d => d.UserId == user.Id);
                if (doctor == null)
                {
                    return NotFound(new { message = "Doctor not found" });
                }

                var availability = doctor.Availabilities.FirstOrDefault(a => a.Date == date);
                if (availability == null)
                {
                    return NotFound(new { message = "Availability not found" });
                }

                _context.DoctorAvailabilities.Remove(availability);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Availability deleted successfully" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in DeleteAvailability: {ex}");
                return StatusCode(500, new { message = "An error occurred while deleting the availability" });
            }
        }
        
        [HttpGet("patients")]
        [Authorize(Roles = "Doctor")]
        public async Task<IActionResult> GetPatients()
        {
            try
            {
                var patients = await _context.Patients
                    .Include(p => p.User)
                    .Select(p => new
                    {
                        p.Id,
                        User = new
                        {
                           
                            p.User.FirstName,
                            p.User.LastName,
                          
                        }
                    })
                    .ToListAsync();

                return Ok(patients);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetPatients: {ex}");
                return StatusCode(500, new { message = "An error occurred while fetching patients" });
            }
        }
        
        [HttpGet ("medicines")]
        public async Task<ActionResult<IEnumerable<Medicine>>> GetMedicines()
        {
            var medicines = await _context.Medicines
                .Select(m => new
                {
                    m.Id,
                    m.Name,
                    m.StockQuantity,
                    m.Description,
                    m.Price
                })
                .ToListAsync();

            return Ok(medicines);
        }
        
        
        [HttpGet ("pharmacies")]
        public async Task<IActionResult> GetPharmacies()
        {
            var pharmacies = await _context.Pharmacies.ToListAsync();
            return Ok(pharmacies);
        }
        
        [Authorize(Roles = "Doctor")]
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
            var subject = $"Message from {model.SenderName}";

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
