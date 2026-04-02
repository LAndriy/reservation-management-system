using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using AllAboutNail.API.Models;
using AllAboutNail.API.Models.DTOs;
using AllAboutNail.API.Services;
using Microsoft.AspNetCore.Authorization;
using System.Security.Cryptography;
using Microsoft.Extensions.Configuration;
using AllAboutNail.API.Models.Validators;
using AllAboutNail.API.Data;
using Microsoft.Extensions.Logging;

namespace AllAboutNail.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UsersController : ControllerBase
    {
        private readonly UserManager<User> _userManager;
        private readonly SignInManager<User> _signInManager;
        private readonly RoleManager<IdentityRole<int>> _roleManager;
        private readonly IJwtService _jwtService;
        private readonly IConfiguration _configuration;
        private readonly UserValidator _validator;
        private readonly ApplicationDbContext _context;
        private readonly ILogger<UsersController> _logger;

        public UsersController(
            UserManager<User> userManager,
            SignInManager<User> signInManager,
            RoleManager<IdentityRole<int>> roleManager,
            IJwtService jwtService,
            IConfiguration configuration,
            ApplicationDbContext context,
            ILogger<UsersController> logger)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _roleManager = roleManager;
            _jwtService = jwtService;
            _configuration = configuration;
            _context = context;
            _validator = new UserValidator(context, userManager);
            _logger = logger;
        }

        [HttpGet("current")]
        public async Task<ActionResult<UserDto>> GetCurrentUser()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return NotFound(new { error = "User not found" });
            }

            return Ok(await CreateUserDto(user));
        }

        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<IEnumerable<UserDto>>> GetUsers()
        {
            var users = await _userManager.Users.ToListAsync();
            var userDtos = new List<UserDto>();

            foreach (var user in users)
            {
                userDtos.Add(await CreateUserDto(user));
            }

            return Ok(userDtos);
        }

        [HttpGet("{id}")]
        [Authorize]
        public async Task<ActionResult<UserDto>> GetUser(int id)
        {
            var user = await _userManager.FindByIdAsync(id.ToString());
            if (user == null || !user.IsActive)
            {
                return NotFound(new { error = "User not found" });
            }

            return await CreateUserDto(user);
        }

        [HttpGet("employees")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<IEnumerable<UserDto>>> GetEmployees()
        {
            var employees = await _userManager.GetUsersInRoleAsync("Employee");
            var employeeDtos = new List<UserDto>();

            foreach (var employee in employees)
            {
                employeeDtos.Add(await CreateUserDto(employee));
            }

            return Ok(employeeDtos);
        }

        [HttpPost("create-employee")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<AuthResponseDto>> CreateEmployee(RegisterDto registerDto)
        {
            var user = new User
            {
                Email = registerDto.Email,
                FirstName = registerDto.FirstName,
                LastName = registerDto.LastName,
                PhoneNumber = registerDto.PhoneNumber,
                UserName = registerDto.Email,
                IsActive = true
            };

            var validationResult = await _validator.ValidateUser(user, registerDto.Password);
            if (!validationResult.isValid)
            {
                return BadRequest(new { error = validationResult.errorMessage });
            }

            var result = await _userManager.CreateAsync(user, registerDto.Password);
            if (!result.Succeeded)
            {
                return BadRequest(new { errors = result.Errors });
            }

            await _userManager.AddToRoleAsync(user, "Employee");

            var userDto = await CreateUserDto(user);
            var token = await _jwtService.GenerateJwtToken(user);

            return new AuthResponseDto
            {
                User = userDto,
                Token = token
            };
        }

        [HttpPost("register")]
        [AllowAnonymous]
        public async Task<ActionResult<AuthResponseDto>> Register(RegisterDto registerDto)
        {
            var user = new User
            {
                UserName = registerDto.Email,
                Email = registerDto.Email,
                FirstName = registerDto.FirstName,
                LastName = registerDto.LastName,
                IsActive = true
            };

            var validationResult = await _validator.ValidateUser(user, registerDto.Password);
            if (!validationResult.isValid)
            {
                return BadRequest(new { error = validationResult.errorMessage });
            }

            var result = await _userManager.CreateAsync(user, registerDto.Password);
            if (!result.Succeeded)
            {
                return BadRequest(new { errors = result.Errors });
            }

            await _userManager.AddToRoleAsync(user, "User");

            var token = await _jwtService.GenerateJwtToken(user);

            return new AuthResponseDto { Token = token, User = await CreateUserDto(user) };
        }

        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateUser(int id, UpdateUserDto updateUserDto)
        {
            var user = await _userManager.FindByIdAsync(id.ToString());
            if (user == null || !user.IsActive)
            {
                return NotFound(new { error = "User not found" });
            }

            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var isAdmin = User.IsInRole("Admin");
            if (!isAdmin && currentUserId != id.ToString())
            {
                return Forbid();
            }

            user.FirstName = updateUserDto.FirstName;
            user.LastName = updateUserDto.LastName;
            user.PhoneNumber = updateUserDto.PhoneNumber;

            var validationResult = await _validator.ValidateUser(user);
            if (!validationResult.isValid)
            {
                return BadRequest(new { error = validationResult.errorMessage });
            }

            var result = await _userManager.UpdateAsync(user);
            if (!result.Succeeded)
            {
                return BadRequest(new { errors = result.Errors });
            }

            return NoContent();
        }

        [HttpPut("{id}/change-password")]
        [Authorize]
        public async Task<IActionResult> ChangePassword(int id, ChangePasswordDto changePasswordDto)
        {
            var user = await _userManager.FindByIdAsync(id.ToString());
            if (user == null || !user.IsActive)
            {
                return NotFound(new { error = "Użytkownik nie istnieje" });
            }

            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (currentUserId != id.ToString())
            {
                return Forbid();
            }

            var validationResult = await _validator.ValidateUser(user, changePasswordDto.NewPassword);
            if (!validationResult.isValid)
            {
                return BadRequest(new { error = validationResult.errorMessage });
            }

            var changePasswordResult = await _userManager.ChangePasswordAsync(
                user, 
                changePasswordDto.CurrentPassword, 
                changePasswordDto.NewPassword
            );

            if (!changePasswordResult.Succeeded)
            {
                return BadRequest(new { errors = changePasswordResult.Errors });
            }

            return NoContent();
        }

        [HttpPut("{id}/deactivate")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeactivateUser(int id)
        {
            var user = await _userManager.FindByIdAsync(id.ToString());
            if (user == null || !user.IsActive)
            {
                return NotFound(new { error = "User not found" });
            }

            if (!await _validator.CanDeactivateUser(id))
            {
                return BadRequest(new { error = "Cannot deactivate user with active appointments or time-offs" });
            }

            user.IsActive = false;
            user.DeactivatedAt = DateTime.UtcNow;

            var result = await _userManager.UpdateAsync(user);
            if (!result.Succeeded)
            {
                return BadRequest(new { errors = result.Errors });
            }

            return NoContent();
        }

        [HttpPut("{id}/reactivate")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ReactivateUser(int id)
        {
            var user = await _userManager.Users
                .FirstOrDefaultAsync(u => u.Id == id && !u.IsActive);

            if (user == null)
            {
                return NotFound(new { error = "Inactive user not found" });
            }

            user.IsActive = true;
            user.DeactivatedAt = null;

            var result = await _userManager.UpdateAsync(user);
            if (!result.Succeeded)
            {
                return BadRequest(new { errors = result.Errors });
            }

            return NoContent();
        }

        [HttpPut("{id}/role")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ChangeUserRole(int id, [FromBody] string newRole)
        {
            var (canChange, errorMessage) = await _validator.CanChangeRole(id, newRole);
            if (!canChange)
            {
                return BadRequest(new { error = errorMessage });
            }

            var user = await _userManager.FindByIdAsync(id.ToString());
            var currentRoles = await _userManager.GetRolesAsync(user);

            foreach (var role in currentRoles)
            {
                await _userManager.RemoveFromRoleAsync(user, role);
            }

            var result = await _userManager.AddToRoleAsync(user, newRole);
            if (!result.Succeeded)
            {
                return BadRequest(new { errors = result.Errors });
            }

            return NoContent();
        }

        [HttpPost("{id}/toggle-active")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ToggleUserActive(int id)
        {
            var user = await _userManager.FindByIdAsync(id.ToString());
            if (user == null)
            {
                return NotFound(new { error = "Użytkownik nie istnieje" });
            }

            user.IsActive = !user.IsActive;
            user.DeactivatedAt = user.IsActive ? null : DateTime.UtcNow;

            var result = await _userManager.UpdateAsync(user);
            if (!result.Succeeded)
            {
                return BadRequest(new { error = "Nie udało się zaktualizować statusu użytkownika" });
            }

            return NoContent();
        }

        [HttpPost("assign-role")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> AssignRole([FromBody] AssignRoleDto assignRoleDto)
        {
            _logger.LogInformation($"Przypisywanie roli. Email: {assignRoleDto.Email}, Role: {assignRoleDto.Role}");

            if (assignRoleDto == null || string.IsNullOrEmpty(assignRoleDto.Email) || string.IsNullOrEmpty(assignRoleDto.Role))
            {
                _logger.LogWarning("Nieprawidłowe dane w AssignRoleDto");
                return BadRequest(new { error = "Nieprawidłowe dane" });
            }

            var user = await _userManager.FindByEmailAsync(assignRoleDto.Email);
            _logger.LogInformation($"Znaleziony użytkownik: {user?.Id ?? 0}");

            if (user == null)
            {
                _logger.LogWarning($"Nie znaleziono użytkownika o emailu: {assignRoleDto.Email}");
                return NotFound(new { error = "Użytkownik nie istnieje" });
            }

            var currentRoles = await _userManager.GetRolesAsync(user);
            foreach (var role in currentRoles)
            {
                await _userManager.RemoveFromRoleAsync(user, role);
            }

            var result = await _userManager.AddToRoleAsync(user, assignRoleDto.Role);
            if (!result.Succeeded)
            {
                _logger.LogError($"Błąd podczas przypisywania roli: {string.Join(", ", result.Errors.Select(e => e.Description))}");
                return BadRequest(new { errors = result.Errors });
            }

            _logger.LogInformation($"Pomyślnie przypisano rolę {assignRoleDto.Role} użytkownikowi {user.Id}");
            return NoContent();
        }

        private async Task<UserDto> CreateUserDto(User user)
        {
            var roles = await _userManager.GetRolesAsync(user);
            return new UserDto
            {
                Id = user.Id,
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                PhoneNumber = user.PhoneNumber,
                Roles = roles.ToList(),
                CreatedAt = user.CreatedAt,
                LastLogin = user.LastLogin,
                IsActive = user.IsActive,
                DeactivatedAt = user.DeactivatedAt
            };
        }
    }
}
