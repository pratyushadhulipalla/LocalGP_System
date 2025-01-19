using System.ComponentModel.DataAnnotations;

public class ContactAdminDto
{
    [Required(ErrorMessage = "Message is required")]
    [StringLength(1000, ErrorMessage = "Message can't be longer than 1000 characters")]
    public string Message { get; set; }
    
    [Required(ErrorMessage = "SenderName is required")]
    public string SenderName { get; set; }
}