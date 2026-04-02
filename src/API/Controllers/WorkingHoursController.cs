using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AllAboutNail.API.Models;
using AllAboutNail.API.Data;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using AllAboutNail.API.Models.DTOs;
using AllAboutNail.API.Models.Validators;

namespace AllAboutNail.API.Controllers
{
    [ApiController]
    [Route("api/working-hours")]
    [Authorize]
    public class WorkingHoursController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly WorkingHoursValidator _validator;

        public WorkingHoursController(ApplicationDbContext context)
        {
            _context = context;
            _validator = new WorkingHoursValidator(context);
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<WorkingHoursResponseDto>>> GetWorkingHours()
        {
            var workingHours = await _context.WorkingHours
                .Include(w => w.Employee)
                .ToListAsync();

            var response = workingHours.Select(wh => new WorkingHoursResponseDto
            {
                Id = wh.Id,
                EmployeeId = wh.EmployeeId,
                DayOfWeek = (int)wh.DayOfWeek,
                StartTime = wh.StartTime.ToString(@"hh\:mm"),
                EndTime = wh.EndTime.ToString(@"hh\:mm"),
                BreakStartTime = wh.BreakStartTime?.ToString(@"hh\:mm"),
                BreakEndTime = wh.BreakEndTime?.ToString(@"hh\:mm")
            });

            return Ok(response);
        }

        [HttpGet("employee/{employeeId}")]
        public async Task<ActionResult<IEnumerable<WorkingHoursResponseDto>>> GetEmployeeWorkingHours(int employeeId)
        {
            var workingHours = await _context.WorkingHours
                .Include(w => w.Employee)
                .Where(w => w.EmployeeId == employeeId)
                .ToListAsync();

            var response = workingHours.Select(wh => new WorkingHoursResponseDto
            {
                Id = wh.Id,
                EmployeeId = wh.EmployeeId,
                DayOfWeek = (int)wh.DayOfWeek,
                StartTime = wh.StartTime.ToString(@"hh\:mm"),
                EndTime = wh.EndTime.ToString(@"hh\:mm"),
                BreakStartTime = wh.BreakStartTime?.ToString(@"hh\:mm"),
                BreakEndTime = wh.BreakEndTime?.ToString(@"hh\:mm")
            });

            return Ok(response);
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Employee")]
        public async Task<ActionResult<WorkingHoursResponseDto>> CreateWorkingHours(WorkingHoursDto workingHoursDto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var currentUser = await _context.Users.FindAsync(int.Parse(userId));
            
            // Sprawdź czy użytkownik ma uprawnienia do modyfikacji godzin pracy
            if (!User.IsInRole("Admin") && currentUser.Id != workingHoursDto.EmployeeId)
            {
                return Forbid();
            }

            var workingHours = new WorkingHours
            {
                EmployeeId = workingHoursDto.EmployeeId,
                DayOfWeek = workingHoursDto.DayOfWeek,
                StartTime = ParseTimeIgnoringSeconds(workingHoursDto.StartTime),
                EndTime = ParseTimeIgnoringSeconds(workingHoursDto.EndTime),
                BreakStartTime = workingHoursDto.BreakStartTime != null ? 
                    ParseTimeIgnoringSeconds(workingHoursDto.BreakStartTime) : null,
                BreakEndTime = workingHoursDto.BreakEndTime != null ? 
                    ParseTimeIgnoringSeconds(workingHoursDto.BreakEndTime) : null
            };

            var validationResult = await _validator.ValidateWorkingHours(workingHours);
            if (!validationResult.isValid)
            {
                return BadRequest(new { error = validationResult.errorMessage });
            }

            _context.WorkingHours.Add(workingHours);
            await _context.SaveChangesAsync();

            var response = new WorkingHoursResponseDto
            {
                Id = workingHours.Id,
                EmployeeId = workingHours.EmployeeId,
                DayOfWeek = (int)workingHours.DayOfWeek,
                StartTime = workingHours.StartTime.ToString(@"hh\:mm"),
                EndTime = workingHours.EndTime.ToString(@"hh\:mm"),
                BreakStartTime = workingHours.BreakStartTime?.ToString(@"hh\:mm"),
                BreakEndTime = workingHours.BreakEndTime?.ToString(@"hh\:mm")
            };

            return CreatedAtAction(nameof(GetEmployeeWorkingHours), 
                new { employeeId = workingHours.EmployeeId }, response);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Employee")]
        public async Task<IActionResult> UpdateWorkingHours(int id, WorkingHoursDto workingHoursDto)
        {
            var existingHours = await _context.WorkingHours.FindAsync(id);
            if (existingHours == null)
            {
                return NotFound(new { error = "Godziny pracy nie istnieją" });
            }

            existingHours.DayOfWeek = workingHoursDto.DayOfWeek;
            existingHours.StartTime = ParseTimeIgnoringSeconds(workingHoursDto.StartTime);
            existingHours.EndTime = ParseTimeIgnoringSeconds(workingHoursDto.EndTime);
            existingHours.BreakStartTime = workingHoursDto.BreakStartTime != null ? 
                ParseTimeIgnoringSeconds(workingHoursDto.BreakStartTime) : null;
            existingHours.BreakEndTime = workingHoursDto.BreakEndTime != null ? 
                ParseTimeIgnoringSeconds(workingHoursDto.BreakEndTime) : null;

            var validationResult = await _validator.ValidateWorkingHours(existingHours);
            if (!validationResult.isValid)
            {
                return BadRequest(new { error = validationResult.errorMessage });
            }

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!await WorkingHoursExists(id))
                {
                    return NotFound(new { error = "Godziny pracy nie istnieją" });
                }
                throw;
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin,Employee")]
        public async Task<IActionResult> DeleteWorkingHours(int id)
        {
            var validationResult = await _validator.ValidateWorkingHoursDelete(id);
            if (!validationResult.isValid)
            {
                return BadRequest(new { error = validationResult.errorMessage });
            }

            var workingHours = await _context.WorkingHours.FindAsync(id);
            if (workingHours == null)
            {
                return NotFound(new { error = "Godziny pracy nie istnieją" });
            }

            _context.WorkingHours.Remove(workingHours);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private static TimeSpan ParseTimeIgnoringSeconds(string time)
        {
            var parts = time.Split(':');
            return new TimeSpan(
                hours: int.Parse(parts[0]),
                minutes: int.Parse(parts[1]),
                seconds: 0
            );
        }

        private async Task<bool> WorkingHoursExists(int id)
        {
            return await _context.WorkingHours.AnyAsync(e => e.Id == id);
        }
    }
}
