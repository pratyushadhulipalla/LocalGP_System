using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace localgp.Models
{
    public class Patient
    {
        [Key]
        public int Id { get; set; }

        [ForeignKey("ApplicationUser")]
        public string UserId { get; set; }
        public ApplicationUser User { get; set; }

        // Personal Information
        public string MedicalHistory { get; set; }

        public ICollection<Appointment> Appointments { get; set; }
        public ICollection<Prescription> Prescriptions { get; set; }
        public ICollection<Order> Orders { get; set; }
        
        public ICollection<Feedback> Feedbacks { get; set; }
    }
}