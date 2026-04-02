using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AllAboutNail.API.Data;
using AllAboutNail.API.Models;
using AllAboutNail.API.Models.DTOs;
using AllAboutNail.API.Models.Validators;
using System.Security.Claims;

namespace AllAboutNail.API.Controllers
{
    [ApiController]
    [Route("api/time-off")]
    [Authorize]
    public class TimeOffController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<TimeOffController> _logger;
        private readonly TimeOffValidator _validator;

        public TimeOffController(ApplicationDbContext context, ILogger<TimeOffController> logger)
        {
            _context = context;
            _logger = logger;
            _validator = new TimeOffValidator(context);
        }

        // GET: api/time-off/employee/{employeeId}
        [HttpGet("employee/{employeeId}")]
        public async Task<ActionResult<IEnumerable<TimeOff>>> GetEmployeeTimeOffs(int employeeId)
        {
            try
            {
                var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
                if (!User.IsInRole("Admin") && currentUserId != employeeId)
                {
                    return Forbid();
                }

                var timeOffs = await _context.TimeOffs
                    .Where(t => t.EmployeeId == employeeId)
                    .OrderByDescending(t => t.StartDate)
                    .Select(t => new
                    {
                        t.Id,
                        t.EmployeeId,
                        t.StartDate,
                        t.EndDate,
                        t.Reason,
                        t.Status,
                        t.CreatedAt
                    })
                    .ToListAsync();

                return Ok(timeOffs);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting employee time-offs");
                return StatusCode(500, new { error = "Internal server error while getting time-offs" });
            }
        }

        // POST: api/time-off
        [HttpPost]
        [Authorize(Roles = "Admin,Employee")]
        public async Task<ActionResult<TimeOff>> CreateTimeOff(CreateTimeOffDto dto)
        {
            try
            {
                var employeeId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
                var employee = await _context.Users.FindAsync(employeeId);
                if (employee == null)
                {
                    return BadRequest(new { error = "Employee not found" });
                }

                var timeOff = new TimeOff
                {
                    EmployeeId = employeeId,
                    StartDate = dto.StartDate,
                    EndDate = dto.EndDate,
                    Reason = dto.Reason,
                    Status = TimeOffStatus.Pending,
                    CreatedAt = DateTime.UtcNow
                };

                var validationResult = await _validator.ValidateTimeOff(timeOff);
                if (!validationResult.isValid)
                {
                    return BadRequest(new { error = validationResult.errorMessage });
                }

                _context.TimeOffs.Add(timeOff);
                await _context.SaveChangesAsync();

                return CreatedAtAction(
                    nameof(GetEmployeeTimeOffs),
                    new { employeeId = timeOff.EmployeeId },
                    timeOff);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating time-off");
                return StatusCode(500, new { error = "Internal server error while creating time-off" });
            }
        }

        // PUT: api/time-off/{id}
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Employee")]
        public async Task<IActionResult> UpdateTimeOff(int id, CreateTimeOffDto dto)
        {
            try
            {
                var timeOff = await _context.TimeOffs.FindAsync(id);
                if (timeOff == null)
                {
                    return NotFound(new { error = "Time-off not found" });
                }

                var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
                if (!User.IsInRole("Admin") && timeOff.EmployeeId != currentUserId)
                {
                    return Forbid();
                }

                var updatedTimeOff = new TimeOff
                {
                    Id = id,
                    EmployeeId = timeOff.EmployeeId,
                    StartDate = dto.StartDate,
                    EndDate = dto.EndDate,
                    Reason = dto.Reason,
                    Status = timeOff.Status
                };

                var validationResult = await _validator.ValidateTimeOff(updatedTimeOff, false, id);
                if (!validationResult.isValid)
                {
                    return BadRequest(new { error = validationResult.errorMessage });
                }

                timeOff.StartDate = dto.StartDate;
                timeOff.EndDate = dto.EndDate;
                timeOff.Reason = dto.Reason;

                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating time-off");
                return StatusCode(500, new { error = "Internal server error while updating time-off" });
            }
        }

        // PUT: api/time-off/{id}/status
        [HttpPut("{id}/status")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateTimeOffStatus(int id, TimeOffStatusUpdateDto statusUpdate)
        {
            try
            {
                var timeOff = await _context.TimeOffs.FindAsync(id);
                if (timeOff == null)
                {
                    return NotFound(new { error = "Time-off not found" });
                }

                var (canChange, errorMessage) = _validator.CanChangeStatus(
                    timeOff,
                    statusUpdate.NewStatus,
                    User.IsInRole("Admin"));

                if (!canChange)
                {
                    return BadRequest(new { error = errorMessage });
                }

                timeOff.Status = statusUpdate.NewStatus;
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating time-off status");
                return StatusCode(500, new { error = "Internal server error while updating time-off status" });
            }
        }

        // DELETE: api/time-off/{id}
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin,Employee")]
        public async Task<IActionResult> DeleteTimeOff(int id)
        {
            var timeOff = await _context.TimeOffs.FindAsync(id);
            if (timeOff == null)
            {
                return NotFound();
            }

            var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            if (!User.IsInRole("Admin") && currentUserId != timeOff.EmployeeId)
            {
                return Forbid();
            }

            _context.TimeOffs.Remove(timeOff);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
