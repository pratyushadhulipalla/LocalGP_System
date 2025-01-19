namespace localgp.Models;

public class EmergencyContact
{
    public int Id { get; set; }
    public string UserId { get; set; }  
    public string ContactName { get; set; }
    public string Relation { get; set; }
    public string MobileNumber { get; set; }
    public string Address { get; set; }

    public ApplicationUser User { get; set; }  // Navigation property
}