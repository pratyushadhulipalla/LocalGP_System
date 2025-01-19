using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace localgp.Models
{
    public class Appointment
    {
        [Key]
        public int Id { get; set; }

        [ForeignKey("Doctor")]
        public int DoctorId { get; set; }
        public Doctor Doctor { get; set; }

        [ForeignKey("Patient")]
        public int PatientId { get; set; }
        public Patient Patient { get; set; }

        public DateTime Date { get; set; }
        public TimeSpan Time { get; set; }
        public string Reason { get; set; }
        public string OtherReason { get; set; }
        public string Symptoms { get; set; }
        public string Status { get; set; }
        
        public string Mode { get; set; } // New field: "face-to-face" or "online"
        public string OnlineMeetingLink { get; set; } 
        
        public ICollection<Feedback> Feedbacks { get; set; } 
    }
}