using Microsoft.AspNetCore.Mvc;
using localgp.Data;
using localgp.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Net.Http;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;


namespace localgp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AppointmentsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly EmailService _emailService;
        private readonly ZoomService _zoomService;
        

        public AppointmentsController(ApplicationDbContext context, EmailService emailService, ZoomService zoomService)
        {
            _context = context;
            _emailService = emailService;
            _zoomService = zoomService;
            
        }

        [HttpGet("doctors")]
        public async Task<IActionResult> GetDoctors()
        {
            var doctors = await _context.Doctors
                .Include(d => d.User)
                .Select(d => new
                {
                    d.Id,
                    Name = $"{d.User.FirstName} {d.User.LastName} ({d.Specialization})",
                    d.Specialization,
                    Availability = d.Availabilities
                })
                .ToListAsync();

            return Ok(doctors);
        }

        [HttpGet("patient/{patientId}/appointments")]
        public async Task<IActionResult> GetPatientAppointments(int patientId)
        {
            var appointments = await _context.Appointments
                .Where(a => a.PatientId == patientId)
                .ToListAsync();

            return Ok(appointments);
        }

        [HttpGet("doctor/{doctorId}/appointments")]
        public async Task<IActionResult> GetDoctorAppointments(int doctorId)
        {
            var appointments = await _context.Appointments
                .Where(a => a.DoctorId == doctorId)
                .Include(a => a.Patient) // Include the Patient entity
                .ThenInclude(p => p.User) // Assuming Patient has a related User entity for Name
                .ToListAsync();

            // Debugging: Log fetched appointments
            Console.WriteLine($"Fetched appointments for doctor {doctorId}: {appointments.Count}");

            var result = appointments.Select(a => new
            {
                a.Id,
                a.Date,
                a.Time,
                a.Reason,
                a.Status,
                PatientName = a.Patient.User.FirstName + " " + a.Patient.User.LastName, // Assuming the Patient entity has a User property
                a.Mode,
                a.OnlineMeetingLink,
                a.Symptoms,
                a.OtherReason
            });

            return Ok(result);
        }

        [HttpPost("book")]
