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
    [Authorize(Roles = "Admin")]
    [Route("api/[controller]")]
    [ApiController]
    public class AdminController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;

        public AdminController(ApplicationDbContext context, UserManager<ApplicationUser> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboardData()
        {
            var doctorsCount = await _context.Doctors.CountAsync();
            var patientsCount = await _context.Patients.CountAsync();

            return Ok(new
            {
                DoctorsCount = doctorsCount,
                PatientsCount = patientsCount,
                Message = "Welcome to the Admin Dashboard"
            });
        }

        [HttpGet("upcoming-appointments")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetUpcomingAppointments()
        {
            try
            {
                var upcomingAppointments = await _context.Appointments
                    .Include(a => a.Doctor)
                    .ThenInclude(d => d.User)
                    .Include(a => a.Patient)
                    .ThenInclude(p => p.User)
                    .Where(a => a.Date >= DateTime.UtcNow)
                    .Select(a => new
                    {
                        a.Id,
                        a.Date,
                        a.Time,
                        DoctorName = a.Doctor.User.FirstName + " " + a.Doctor.User.LastName,
                        PatientName = a.Patient.User.FirstName + " " + a.Patient.User.LastName,
                        a.Reason
                    })
                    .ToListAsync();

                return Ok(upcomingAppointments);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetUpcomingAppointments: {ex}");
                return StatusCode(500, new { message = "An error occurred while fetching upcoming appointments" });
            }
        }

        [HttpGet("patients")]
        [Authorize(Roles = "Admin")]
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
                            p.User.Id,
                            p.User.FirstName,
                            p.User.LastName,
                            p.User.Email,
                            p.User.PhoneNumber,
                            p.User.Address,
                            p.User.City,
                            p.User.Country,
                            p.User.PostCode,
                            p.User.DateOfBirth,
                            p.User.Gender
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
        
        [HttpGet("doctors")]
        public async Task<IActionResult> GetDoctors()
        {
            var doctors = await _context.Doctors
                .Include(d => d.User)
                .Select(d => new
                {
                    d.Id,
                    User = new 
                    {
                        d.User.Id,
                        d.User.FirstName,
                        d.User.LastName,
                        d.User.Email,
                        d.User.PhoneNumber,
                        d.User.Address,
                        d.User.City,
                        d.User.Country,
                        d.User.PostCode,
                        d.User.DateOfBirth,
                        d.User.Gender
                    },
                    d.Specialization,
                    d.YearsOfExperience,
                    d.Education
                })
                .ToListAsync();

            return Ok(doctors);
        }
        
        [HttpGet("doctor/{doctorId}/patients")]
        public async Task<IActionResult> GetDoctorPatients(int doctorId)
        {
            try
            {
                var doctorPatients = await _context.Appointments
                    .Where(a => a.DoctorId == doctorId)
                    .Include(a => a.Patient)
                    .ThenInclude(p => p.User)
                    .Select(a => new
                    {
                        a.Patient.Id,
                        User = new
                        {
                            a.Patient.User.Id,
                            a.Patient.User.FirstName,
                            a.Patient.User.LastName,
                            a.Patient.User.Email,
                            a.Patient.User.PhoneNumber,
                            a.Patient.User.Address,
                            a.Patient.User.City,
                            a.Patient.User.Country,
                            a.Patient.User.PostCode,
                            a.Patient.User.DateOfBirth,
                            a.Patient.User.Gender
                        }
                    })
                    .Distinct()
                    .ToListAsync();

                return Ok(doctorPatients);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetDoctorPatients: {ex}");
                return StatusCode(500, new { message = "An error occurred while fetching doctor's patients" });
            }
        }
        [HttpGet("doctor/{doctorId}/appointments")]
        public async Task<IActionResult> GetDoctorAppointments(int doctorId)
        {
            try
            {
                var appointments = await _context.Appointments
                    .Include(a => a.Patient)
                    .ThenInclude(p => p.User)
                    .Where(a => a.DoctorId == doctorId)
                    .Select(a => new
                    {
                        a.Id,
                        a.Date,
                        a.Time,
                        PatientName = a.Patient.User.FirstName + " " + a.Patient.User.LastName,
                        a.Reason
                    })
                    .ToListAsync();
        
                return Ok(appointments);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetDoctorAppointments: {ex}");
                return StatusCode(500, new { message = "An error occurred while fetching doctor's appointments" });
            }
        }
        
        [HttpDelete("appointments/{appointmentId}")]
        public async Task<IActionResult> DeleteAppointment(int appointmentId)
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
        
                return NoContent();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in DeleteAppointment: {ex}");
                return StatusCode(500, new { message = "An error occurred while deleting the appointment" });
            }
        }

    


        [HttpGet("user-details/{userId}")]
        public async Task<IActionResult> GetUserDetails(string userId)
        {
            try
            {
                Console.WriteLine($"Fetching details for userId: {userId}");

                var user = await _context.Users
                    .Include(u => u.Doctor)
                    .Include(u => u.Patient)
                    .Where(u => u.Id == userId)
                    .Select(u => new
                    {
                        u.FirstName,
                        u.LastName,
                        u.UserName,
                        u.Email,
                        u.PhoneNumber,
                        u.Address,
                        u.City,
                        u.Country,
                        u.PostCode,
                        u.DateOfBirth,
                        u.Gender,
                        DoctorDetails = u.Doctor == null ? null : new
                        {
                            u.Doctor.Specialization,
                            u.Doctor.YearsOfExperience,
                            u.Doctor.Education,
                            u.Doctor.LicenseNumber
                        } ,
                        PatientDetails = u.Patient == null ? null : new
                        {
                            u.Patient.MedicalHistory
                        } 
                    })
                    .FirstOrDefaultAsync();

                if (user == null)
                {
                    Console.WriteLine("User not found");
                    return NotFound(new { message = "User not found" });
                }

                Console.WriteLine("User found");
                return Ok(user);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetUserDetails: {ex}");
                return StatusCode(500, new { message = "An error occurred while fetching user details" });
            }
        }
        
        

   [HttpPut("update-user-details/{UserId}")]
