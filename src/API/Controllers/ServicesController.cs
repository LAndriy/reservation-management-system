using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Logging;
using AllAboutNail.API.Models;
using AllAboutNail.API.Data;
using Microsoft.EntityFrameworkCore;

namespace AllAboutNail.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ServicesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<ServicesController> _logger;

        public ServicesController(ApplicationDbContext context, ILogger<ServicesController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<Service>>> GetServices()
        {
            _logger.LogInformation("Getting services...");
            try
            {
                var services = await _context.Services.ToListAsync();
                _logger.LogInformation($"Found {services.Count} services");
                return Ok(services);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting services");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<Service>> GetService(int id)
        {
            _logger.LogInformation($"Getting service with id {id}...");
            try
            {
                var service = await _context.Services.FindAsync(id);
                if (service == null)
                {
                    _logger.LogWarning($"Service with id {id} not found");
                    return NotFound();
                }
                return Ok(service);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting service with id {id}");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Employee")]
        public async Task<ActionResult<Service>> CreateService(Service service)
        {
            _logger.LogInformation("Creating new service...");
            try
            {
                _context.Services.Add(service);
                await _context.SaveChangesAsync();
                _logger.LogInformation($"Service created with id {service.Id}");
                return CreatedAtAction(nameof(GetService), new { id = service.Id }, service);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating service");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Employee")]
        public async Task<IActionResult> UpdateService(int id, Service service)
        {
            _logger.LogInformation($"Attempting to update service. Id from route: {id}, Id from body: {service?.Id}");
            
            if (!ModelState.IsValid)
            {
                var errors = string.Join("; ", ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage));
                _logger.LogWarning($"Invalid model state: {errors}");
                return BadRequest(errors);
            }

            if (id != service.Id)
            {
                _logger.LogWarning($"Id mismatch. Route id: {id}, Body id: {service.Id}");
                return BadRequest("Id in route must match id in body");
            }

            _logger.LogInformation($"Updating service with id {id}...");
            try
            {
                var existingService = await _context.Services.FindAsync(id);
                if (existingService == null)
                {
                    _logger.LogWarning($"Service with id {id} not found");
                    return NotFound();
                }

                // Aktualizacja właściwości
                existingService.Name = service.Name;
                existingService.Description = service.Description;
                existingService.Price = service.Price;
                existingService.DurationInMinutes = service.DurationInMinutes;
                existingService.Category = service.Category;

                await _context.SaveChangesAsync();
                _logger.LogInformation($"Service with id {id} updated successfully");
                return Ok(existingService);
            }
            catch (DbUpdateConcurrencyException ex)
            {
                _logger.LogError(ex, $"Concurrency error updating service with id {id}");
                return StatusCode(409, "The service was modified by another user");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error updating service with id {id}");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin,Employee")]
        public async Task<IActionResult> DeleteService(int id)
        {
            _logger.LogInformation($"Deleting service with id {id}...");
            try
            {
                var service = await _context.Services.FindAsync(id);
                if (service == null)
                {
                    _logger.LogWarning($"Service with id {id} not found during delete");
                    return NotFound();
                }

                _context.Services.Remove(service);
                await _context.SaveChangesAsync();
                _logger.LogInformation($"Service with id {id} deleted");
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error deleting service with id {id}");
                return StatusCode(500, "Internal server error");
            }
        }

        private bool ServiceExists(int id)
        {
            return _context.Services.Any(e => e.Id == id);
        }
    }
}
