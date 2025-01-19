using System.ComponentModel.DataAnnotations;

namespace localgp.Models
{
    public class ForgotPasswordModel
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; }
    }
}