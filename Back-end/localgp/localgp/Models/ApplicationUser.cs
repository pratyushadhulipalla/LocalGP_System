using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace localgp.Models
{
    public class ApplicationUser : IdentityUser
    {
        public string FirstName { get; set; }
        public string LastName { get; set; }
        private DateTime dateOfBirth;
        public DateTime DateOfBirth
        {
            get => dateOfBirth;
            set => dateOfBirth = DateTime.SpecifyKind(value, DateTimeKind.Utc);
        }
        public string Gender { get; set; }
        public string Address { get; set; }
        public string City { get; set; }
        public string Country { get; set; }
        public string PostCode { get; set; }
        [Required]
        [EmailAddress]
        public override string Email { get; set; }
        
        // Add a property for Role
        public string Role { get; set; }
        
        // Navigation property for Doctor
        public  Doctor Doctor { get; set; }
        
        public Patient Patient { get; set; }
        
        public ICollection<EmergencyContact> EmergencyContacts { get; set; }
    
    }
}