public async Task<IActionResult> UpdateUserDetails(string UserId, [FromBody] Dictionary<string, object> model)
{
    try
    {
        var user = await _userManager.Users
            .Include(u => u.Doctor)
            .Include(u => u.Patient)
            .FirstOrDefaultAsync(u => u.Id == UserId);

        if (user == null)
        {
            return NotFound(new { message = "User not found" });
        }

        // Update only provided fields
        if (model.ContainsKey("FirstName")) user.FirstName = model["FirstName"].ToString();
        if (model.ContainsKey("LastName")) user.LastName = model["LastName"].ToString();
        if (model.ContainsKey("UserName")) user.UserName = model["UserName"].ToString();
        if (model.ContainsKey("Email")) user.Email = model["Email"].ToString();
        if (model.ContainsKey("PhoneNumber")) user.PhoneNumber = model["PhoneNumber"].ToString();
        if (model.ContainsKey("Address")) user.Address = model["Address"].ToString();
        if (model.ContainsKey("City")) user.City = model["City"].ToString();
        if (model.ContainsKey("Country")) user.Country = model["Country"].ToString();
        if (model.ContainsKey("PostCode")) user.PostCode = model["PostCode"].ToString();
        if (model.ContainsKey("DateOfBirth")) user.DateOfBirth = Convert.ToDateTime(model["DateOfBirth"]);
        if (model.ContainsKey("Gender")) user.Gender = model["Gender"].ToString();

        if (user.Doctor != null)
        {
            if (model.ContainsKey("Specialization")) user.Doctor.Specialization = model["Specialization"].ToString();
            if (model.ContainsKey("YearsOfExperience")) user.Doctor.YearsOfExperience = Convert.ToInt32(model["YearsOfExperience"]);
            if (model.ContainsKey("Education")) user.Doctor.Education = model["Education"].ToString();
            if (model.ContainsKey("LicenseNumber")) user.Doctor.LicenseNumber = model["LicenseNumber"].ToString();
        }

        if (user.Patient != null && model.ContainsKey("MedicalHistory"))
        {
            user.Patient.MedicalHistory = model["MedicalHistory"].ToString();
        }

        var result = await _userManager.UpdateAsync(user);

        if (!result.Succeeded)
        {
            return StatusCode(500, new { message = "An error occurred while updating user details" });
        }

        await _context.SaveChangesAsync();

        return Ok(new { message = "User details updated successfully" });
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Error in UpdateUserDetails: {ex}");
        return StatusCode(500, new { message = "An error occurred while updating user details" });
    }
}


        
        [HttpGet("appointments-over-time")]
        public async Task<IActionResult> GetAppointmentsOverTime()
        {
            try
            {
                var appointmentData = await _context.Appointments
                    .GroupBy(a => a.Date.Date) // Group by date
                    .Select(g => new 
                    {
                        Date = g.Key,
                        Appointments = g.Count()
                    })
                    .OrderBy(data => data.Date)
                    .ToListAsync();

                // Format the data for the frontend
                var formattedData = appointmentData.Select(data => new 
                {
                    Date = data.Date.ToString("yyyy-MM-dd"), // Format date as string
                    Appointments = data.Appointments
                }).ToList();

                return Ok(formattedData);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error fetching appointments over time: {ex.Message}");
                return StatusCode(500, "An error occurred while fetching the data.");
            }
        }
        
        [HttpGet("appointments-by-specialization")]
        public async Task<IActionResult> GetAppointmentsBySpecialization()
        {
            try
            {
                // No need to use Include since Specialization is a direct property
                var specializationData = await _context.Appointments
                    .Include(a => a.Doctor) // Include the Doctor entity if you need other properties
                    .GroupBy(a => a.Doctor.Specialization) // Group by the Doctor's Specialization
                    .Select(g => new
                    {
                        Specialization = g.Key,
                        AppointmentsCount = g.Count()
                    })
                    .ToListAsync();

                return Ok(specializationData);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error fetching appointments by specialization: {ex.Message}");
                return StatusCode(500, "An error occurred while fetching the data.");
            }
        }
        
        [HttpGet("patients-age-distribution")]
        public async Task<IActionResult> GetPatientsAgeDistribution()
        {
            try
            {
                var users = await _context.Users
                    .ToListAsync(); // Fetch all users

                var ageDistributionData = users
                    .Select(u => new
                    {
                        Age = CalculateAge(u.DateOfBirth) // Calculate age directly
                    })
                    .GroupBy(u => new
                    {
                        AgeGroup = u.Age < 18 ? "0-17" :
                            u.Age < 30 ? "18-29" :
                            u.Age < 45 ? "30-44" :
                            u.Age < 60 ? "45-59" : "60+"
                    })
                    .Select(g => new
                    {
                        AgeGroup = g.Key.AgeGroup,
                        Count = g.Count()
                    })
                    .ToList();

                return Ok(ageDistributionData);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error fetching users' age distribution: {ex.Message}");
                return StatusCode(500, "An error occurred while fetching the data.");
            }
        }

        private int CalculateAge(DateTime dateOfBirth)
        {
            var today = DateTime.Today;
            var age = today.Year - dateOfBirth.Year;
            if (dateOfBirth.Date > today.AddYears(-age)) age--;
            return age;
        }


    }
}
