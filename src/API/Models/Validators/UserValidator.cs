using AllAboutNail.API.Data;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace AllAboutNail.API.Models.Validators
{
    public class UserValidator
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<User> _userManager;

        public UserValidator(ApplicationDbContext context, UserManager<User> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        public async Task<(bool isValid, string errorMessage)> ValidateUser(User user, string password = null)
        {
            if (string.IsNullOrWhiteSpace(user.FirstName))
            {
                return (false, "Imię jest wymagane");
            }

            if (string.IsNullOrWhiteSpace(user.LastName))
            {
                return (false, "Nazwisko jest wymagane");
            }

            if (string.IsNullOrWhiteSpace(user.Email))
            {
                return (false, "Email jest wymagany");
            }

            var emailExists = await _userManager.FindByEmailAsync(user.Email);
            if (emailExists != null && emailExists.Id != user.Id)
            {
                return (false, "Email jest już zajęty");
            }

            if (!string.IsNullOrEmpty(password))
            {
                var passwordValidator = new PasswordValidator<User>();
                var result = await passwordValidator.ValidateAsync(_userManager, null, password);
                if (!result.Succeeded)
                {
                    return (false, "Hasło nie spełnia wymagań bezpieczeństwa");
                }
            }

            return (true, null);
        }

        public async Task<bool> CanDeactivateUser(int userId)
        {
            // Sprawdź czy użytkownik nie ma przyszłych wizyt
            var hasFutureAppointments = await _context.Appointments
                .Where(a => (a.ClientId == userId || a.EmployeeId == userId) &&
                           a.StartTime > DateTime.UtcNow &&
                           a.Status == AppointmentStatus.Scheduled)
                .AnyAsync();

            if (hasFutureAppointments)
            {
                return false;
            }

            // Sprawdź czy pracownik nie ma aktywnych urlopów
            var hasActiveTimeOffs = await _context.TimeOffs
                .Where(t => t.EmployeeId == userId &&
                           t.EndDate > DateTime.UtcNow &&
                           t.Status == TimeOffStatus.Approved)
                .AnyAsync();

            return !hasActiveTimeOffs;
        }

        public async Task<(bool canChange, string errorMessage)> CanChangeRole(int userId, string newRole)
        {
            var user = await _userManager.FindByIdAsync(userId.ToString());
            if (user == null)
            {
                return (false, "Użytkownik nie istnieje");
            }

            if (!user.IsActive)
            {
                return (false, "Nie można zmienić roli nieaktywnego użytkownika");
            }

            var currentRoles = await _userManager.GetRolesAsync(user);
            if (currentRoles.Contains(newRole))
            {
                return (false, "Użytkownik już posiada tę rolę");
            }

            return (true, null);
        }
    }
}
