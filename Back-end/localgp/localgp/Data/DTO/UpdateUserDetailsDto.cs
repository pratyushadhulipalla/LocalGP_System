using System;
using System.Collections.Generic;

namespace localgp.Data.DTO
{
    public class UpdateUserDetailsDto
    {
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string UserName { get; set; }
        public string Email { get; set; }
        public string PhoneNumber { get; set; }
        public string Address { get; set; }
        public string City { get; set; }
        public string Country { get; set; }
        public string PostCode { get; set; }
        public DateTime DateOfBirth { get; set; }
        public string Gender { get; set; }
        public string? Specialization { get; set; }
        public int? YearsOfExperience { get; set; }
        public string Education { get; set; }
        public List<DoctorAvailabilityDto> Availability { get; set; }
        public string MedicalHistory { get; set; }
        
        public string LicenseNumber { get; set; }
    }

    public class DoctorAvailabilityDto
    {
        public string DayOfWeek { get; set; }
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
    }
}