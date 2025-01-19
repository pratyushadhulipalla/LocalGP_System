using System;
using System.Linq;
using System.Threading.Tasks;
using localgp.Data;
using localgp.Models;
using Microsoft.AspNetCore.Mvc;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;

namespace localgp.Controllers
{

    [Route("api/[controller]")]
    [ApiController]




    public class EmergencyContactsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public EmergencyContactsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetEmergencyContacts(string userId)
        {
            var contacts = await _context.EmergencyContacts
                .Where(ec => ec.UserId == userId)
                .ToListAsync();
            return Ok(contacts);
        }

        [HttpPost("add")]
        [Authorize]  // Ensure the user is authenticated
        public async Task<IActionResult> AddEmergencyContact([FromBody] EmergencyContact contact)
        {
            // Retrieve the UserId from the JWT token
            var userId = contact.UserId;
            Console.WriteLine($"UserId from token: {userId}");

            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized("User ID is missing or invalid.");
            }

            // Ensure the UserId is valid and exists in the AspNetUsers table
            var userExists = await _context.Users.AnyAsync(u => u.Id == userId);
            if (!userExists)
            {
                return BadRequest("Invalid UserId. User does not exist.");
            }

            contact.UserId = userId;  // Associate the contact with the current user
            _context.EmergencyContacts.Add(contact);
            try
            {
                await _context.SaveChangesAsync();
                return Ok(contact);
            }
            catch (DbUpdateException ex)
            {
                Console.WriteLine($"Error occurred while saving: {ex.InnerException?.Message}");
                return StatusCode(500, "An error occurred while saving the emergency contact.");
            }
        }
        
        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateEmergencyContact(int id, [FromBody] EmergencyContact updatedContact)
        {
            if (id != updatedContact.Id)
            {
                return BadRequest("Contact ID mismatch");
            }

            var existingContact = await _context.EmergencyContacts.FindAsync(id);
            if (existingContact == null)
            {
                return NotFound("Emergency contact not found");
            }

            // Update the contact details
            existingContact.ContactName = updatedContact.ContactName;
            existingContact.Relation = updatedContact.Relation;
            existingContact.MobileNumber = updatedContact.MobileNumber;
            existingContact.Address = updatedContact.Address;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.EmergencyContacts.Any(e => e.Id == id))
                {
                    return NotFound("Emergency contact not found");
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }



        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteEmergencyContact(int id)
        {
            var contact = await _context.EmergencyContacts.FindAsync(id);
            if (contact == null) return NotFound();

            _context.EmergencyContacts.Remove(contact);
            await _context.SaveChangesAsync();
            return Ok();
        }
    }
}

