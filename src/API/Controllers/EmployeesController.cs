using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using AllAboutNail.API.Models;
using AllAboutNail.API.Models.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Logging;

namespace AllAboutNail.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class EmployeesController : ControllerBase
    {
        private readonly UserManager<User> _userManager;
        private readonly ILogger<EmployeesController> _logger;

        public EmployeesController(UserManager<User> userManager, ILogger<EmployeesController> logger)
        {
            _userManager = userManager;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<UserDto>>> GetEmployees()
        {
            _logger.LogInformation("Getting employees...");
            try 
            {
                var employees = await _userManager.GetUsersInRoleAsync("Employee");
                _logger.LogInformation($"Found {employees.Count} employees");
                
                var employeeDtos = employees.Select(e => new UserDto
                {
                    Id = e.Id,
                    FirstName = e.FirstName,
                    LastName = e.LastName,
                    Email = e.Email,
                    PhoneNumber = e.PhoneNumber
                }).ToList();

                _logger.LogInformation("Returning employee DTOs");
                return Ok(employeeDtos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting employees");
                return StatusCode(500, "Internal server error");
            }
        }
    }
}
