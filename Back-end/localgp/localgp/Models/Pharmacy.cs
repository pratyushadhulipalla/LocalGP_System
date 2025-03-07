using System.Collections.Generic;

public class Pharmacy
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string Address { get; set; }
    public string City { get; set; }
    public string State { get; set; }
    public string ZipCode { get; set; }
    public string ContactInfo { get; set; }
    public ICollection<Prescription> Prescriptions { get; set; }
}