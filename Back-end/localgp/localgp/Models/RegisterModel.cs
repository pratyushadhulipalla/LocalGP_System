using System;
using System.ComponentModel.DataAnnotations;

namespace localgp.Models
{
    public class RegisterModel
    {
        [Required]
        public string FirstName { get; set; }
        [Required]
        public string LastName { get; set; }
        [Required]
        public string Username { get; set; }
        [Required]
        [EmailAddress]
        public string Email { get; set; }
        [Required]
        [DataType(DataType.Password)]
        public string Password { get; set; }
        [Required]
        [Compare("Password", ErrorMessage = "Passwords do not match")]
        [DataType(DataType.Password)]
        public string ConfirmPassword { get; set; }
        
        private DateTime dateOfBirth;
        [Required]
        public DateTime DateOfBirth
        {
            get => dateOfBirth;
            set => dateOfBirth = DateTime.SpecifyKind(value, DateTimeKind.Utc);
        }
        
        [Required]
        public string Gender { get; set; }
        [Required]
        public string Phone { get; set; }
        [Required]
        public string Address { get; set; }
        [Required]
        public string City { get; set; }
        [Required]
        public string Country { get; set; }
        [Required]
        public string PostCode { get; set; }
        public string Role { get; set; }  

    }
}