using localgp.Models;

public class Order
{
    public int Id { get; set; }
    public int PrescriptionId { get; set; }
    public Prescription Prescription { get; set; }
    public int PatientId { get; set; }
    public Patient Patient { get; set; }
    public int MedicineId { get; set; }
    public Medicine Medicine { get; set; }
    public int Quantity { get; set; }
    public decimal TotalPrice { get; set; }
    public string PaymentStatus { get; set; }
    public string SessionId { get; set; } 
}