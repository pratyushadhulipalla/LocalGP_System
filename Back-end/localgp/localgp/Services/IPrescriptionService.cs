using System.Collections.Generic;
using System.Threading.Tasks;

public interface IPrescriptionService
{
    Task<Prescription> CreatePrescriptionAsync(PrescriptionDTO model);
    Task<Prescription> GetPrescriptionByIdAsync(int id);
    Task<IEnumerable<Prescription>> GetPrescriptionsAsync();
    Task<IEnumerable<Prescription>> GetPrescriptionsByPatientIdAsync(int patientId);
    Task SendPrescriptionNotificationAsync(int prescriptionId);
}