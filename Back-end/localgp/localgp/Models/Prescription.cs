using System.Collections.Generic;
using localgp.Models;

public class Prescription
{
    public int Id { get; set; }
    public int DoctorId { get; set; }
    public Doctor Doctor { get; set; }
    public int PatientId { get; set; }
    public Patient Patient { get; set; }
    public string MedicineName { get; set; }
    public string Dosage { get; set; }
    public string Duration { get; set; }
    public int? PharmacyId { get; set; }
    public Pharmacy Pharmacy { get; set; }
    public bool IsCollected { get; set; }
    
    public ICollection<Order> Orders { get; set; }
}