using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AllAboutNail.API.Models;
using AllAboutNail.API.Models.DTOs;
using AllAboutNail.API.Services;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using Google.Apis.Auth;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using AllAboutNail.API.Models.Settings;
using Microsoft.Extensions.Logging;

namespace AllAboutNail.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<User> _userManager;
        private readonly IConfiguration _configuration;
        private readonly GoogleAuthSettings _googleSettings;
        private readonly IJwtService _jwtService;
        private readonly ILogger<AuthController> _logger;

        public AuthController(
            UserManager<User> userManager,
            IConfiguration configuration,
            IOptions<GoogleAuthSettings> googleSettings,
            IJwtService jwtService,
            ILogger<AuthController> logger)
        {
            _userManager = userManager;
            _configuration = configuration;
            _googleSettings = googleSettings.Value;
            _jwtService = jwtService;
            _logger = logger;
        }

        [HttpPost("google")]
        public async Task<IActionResult> GoogleLogin([FromBody] GoogleLoginRequest request)
        {
            try
            {
                var settings = new GoogleJsonWebSignature.ValidationSettings
                {
                    Audience = new[] { _googleSettings.ClientId }
                };

                var payload = await GoogleJsonWebSignature.ValidateAsync(request.Credential, settings);

                // Sprawdź czy użytkownik istnieje
                var user = await _userManager.FindByEmailAsync(payload.Email);
                if (user == null)
                {
                    // Stwórz nowego użytkownika
                    user = new User
                    {
                        Email = payload.Email,
                        UserName = payload.Email,
                        FirstName = payload.GivenName,
                        LastName = payload.FamilyName,
                        EmailConfirmed = true,
                        CreatedAt = DateTime.UtcNow
                    };

                    var result = await _userManager.CreateAsync(user);
                    if (!result.Succeeded)
                    {
                        return BadRequest(result.Errors);
                    }

                    // Dodaj rolę User
                    await _userManager.AddToRoleAsync(user, "User");
                }

                // Wygeneruj token JWT
                var token = _jwtService.GenerateJwtToken(user);

                return Ok(new
                {
                    Token = token,
                    User = new
                    {
                        user.Id,
                        user.Email,
                        user.FirstName,
                        user.LastName
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during Google authentication");
                return BadRequest("Invalid Google token");
            }
        }

        [HttpPost("register")]
        public async Task<ActionResult<AuthResponseDto>> Register(RegisterDto registerDto)
        {
            if (await _userManager.Users.AnyAsync(u => u.Email == registerDto.Email))
                return BadRequest("Email is already registered");

            var user = new User
            {
                Email = registerDto.Email,
                UserName = registerDto.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(registerDto.Password),
                FirstName = registerDto.FirstName,
                LastName = registerDto.LastName,
                PhoneNumber = registerDto.PhoneNumber,
                CreatedAt = DateTime.UtcNow
            };

            var result = await _userManager.CreateAsync(user, registerDto.Password);
            if (!result.Succeeded)
            {
                return BadRequest(result.Errors);
            }

            await _userManager.AddToRoleAsync(user, "User");

            var userDto = await CreateUserDto(user);
            var token = await _jwtService.GenerateJwtToken(user);

            return new AuthResponseDto
            {
                User = userDto,
                Token = token
            };
        }

        [HttpPost("login")]
        public async Task<ActionResult<AuthResponseDto>> Login(LoginDto loginDto)
        {
            var user = await _userManager.Users
                .FirstOrDefaultAsync(u => u.Email == loginDto.Email);

            if (user == null)
                return Unauthorized("Invalid email");

            if (!await _userManager.CheckPasswordAsync(user, loginDto.Password))
                return Unauthorized("Invalid password");

            user.LastLogin = DateTime.UtcNow;
            await _userManager.UpdateAsync(user);

            var userDto = await CreateUserDto(user);
            var token = await _jwtService.GenerateJwtToken(user);

            return new AuthResponseDto
            {
                User = userDto,
                Token = token
            };
        }

        [Authorize]
        [HttpPost("change-password")]
        public async Task<ActionResult> ChangePassword(ChangePasswordDto changePasswordDto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            var user = await _userManager.Users.FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
                return NotFound("User not found");

            if (!await _userManager.CheckPasswordAsync(user, changePasswordDto.CurrentPassword))
                return BadRequest("Current password is incorrect");

            var result = await _userManager.ChangePasswordAsync(user, changePasswordDto.CurrentPassword, changePasswordDto.NewPassword);
            if (!result.Succeeded)
            {
                return BadRequest(result.Errors);
            }

            return Ok(new { message = "Password changed successfully" });
        }

        private async Task<UserDto> CreateUserDto(User user)
        {
            var roles = await _userManager.GetRolesAsync(user);
            var rolesList = roles.ToList();
            return new UserDto
            {
                Id = user.Id,
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                PhoneNumber = user.PhoneNumber,
                Roles = rolesList
            };
        }
    }

    public class GoogleLoginRequest
    {
        public string Credential { get; set; }
    }
}
