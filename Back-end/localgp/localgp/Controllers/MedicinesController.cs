using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;
using localgp.Data;
using localgp.Models;
using Microsoft.EntityFrameworkCore;
using System.Linq;

namespace localgp.Controllers
{
    [Authorize(Roles = "Doctor")]
    [Route("api/[controller]")]
    [ApiController]
    public class MedicinesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public MedicinesController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet ("medicines")]
        public async Task<ActionResult<IEnumerable<Medicine>>> GetMedicines()
        {
            var medicines = await _context.Medicines
                .Select(m => new
                {
                    m.Id,
                    m.Name,
                    m.StockQuantity,
                    m.Description,
                    m.Price
                })
                .ToListAsync();

            return Ok(medicines);
        }
    }
}