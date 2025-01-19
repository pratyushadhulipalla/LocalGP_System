
using System;
using System.ComponentModel.DataAnnotations;
using System.Collections.Generic;
namespace localgp.Data.DTO
{
    public class DoctorModel
    {
        // Basic Information
        public string Username { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
        public string ConfirmPassword { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string PhoneNumber { get; set; }
        public string Address { get; set; }
        public string City { get; set; }
        public string Country { get; set; }
        public string PostCode { get; set; }
        private DateTime dateOfBirth;
        public DateTime DateOfBirth
        {
            get => dateOfBirth;
            set => dateOfBirth = DateTime.SpecifyKind(value, DateTimeKind.Utc);
        }
        public string Gender { get; set; }

        // Professional Information
        public string Specialization { get; set; }
        public int? YearsOfExperience { get; set; }
        public List<global::AvailabilityModel> Availability { get; set; } // Updated to List<string>
        public string Education { get; set; }
        public string LicenseNumber { get; set; }
    }
    
    public class AvailabilityModel
    {
        public string DayOfWeek { get; set; } // e.g., "Monday"
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
    }
    
    public class DoctorHolidayModel
    {
        public DateTime Date { get; set; }
    }
    
    public class AvailabilityEvent
    {
        public DateTime Date { get; set; }
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
        public bool IsHoliday { get; set; }
    }
}