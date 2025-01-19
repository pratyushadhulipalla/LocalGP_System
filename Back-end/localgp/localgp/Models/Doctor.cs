using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;



namespace localgp.Models
{
    public class Doctor
    {
        [Key]
        public int Id { get; set; }

        [ForeignKey("ApplicationUser")]
        public string UserId { get; set; }
        public ApplicationUser User { get; set; }

        // Professional Information
        public string Specialization { get; set; }
        public int? YearsOfExperience { get; set; }
       
        public string Education { get; set; }
        public string LicenseNumber { get; set; }
        
        // Navigation property
        public ICollection<Appointment> Appointments { get; set; }
        
        public ICollection<DoctorAvailability> Availabilities { get; set; }
        
        public ICollection<DoctorHoliday> Holidays { get; set; }
        
        public ICollection<Prescription> Prescriptions { get; set; }
        
        public ICollection<Feedback> Feedbacks { get; set; } 
       
        
    }
    
    public class DoctorAvailability
    {
        public int Id { get; set; }
        public int DoctorId { get; set; }
        public DateTime Date { get; set; }
        public Doctor Doctor { get; set; }
        public string DayOfWeek { get; set; } // e.g., "Monday"
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
    }
    
    public class DoctorHoliday
    {
        public int Id { get; set; }
        public int DoctorId { get; set; }
        public Doctor Doctor { get; set; }
        public DateTime Date { get; set; }
    }
    public class AddAvailabilityDateModel
    {
        public DateTime Date { get; set; }
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
        
        public string DayOfWeek { get; set; }
    }

    
    
    
   


   




}