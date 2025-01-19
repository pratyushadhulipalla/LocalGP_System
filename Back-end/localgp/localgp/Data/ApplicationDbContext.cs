using System;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using localgp.Models;

namespace localgp.Data
{
    public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }
        
        public DbSet<Doctor> Doctors { get; set; }
        // public DbSet<MedicalRecord> MedicalRecords { get; set; }
        public DbSet<Patient> Patients { get; set; }
        public DbSet<Appointment> Appointments { get; set; }
        
        public DbSet<DoctorAvailability> DoctorAvailabilities { get; set; }
        
        public DbSet<DoctorHoliday> DoctorHolidays { get; set; }
        
        public DbSet<Prescription> Prescriptions { get; set; }
        public DbSet<Pharmacy> Pharmacies { get; set; }
        public DbSet<Medicine> Medicines { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<Feedback> Feedbacks { get; set; }
        
        public DbSet<EmergencyContact> EmergencyContacts { get; set; }
        
        public DbSet<DoctorValidation> DoctorValidations { get; set; }

      
        
        
        
        
        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            // Fluent API configurations for ApplicationUser
            builder.Entity<ApplicationUser>()
                .HasIndex(u => u.Email)
                .IsUnique();
            
            // Configure relationships if necessary
            builder.Entity<Appointment>()
                .HasOne(a => a.Patient)
                .WithMany(p => p.Appointments)
                .HasForeignKey(a => a.PatientId);

            builder.Entity<Appointment>()
                .HasOne(a => a.Doctor)
                .WithMany(d => d.Appointments)
                .HasForeignKey(a => a.DoctorId);
            
            builder.Entity<Doctor>()
                .HasMany(d => d.Availabilities)
                .WithOne(a => a.Doctor)
                .HasForeignKey(a => a.DoctorId);
            
            builder.Entity<DoctorHoliday>()
                .HasOne(dh => dh.Doctor)
                .WithMany(d => d.Holidays)
                .HasForeignKey(dh => dh.DoctorId);
            
            builder.Entity<DoctorHoliday>()
                .Property(h => h.Date)
                .HasConversion(
                    v => v.ToUniversalTime(),
                    v => DateTime.SpecifyKind(v, DateTimeKind.Utc)
                );
            builder.Entity<DoctorAvailability>()
                .Property(d => d.StartTime)
                .HasConversion(v => v, v => TimeSpan.FromTicks(v.Ticks));

            builder.Entity<DoctorAvailability>()
                .Property(d => d.EndTime)
                .HasConversion(v => v, v => TimeSpan.FromTicks(v.Ticks));

            builder.Entity<DoctorAvailability>()
                .Property(d => d.Date)
                .HasColumnType("date"); // Ensure the date is stored correctly
            
            builder.Entity<Prescription>()
                .HasOne(p => p.Doctor)
                .WithMany(d => d.Prescriptions)
                .HasForeignKey(p => p.DoctorId);

            builder.Entity<Prescription>()
                .HasOne(p => p.Patient)
                .WithMany(pt => pt.Prescriptions)
                .HasForeignKey(p => p.PatientId);

            builder.Entity<Prescription>()
                .HasOne(p => p.Pharmacy)
                .WithMany(ph => ph.Prescriptions)
                .HasForeignKey(p => p.PharmacyId)
                .IsRequired(false);

            builder.Entity<Order>()
                .HasOne(o => o.Prescription)
                .WithMany(p => p.Orders)
                .HasForeignKey(o => o.PrescriptionId);

            builder.Entity<Order>()
                .HasOne(o => o.Patient)
                .WithMany(p => p.Orders)
                .HasForeignKey(o => o.PatientId);

            builder.Entity<Order>()
                .HasOne(o => o.Medicine)
                .WithMany(m => m.Orders)
                .HasForeignKey(o => o.MedicineId);
            
            builder.Entity<Feedback>()
                .HasOne(f => f.Appointment)
                .WithMany(a => a.Feedbacks)
                .HasForeignKey(f => f.AppointmentId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<Feedback>()
                .HasOne(f => f.Patient)
                .WithMany(p => p.Feedbacks)
                .HasForeignKey(f => f.PatientId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<Feedback>()
                .HasOne(f => f.Doctor)
                .WithMany(d => d.Feedbacks)
                .HasForeignKey(f => f.DoctorId)
                .OnDelete(DeleteBehavior.Restrict);
            
            builder.Entity<EmergencyContact>()
                .HasOne(ec => ec.User)
                .WithMany(u => u.EmergencyContacts)
                .HasForeignKey(ec => ec.UserId);
            
            builder.Entity<DoctorValidation>()
                .HasIndex(d => d.LicenseNumber)
                .IsUnique();
        }
        

            
            
        }
    }

