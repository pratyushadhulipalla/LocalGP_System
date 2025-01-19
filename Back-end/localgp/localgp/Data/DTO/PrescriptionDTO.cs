using System.Collections.Generic;

public class PrescriptionDTO
{
    public int DoctorId { get; set; }
    public int PatientId { get; set; }
    public int AppointmentId { get; set; } 
    public string MedicineName { get; set; }
    public string Dosage { get; set; }
    public string Duration { get; set; }
    public int? PharmacyId { get; set; }
    public string PurchaseOption { get; set; } 
    
    public List<PrescriptionDetailDTO> Prescriptions { get; set; }

}

public class PrescriptionDetailDTO
{
    public string Medicine { get; set; }
    public string Dosage { get; set; }
    public string Duration { get; set; }
}