
using System.ComponentModel.DataAnnotations;

public class DoctorValidation
{
    public int Id { get; set; }

    [Required]
    [MaxLength(50)]
    public string FirstName { get; set; }

    [Required]
    [MaxLength(50)]
    public string LastName { get; set; }

    [Required]
    [MaxLength(20)]
    public string LicenseNumber { get; set; }
}