public async Task<IActionResult> BookAppointment([FromBody] Appointment appointment)
{
    Console.WriteLine("BookAppointment method invoked");
    if (appointment == null)
    {
        return BadRequest("Invalid appointment data.");
    }

    if (appointment.Date < DateTime.UtcNow.Date || appointment.Date > DateTime.UtcNow.Date.AddMonths(3))
    {
        return BadRequest(new { message = "Appointment date must be within the next 3 months." });
    }

    try
    {
        // Log received appointment data for debugging
        Console.WriteLine($"Received appointment data: DoctorId={appointment.DoctorId}, PatientId={appointment.PatientId}, Date={appointment.Date}, Time={appointment.Time}, Mode={appointment.Mode}");
        
        appointment.Date = DateTime.SpecifyKind(appointment.Date, DateTimeKind.Utc);
        
        Console.WriteLine($"time: {appointment.Time} & {appointment.Date}");

        // Check if the appointment falls within the doctor's availability
        var doctorAvailability = await _context.DoctorAvailabilities
            .Where(a => a.DoctorId == appointment.DoctorId &&
                        a.DayOfWeek == appointment.Date.DayOfWeek.ToString())
            .ToListAsync();

        if (!doctorAvailability.Any(a => appointment.Time >= a.StartTime && appointment.Time <= a.EndTime))
        {
            return BadRequest(new { message = "The appointment time does not fall within the doctor's available time slots." });
        }

        // Check if the appointment time is already booked
        var existingAppointments = await _context.Appointments
            .Where(a => a.DoctorId == appointment.DoctorId && a.Date == appointment.Date &&
                        a.Time == appointment.Time)
            .ToListAsync();

        if (existingAppointments.Any())
        {
            return BadRequest(new { message = "The selected appointment time is already booked." });
        }

        // If online mode is selected, set the Google Meet link
        if (appointment.Mode == "online")
        {
            appointment.OnlineMeetingLink = "https://meet.google.com/landing?hs=197&authuser=0";
        }

        appointment.Status = "Booked";
        _context.Appointments.Add(appointment);
        await _context.SaveChangesAsync();

        // Send email notifications
        var patient = await _context.Patients.Include(p => p.User)
            .FirstOrDefaultAsync(p => p.Id == appointment.PatientId);
        
        
            var doctor = await _context.Doctors.Include(d => d.User)
                .FirstOrDefaultAsync(d => d.Id == appointment.DoctorId);
        

        if (patient != null && doctor != null)
        {
            var subject = "Appointment Confirmation";
            var message =
                $"Dear {patient.User.FirstName},<br/><br/>Your appointment with Dr. {doctor.User.FirstName} {doctor.User.LastName} has been booked successfully.<br/>Date: {appointment.Date.ToString("dd/MM/yyyy")}<br/>Time: {appointment.Time}<br/><br/>Thank you,<br/>Local GP";
            
            if (appointment.Mode == "online")
            {
                message += $"This is an online appointment. Please join the meeting using the following link: <a href=\"{appointment.OnlineMeetingLink}\">Join Meeting</a>";
            }
            
            await _emailService.SendEmailAsync(patient.User.Email, subject, message);

            if (appointment.Mode == "online")
            {

                // Also send email to the doctor
                var doctorMessage =
                    $"Dear Dr. {doctor.User.FirstName} {doctor.User.LastName},<br/><br/>You have an online appointment scheduled with {patient.User.FirstName} {patient.User.LastName}.<br/>Date: {appointment.Date.ToString("dd/MM/yyyy")}<br/>Time: {appointment.Time}<br/><br/>Please join the meeting using the following link: <a href=\"{appointment.OnlineMeetingLink}\">Join Meeting</a><br/><br/>Thank you,<br/>Local GP";
                await _emailService.SendEmailAsync(doctor.User.Email, subject, doctorMessage);
            }

            
        }

        return Ok(new { message = "Appointment booked successfully" });
    }
    catch (DbUpdateException dbEx)
    {
        // Log detailed error message including inner exception
        Console.WriteLine($"An error occurred while saving the entity changes: {dbEx.Message}");
        if (dbEx.InnerException != null)
        {
            Console.WriteLine($"Inner exception: {dbEx.InnerException.Message}");
        }

        return StatusCode(500, "An error occurred while saving the entity changes. See the inner exception for details.");
    }
    catch (Exception ex)
    {
        // Log detailed error message for general exceptions
        Console.WriteLine($"An unexpected error occurred: {ex.Message}");
        if (ex.InnerException != null)
        {
            Console.WriteLine($"Inner exception: {ex.InnerException.Message}");
        }

        return StatusCode(500, "An unexpected error occurred. See the inner exception for details.");
    }
}

        
        [Authorize(Roles = "Patient")]
