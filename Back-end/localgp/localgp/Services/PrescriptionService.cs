using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using localgp.Data;
using Microsoft.EntityFrameworkCore;

public class PrescriptionService : IPrescriptionService
{
    private readonly ApplicationDbContext _context;
    private readonly EmailService _emailService;

    public PrescriptionService(ApplicationDbContext context, EmailService emailService)
    {
        _context = context;
        _emailService = emailService;
    }

    public async Task<Prescription> CreatePrescriptionAsync(PrescriptionDTO model)
    {
        var prescription = new Prescription
        {
            DoctorId = model.DoctorId,
            PatientId = model.PatientId,
            MedicineName = model.MedicineName,
            Dosage = model.Dosage,
            Duration = model.Duration,
            PharmacyId = model.PharmacyId,
            IsCollected = false
        };

        _context.Prescriptions.Add(prescription);
        await _context.SaveChangesAsync();
        return prescription;
    }

    public async Task<Prescription> GetPrescriptionByIdAsync(int id)
    {
        return await _context.Prescriptions
            .Include(p => p.Doctor)
            .Include(p => p.Patient)
            .Include(p => p.Pharmacy)
            .FirstOrDefaultAsync(p => p.Id == id);
    }

    public async Task<IEnumerable<Prescription>> GetPrescriptionsAsync()
    {
        return await _context.Prescriptions
            .Include(p => p.Doctor)
            .Include(p => p.Patient)
            .Include(p => p.Pharmacy)
            .ToListAsync();
    }

    public async Task<IEnumerable<Prescription>> GetPrescriptionsByPatientIdAsync(int patientId)
    {
        return await _context.Prescriptions
            .Where(p => p.PatientId == patientId)
            .Include(p => p.Doctor)
            .Include(p => p.Patient)
            .Include(p => p.Pharmacy)
            .ToListAsync();
    }

    public async Task SendPrescriptionNotificationAsync(int prescriptionId)
    {
        var prescription = await _context.Prescriptions
            .Include(p => p.Doctor)
            .Include(p => p.Patient)
            .Include(p => p.Pharmacy)
            .FirstOrDefaultAsync(p => p.Id == prescriptionId);

        if (prescription == null)
            throw new ArgumentException("Prescription not found");

        var message = $"Dear {prescription.Patient.User.FirstName},\n\n" +
                      $"Your prescription for {prescription.MedicineName} has been prepared. " +
                      $"You can collect it from {prescription.Pharmacy.Name} located at {prescription.Pharmacy.Address}.\n\n" +
                      $"Regards,\nLocalGP";

        await _emailService.SendEmailAsync(prescription.Patient.User.Email, "Your Prescription", message);
    }
}
