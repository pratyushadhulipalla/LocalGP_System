    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Security.Claims;
    using Microsoft.AspNetCore.Authorization;
    using Microsoft.AspNetCore.Mvc;
    using localgp.Data;
    using localgp.Models;
    using System.Threading.Tasks;
    using Microsoft.EntityFrameworkCore;
    using localgp.Data.DTO;
    using Stripe;
    using Stripe.Checkout;
    using Microsoft.Extensions.Configuration;
    using System.IO;

    [ApiController]
    [Route("api/[controller]")]
    public class PrescriptionController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly EmailService _emailService;
        private readonly IStripeService _stripeService;
        private readonly IConfiguration _configuration;

        public PrescriptionController(ApplicationDbContext context, EmailService emailService, IStripeService stripeService, IConfiguration configuration)
        {
            _context = context;
            _emailService = emailService;
            _stripeService = stripeService;
            _configuration = configuration;
        }

        [Authorize(Roles = "Doctor")]
        [HttpPost("create")]
        public async Task<IActionResult> CreatePrescription([FromBody] PrescriptionDTO model)
        {
            if (model.PatientId <= 0 || !model.Prescriptions.Any())
            {
                return BadRequest(new { message = "Invalid patient or prescriptions." });
            }

            var patient = await _context.Patients.Include(p => p.User).FirstOrDefaultAsync(p => p.Id == model.PatientId);

            if (patient == null)
            {
                return BadRequest(new { message = "Invalid patient." });
            }

            var newPrescriptions = model.Prescriptions.Select(p => new Prescription
            {
                DoctorId = model.DoctorId,
                PatientId = model.PatientId,
                MedicineName = p.Medicine,
                Dosage = p.Dosage,
                Duration = p.Duration,
                PharmacyId = model.PurchaseOption == "pharmacy" ? model.PharmacyId : null
            }).ToList();

            _context.Prescriptions.AddRange(newPrescriptions);
            await _context.SaveChangesAsync();

            if (model.PurchaseOption == "pharmacy")
            {
                var pharmacy = await _context.Pharmacies.FirstOrDefaultAsync(p => p.Id == model.PharmacyId);
                var message = $"Your prescriptions are available at {pharmacy?.Name}, {pharmacy?.Address} {pharmacy?.ZipCode}. Please go and collect.";
                await _emailService.SendEmailAsync(patient.User.Email, "New Prescription", message);
            }
            else if (model.PurchaseOption == "online")
            {
                var message = "Your prescriptions are ready for online purchase.";
                await _emailService.SendEmailAsync(patient.User.Email, "New Prescription", message);
            }

            return Ok(new { message = "Prescriptions created successfully." });
        }

        [Authorize]
        [HttpGet("list")]
        public async Task<IActionResult> GetPrescriptions()
        {
            try
            {
                // Get the username from the JWT token
                var username = User.FindFirst(ClaimTypes.Name)?.Value;

                if (string.IsNullOrEmpty(username))
                {
                    return BadRequest(new { message = "Username is required." });
                }

                // Fetch the user based on the username
                var user = await _context.Users.FirstOrDefaultAsync(u => u.UserName == username);
                if (user == null)
                {
                    return NotFound(new { message = $"User not found for username: {username}" });
                }

                // Fetch the patient based on the user ID
                var patient = await _context.Patients.Include(p => p.User).FirstOrDefaultAsync(p => p.User.Id == user.Id);
                if (patient == null)
                {
                    return NotFound(new { message = "Patient not found." });
                }

                // Fetch the prescriptions for the patient
                var prescriptions = await _context.Prescriptions
                    .Where(p => p.PatientId == patient.Id)
                    .Include(p => p.Pharmacy)
                    .Include(p => p.Doctor)
                    .Select(p => new
                    {
                        p.Id,
                        p.MedicineName,
                        p.Dosage,
                        p.Duration,
                        DoctorName = p.Doctor != null ? p.Doctor.User.FirstName + " " + p.Doctor.User.LastName : "N/A",
                        
                        PharmacyName = p.Pharmacy != null ? p.Pharmacy.Name : "N/A",
                        PharmacyAddress = p.Pharmacy != null ? p.Pharmacy.Address : "N/A",
                        PaymentStatus = _context.Orders
                            .Where(o => o.PrescriptionId == p.Id)
                            .OrderByDescending(o => o.Id)
                            .Select(o => o.PaymentStatus)
                            .FirstOrDefault() // Get the most recent payment status
                    })
                    .ToListAsync();

                return Ok(prescriptions);
            }
            catch (Exception ex)
            {
                // Log the error for debugging purposes
                Console.WriteLine($"Error in GetPrescriptions: {ex}");
                return StatusCode(500, new { message = "An error occurred while fetching prescriptions." });
            }
        }
        
        [Authorize]
    [HttpPost("purchase")]
    public async Task<IActionResult> PurchasePrescription([FromBody] PurchaseDto model)
    {
        var prescription = await _context.Prescriptions.FindAsync(model.PrescriptionId);

        if (prescription == null)
        {
            return NotFound(new { message = "Prescription not found." });
        }

        var medicine = await _context.Medicines.FirstOrDefaultAsync(m => m.Name == prescription.MedicineName);

        if (medicine == null)
        {
            return NotFound(new { message = "Medicine not found." });
        }

        var dosagePerDay = int.Parse(prescription.Dosage);
        var totalPills = dosagePerDay * int.Parse(prescription.Duration);
        var stripsNeeded = (int)Math.Ceiling(totalPills / 10.0);
        var totalPrice = stripsNeeded * medicine.Price;

        var paymentIntentId = await _stripeService.CreatePaymentIntent(totalPrice);

        // Create a Stripe session
        var options = new SessionCreateOptions
        {
            PaymentMethodTypes = new List<string> { "card" },
            LineItems = new List<SessionLineItemOptions>
            {
                new SessionLineItemOptions
                {
                    PriceData = new SessionLineItemPriceDataOptions
                    {
                        Currency = "gbp",
                        UnitAmount = (long)(totalPrice * 100), // Stripe expects the amount in cents
                        ProductData = new SessionLineItemPriceDataProductDataOptions
                        {
                            Name = "Prescription Payment",
                        },
                    },
                    Quantity = 1,
                },
            },
            Mode = "payment",
            SuccessUrl = "http://localhost:3000/success?session_id={CHECKOUT_SESSION_ID}", 
            CancelUrl = "http://localhost:3000/cancel", 
            ClientReferenceId = prescription.Id.ToString(),  // Include the prescription ID here
        };

        var service = new SessionService();
        Session session = service.Create(options);

        // Create an order in the database with PaymentStatus as "Pending"
        var order = new Order
        {
            PrescriptionId = prescription.Id,
            PatientId = prescription.PatientId,
            MedicineId = medicine.Id,
            Quantity = totalPills,
            TotalPrice = totalPrice,
            PaymentStatus = "Pending",
            SessionId = session.Id
        };

        _context.Orders.Add(order);
        await _context.SaveChangesAsync();

        return Ok(new { sessionId = session.Id,  url = session.Url  });
    }



        [HttpPost("webhook")]
        public async Task<IActionResult> StripeWebhook()
        {
            var json = await new StreamReader(HttpContext.Request.Body).ReadToEndAsync();
            var stripeEvent = EventUtility.ConstructEvent(json, Request.Headers["Stripe-Signature"], _configuration["Stripe:WebhookSecret"]);

            if (stripeEvent.Type == Events.CheckoutSessionCompleted)
            {
                var session = stripeEvent.Data.Object as Session;
                if (session != null)
                {
                    var prescriptionId = int.Parse(session.ClientReferenceId);
                    var prescription = await _context.Prescriptions.FindAsync(prescriptionId);

                    if (prescription != null)
                    {
                        var order = await _context.Orders
                            .FirstOrDefaultAsync(o => o.PrescriptionId == prescription.Id && o.PaymentStatus == "Pending");

                        if (order != null)
                        {
                            order.PaymentStatus = "Paid";
                            
                            
                            
                            
                            await _context.SaveChangesAsync();
                        }
                    }
                }
            }

            return Ok();
        }

           


        [Authorize]
        [HttpPost("update-payment-status")]
        public async Task<IActionResult> UpdatePaymentStatus([FromBody] PaymentStatusUpdateDto model)
        {
            var sessionService = new SessionService();
            var session = await sessionService.GetAsync(model.SessionId);
            var prescriptionId = int.Parse(session.ClientReferenceId);
            var prescription = await _context.Prescriptions.FindAsync(prescriptionId);

            if (session.PaymentStatus == "paid")
            {
                var order = await _context.Orders.FirstOrDefaultAsync(o => o.SessionId == model.SessionId);
                if (order != null)
                {
                    order.PaymentStatus = "Completed";
                    await _context.SaveChangesAsync();
                    
                    // Fetch patient details
                    var patient = await _context.Patients
                        .Include(p => p.User)
                        .FirstOrDefaultAsync(p => p.Id == order.PatientId);

                    if (patient != null)
                    {
                        // Create the email message
                        var message = $@"
                            Dear {patient.User.FirstName} {patient.User.LastName},

                            Your payment has been successfully processed. Here are the details of your purchase:

                            Order ID: {order.Id}
                            Prescription ID: {prescription.Id}
                            Medicine: {prescription.MedicineName}
                            Dosage: {prescription.Dosage}
                            Duration: {prescription.Duration} days
                            Total Amount Paid: £{order.TotalPrice}

                            Thank you for your purchase!

                            Best regards,
                            Your Healthcare Team
                        ";

                        // Send the email
                        await _emailService.SendEmailAsync(patient.User.Email, "Prescription Purchase Confirmation", message);
                    }
                }
            }

            return Ok(new { message = "Payment status updated successfully." });
        }
        
        [Authorize]
        [HttpGet("patient/{patientId}/past-prescriptions")]
        public async Task<IActionResult> GetPastPrescriptions(int patientId)
        {
            var prescriptions = await _context.Prescriptions
                .Where(p => p.PatientId == patientId)
                .Include(p => p.Doctor)
                .ThenInclude(d => d.User)
                .Include(p => p.Pharmacy)
                .ToListAsync();

            var result = prescriptions.Select(p => new
            {
                MedicineName = p.MedicineName,
                Dosage = p.Dosage,
                Duration = p.Duration,
                DoctorName = p.Doctor.User.FirstName + " " + p.Doctor.User.LastName,
                PharmacyName = p.Pharmacy != null ? p.Pharmacy.Name : "Online"
            });

            return Ok(result);
        }



    }
