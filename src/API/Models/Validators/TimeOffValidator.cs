using AllAboutNail.API.Data;
using Microsoft.EntityFrameworkCore;

namespace AllAboutNail.API.Models.Validators
{
    public class TimeOffValidator
    {
        private readonly ApplicationDbContext _context;

        public TimeOffValidator(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<(bool isValid, string errorMessage)> ValidateTimeOff(
            TimeOff timeOff,
            bool isNewTimeOff = true,
            int? existingTimeOffId = null)
        {
            if (timeOff.StartDate > timeOff.EndDate)
            {
                return (false, "Data rozpoczęcia musi być wcześniejsza niż data zakończenia");
            }

            if (timeOff.StartDate.Date < DateTime.UtcNow.Date)
            {
                return (false, "Data rozpoczęcia nie może być w przeszłości");
            }

            // Sprawdź czy nie ma konfliktu z innymi urlopami
            var conflictQuery = _context.TimeOffs
                .Where(t => t.EmployeeId == timeOff.EmployeeId)
                .Where(t => t.Status != TimeOffStatus.Rejected)
                .Where(t => 
                    (t.StartDate <= timeOff.StartDate && t.EndDate >= timeOff.StartDate) ||
                    (t.StartDate <= timeOff.EndDate && t.EndDate >= timeOff.EndDate) ||
                    (t.StartDate >= timeOff.StartDate && t.EndDate <= timeOff.EndDate));

            // Jeśli aktualizujemy istniejący urlop, wykluczamy go z sprawdzania
            if (!isNewTimeOff && existingTimeOffId.HasValue)
            {
                conflictQuery = conflictQuery.Where(t => t.Id != existingTimeOffId.Value);
            }

            if (await conflictQuery.AnyAsync())
            {
                return (false, "Wybrany termin koliduje z innym urlopem");
            }

            // Sprawdź czy nie ma zaplanowanych wizyt w tym okresie
            var hasAppointments = await _context.Appointments
                .Where(a => a.EmployeeId == timeOff.EmployeeId)
                .Where(a => a.Status == AppointmentStatus.Scheduled)
                .Where(a => a.StartTime.Date >= timeOff.StartDate.Date && 
                           a.StartTime.Date <= timeOff.EndDate.Date)
                .AnyAsync();

            if (hasAppointments)
            {
                return (false, "W wybranym terminie pracownik ma zaplanowane wizyty");
            }

            return (true, null);
        }

        public (bool canChange, string errorMessage) CanChangeStatus(
            TimeOff timeOff,
            TimeOffStatus newStatus,
            bool isAdmin)
        {
            if (!isAdmin)
            {
                return (false, "Tylko administrator może zmieniać status urlopu");
            }

            if (timeOff.Status == newStatus)
            {
                return (false, "Urlop już ma ten status");
            }

            if (timeOff.StartDate.Date < DateTime.UtcNow.Date)
            {
                return (false, "Nie można zmieniać statusu urlopu z przeszłości");
            }

            return (true, null);
        }
    }
}
