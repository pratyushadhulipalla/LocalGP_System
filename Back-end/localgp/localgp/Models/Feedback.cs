namespace localgp.Models;

public class Feedback
{
    public int Id { get; set; }
    public int AppointmentId { get; set; }
    public int PatientId { get; set; }
    public int DoctorId { get; set; }
    public int Rating { get; set; } // Assuming a 1 to 5 rating scale
    public string FeedbackText { get; set; }

    public Appointment Appointment { get; set; }
    public Patient Patient { get; set; }
    public Doctor Doctor { get; set; }
}