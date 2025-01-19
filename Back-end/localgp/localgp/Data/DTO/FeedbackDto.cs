namespace localgp.Data.DTO;

public class FeedbackDto
{
    public int AppointmentId { get; set; }
    public int PatientId { get; set; }
    public int DoctorId { get; set; }
    public int Rating { get; set; }
    public string FeedbackText { get; set; }
}