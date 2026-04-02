using AllAboutNail.API.Data;
using Microsoft.EntityFrameworkCore;

namespace AllAboutNail.API.Models.Validators
{
    public class ServiceValidator
    {
        private readonly ApplicationDbContext _context;

        public ServiceValidator(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<(bool isValid, string errorMessage)> ValidateService(Service service, int? existingServiceId = null)
        {
            if (string.IsNullOrWhiteSpace(service.Name))
            {
                return (false, "Nazwa usługi jest wymagana");
            }

            if (service.Price <= 0)
            {
                return (false, "Cena musi być większa od 0");
            }

            if (service.DurationInMinutes <= 0)
            {
                return (false, "Czas trwania musi być większy od 0");
            }

            // Sprawdź czy nazwa jest unikalna (z pominięciem edytowanej usługi)
            var nameExists = await _context.Services
                .Where(s => s.Name == service.Name)
                .Where(s => !existingServiceId.HasValue || s.Id != existingServiceId.Value)
                .AnyAsync();

            if (nameExists)
            {
                return (false, "Usługa o takiej nazwie już istnieje");
            }

            return (true, null);
        }

        public async Task<bool> CanDeleteService(int serviceId)
        {
            // Sprawdź czy usługa nie jest używana w przyszłych wizytach
            return !await _context.Appointments
                .Where(a => a.ServiceId == serviceId)
                .Where(a => a.StartTime > DateTime.UtcNow)
                .Where(a => a.Status == AppointmentStatus.Scheduled)
                .AnyAsync();
        }
    }
}