[HttpPut("patient/update/{appointmentId}")]
public async Task<IActionResult> UpdatePatientAppointment(int appointmentId, [FromBody] Appointment updatedAppointment)
{
    try
    {
        // Validate the incoming data
        if (updatedAppointment == null || updatedAppointment.PatientId == null)
        {
            return BadRequest("Invalid appointment data.");
        }

        // Fetch the existing appointment
        var appointment = await _context.Appointments
            .FirstOrDefaultAsync(a => a.Id == appointmentId);

        if (appointment == null)
        {
            return NotFound(new { message = "Appointment not found" });
        }

      

        // Check if the new date and time are valid and not in the past
        if (updatedAppointment.Date < DateTime.UtcNow.Date)
        {
            return BadRequest(new { message = "Appointment date cannot be in the past." });
        }

        // Convert existing and new dates to UTC for consistency
        appointment.Date = DateTime.SpecifyKind(appointment.Date, DateTimeKind.Utc);
        updatedAppointment.Date = DateTime.SpecifyKind(updatedAppointment.Date, DateTimeKind.Utc);

        // Check if the new time slot is within the doctor's availability
        var doctorAvailability = await _context.DoctorAvailabilities
            .Where(a => a.DoctorId == appointment.DoctorId && a.DayOfWeek == updatedAppointment.Date.DayOfWeek.ToString())
            .ToListAsync();

        if (!doctorAvailability.Any(a => updatedAppointment.Time >= a.StartTime && updatedAppointment.Time <= a.EndTime))
        {
            return BadRequest(new { message = "The appointment time does not fall within the doctor's available time slots." });
        }

        // Check if the new time slot is already booked
        var existingAppointments = await _context.Appointments
            .Where(a => a.DoctorId == appointment.DoctorId && a.Date == updatedAppointment.Date && a.Time == updatedAppointment.Time && a.Id != appointmentId)
            .ToListAsync();

        if (existingAppointments.Any())
        {
            return BadRequest(new { message = "The selected appointment time is already booked." });
        }

        // Update the appointment details
        appointment.Date = updatedAppointment.Date;
        appointment.Time = updatedAppointment.Time;
        appointment.Reason = updatedAppointment.Reason;
        appointment.Symptoms = updatedAppointment.Symptoms;
        appointment.OtherReason = updatedAppointment.OtherReason;
        appointment.Mode = updatedAppointment.Mode;

        await _context.SaveChangesAsync();
        
        
        // Send email notifications
        var patient = await _context.Patients.Include(p => p.User)
            .FirstOrDefaultAsync(p => p.Id == appointment.PatientId);
        
        
        var doctor = await _context.Doctors.Include(d => d.User)
            .FirstOrDefaultAsync(d => d.Id == appointment.DoctorId);


        if (patient != null && doctor != null)
        {
            var subject = "Updated Appointment Confirmation";
            var message =
                $"Dear {patient.User.FirstName},<br/><br/>Your updated appointment with Dr. {doctor.User.FirstName} {doctor.User.LastName} has been booked successfully.<br/>Date: {appointment.Date.ToString("dd/MM/yyyy")}<br/>Time: {appointment.Time}<br/><br/>Thank you,<br/>Local GP";

            if (appointment.Mode == "online")
            {
                message +=
                    $"This is an online appointment. Please join the meeting using the following link: <a href=\"{appointment.OnlineMeetingLink}\">Join Meeting</a>";
            }

            await _emailService.SendEmailAsync(patient.User.Email, subject, message);

            if (appointment.Mode == "online")
            {

                // Also send email to the doctor
                var doctorMessage =
                    $"Dear Dr. {doctor.User.FirstName} {doctor.User.LastName},<br/><br/>You have an online appointment scheduled with {patient.User.FirstName} {patient.User.LastName}.<br/>Date: {appointment.Date.ToString("dd/MM/yyyy")}<br/>Time: {appointment.Time}<br/><br/>Please join the meeting using the following link: <a href=\"{appointment.OnlineMeetingLink}\">Join Meeting</a><br/><br/>Thank you,<br/>Local GP";
                await _emailService.SendEmailAsync(doctor.User.Email, subject, doctorMessage);
            }
        }

        return Ok(new { message = "Appointment updated successfully" });
    }
    catch (DbUpdateException dbEx)
    {
        Console.WriteLine($"Database update error: {dbEx.Message}");
        if (dbEx.InnerException != null)
        {
            Console.WriteLine($"Inner exception: {dbEx.InnerException.Message}");
        }
        return StatusCode(500, "A database error occurred. See the inner exception for details.");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"An unexpected error occurred: {ex.Message}");
        if (ex.InnerException != null)
        {
            Console.WriteLine($"Inner exception: {ex.InnerException.Message}");
        }
        return StatusCode(500, "An unexpected error occurred. See the inner exception for details.");
    }
}


        [HttpDelete("cancel/{id}")]
        public async Task<IActionResult> CancelAppointment(int id)
        {
            var appointment = await _context.Appointments.FindAsync(id);
            if (appointment == null)
            {
                return NotFound(new { message = "Appointment not found" });
            }

            _context.Appointments.Remove(appointment);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Appointment cancelled successfully" });
        }

        [HttpGet("doctor/{doctorId}/availability")]
        public async Task<IActionResult> GetDoctorAvailability(int doctorId)
        {
            var availability = await _context.DoctorAvailabilities
                .Where(a => a.DoctorId == doctorId)
                .Select(a => new
                {
                    a.DayOfWeek,
                    StartTime = a.StartTime.ToString(@"hh\:mm"),
                    EndTime = a.EndTime.ToString(@"hh\:mm")
                })
                .ToListAsync();

            if (availability.Count == 0)
            {
                return NotFound(new { message = $"No availability found for doctor with ID {doctorId}" });
            }

            Console.WriteLine($"Fetched availability for doctor {doctorId}: {availability.Count} slots");

            return Ok(availability);
        }

        [HttpGet("doctor/{doctorId}/booked-slots")]
        public async Task<IActionResult> GetBookedSlots(int doctorId, [FromQuery] DateTime date)
        {
            
            date = DateTime.SpecifyKind(date, DateTimeKind.Utc);
            
            var bookedSlots = await _context.Appointments
                .Where(a => a.DoctorId == doctorId && a.Date == date)
                .Select(a => new
                {
                    a.Time
                })
                .ToListAsync();

            Console.WriteLine(
                $"Fetched {bookedSlots.Count} booked slots for doctor {doctorId} on {date.ToShortDateString()}");

            return Ok(bookedSlots);
        }
        
        [Authorize]
        [HttpGet("patient/{patientId}/past-appointments")]
        public async Task<IActionResult> GetPastAppointments(int patientId)
        {
            var pastAppointments = await _context.Appointments
                .Where(a => a.PatientId == patientId && a.Date < DateTime.UtcNow)
                .Include(a => a.Doctor)
                .ThenInclude(d => d.User)
                .ToListAsync();

            var result = pastAppointments.Select(a => new
            {
                AppointmentId = a.Id,
                DoctorId = a.DoctorId,
                Date = a.Date.ToString("dd/MM/yyyy"),
                Time = a.Time.ToString(@"hh\:mm"),
                DoctorName = a.Doctor.User.FirstName + " " + a.Doctor.User.LastName,
               
            });

            return Ok(result);
        }
        
        [Authorize(Roles = "Doctor")]
        [HttpPut("update/{id}")]
        public async Task<IActionResult> UpdateAppointment(int id, [FromBody] Appointment updatedAppointment)
        {
            var appointment = await _context.Appointments
                .Include(a => a.Patient)
                .ThenInclude(p => p.User)
                .Include(a => a.Doctor)
                .ThenInclude(d => d.User)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (appointment == null)
            {
                return NotFound(new { message = "Appointment not found" });
            }

            // Ensure the DateTime is in UTC
            if (updatedAppointment.Date.Kind == DateTimeKind.Unspecified)
            {
                updatedAppointment.Date = DateTime.SpecifyKind(updatedAppointment.Date, DateTimeKind.Utc);
            }
            else
            {
                updatedAppointment.Date = updatedAppointment.Date.ToUniversalTime();
            }

            // Update the appointment date and time
            appointment.Date = updatedAppointment.Date;
            appointment.Time = updatedAppointment.Time;

            try
            {
                await _context.SaveChangesAsync();

                // Send email notification if patient and doctor details are available
                if (appointment.Patient?.User != null && appointment.Doctor?.User != null)
                {
                    var subject = "Updated Appointment Details";
                    var message = $"Dear {appointment.Patient.User.FirstName},<br/><br/>Your appointment with Dr. {appointment.Doctor.User.FirstName} {appointment.Doctor.User.LastName} has been updated.<br/>New Date: {appointment.Date.ToString("dd/MM/yyyy")}<br/>New Time: {appointment.Time}<br/><br/>Thank you,<br/>Local GP";
                    await _emailService.SendEmailAsync(appointment.Patient.User.Email, subject, message);
                }

                return Ok(new { message = "Appointment updated successfully" });
            }
            catch (DbUpdateException ex)
            {
                return StatusCode(500, new { message = "Error updating appointment", details = ex.Message });
            }
        }
        
        [HttpGet("doctor/{doctorId}/past-appointments")]
        public async Task<IActionResult> GetDoctorPastAppointments(int doctorId)
        {
            var pastAppointments = await _context.Appointments
                .Where(a => a.DoctorId == doctorId && a.Date < DateTime.UtcNow) // Fetch past appointments
                .Select(a => new
                {
                    a.Id,
                    a.Date,
                    a.Time,
                    a.Reason,
                    PatientName = a.Patient.User.FirstName + " " + a.Patient.User.LastName, // Assuming there's a related User entity
                    Feedback = _context.Feedbacks
                        .Where(f => f.AppointmentId == a.Id)
                        .Select(f => new
                        {
                            f.Rating,
                            f.FeedbackText
                        }).FirstOrDefault() // Get the first matching feedback, if any
                })
                .ToListAsync();

            return Ok(pastAppointments);
        }














    }
}
