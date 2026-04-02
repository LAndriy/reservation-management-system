using Microsoft.EntityFrameworkCore;
using AllAboutNail.API.Data;
using AllAboutNail.API.Models;

namespace AllAboutNail.API.Models.Validators
{
    public class WorkingHoursValidator
    {
        private readonly ApplicationDbContext _context;

        public WorkingHoursValidator(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<(bool isValid, string errorMessage)> ValidateWorkingHours(WorkingHours workingHours)
        {
            // Sprawdź czy pracownik istnieje
            var employee = await _context.Users.FindAsync(workingHours.EmployeeId);
            if (employee == null)
            {
                return (false, "Pracownik nie istnieje");
            }

            // Sprawdź czy nie ma już godzin pracy dla tego dnia
            var existingWorkingHours = await _context.WorkingHours
                .FirstOrDefaultAsync(wh => 
                    wh.EmployeeId == workingHours.EmployeeId && 
                    wh.DayOfWeek == workingHours.DayOfWeek &&
                    wh.Id != workingHours.Id);

            if (existingWorkingHours != null)
            {
                return (false, "Pracownik ma już ustawione godziny pracy na ten dzień");
            }

            // Sprawdź czy godziny są poprawne
            if (workingHours.StartTime >= workingHours.EndTime)
            {
                return (false, "Godzina rozpoczęcia musi być wcześniejsza niż godzina zakończenia");
            }

            // Sprawdź czy przerwa jest w godzinach pracy
            if (workingHours.BreakStartTime.HasValue && workingHours.BreakEndTime.HasValue)
            {
                if (workingHours.BreakStartTime >= workingHours.BreakEndTime)
                {
                    return (false, "Godzina rozpoczęcia przerwy musi być wcześniejsza niż godzina zakończenia przerwy");
                }

                if (workingHours.BreakStartTime < workingHours.StartTime ||
                    workingHours.BreakEndTime > workingHours.EndTime)
                {
                    return (false, "Przerwa musi być w godzinach pracy");
                }
            }
            else if ((workingHours.BreakStartTime.HasValue && !workingHours.BreakEndTime.HasValue) ||
                     (!workingHours.BreakStartTime.HasValue && workingHours.BreakEndTime.HasValue))
            {
                return (false, "Musisz ustawić zarówno początek jak i koniec przerwy");
            }

            // Sprawdź czy nie ma już wizyt w tym czasie
            var appointments = await _context.Appointments
                .Where(a => 
                    a.EmployeeId == workingHours.EmployeeId && 
                    a.Status == AppointmentStatus.Scheduled)
                .ToListAsync();

            foreach (var appointment in appointments)
            {
                // Sprawdź czy wizyta jest w tym samym dniu tygodnia
                if ((int)appointment.StartTime.DayOfWeek + 1 != workingHours.DayOfWeek)
                {
                    continue;
                }

                var appointmentStartTime = appointment.StartTime.TimeOfDay;
                var appointmentEndTime = appointment.EndTime.TimeOfDay;

                if (appointmentStartTime < workingHours.StartTime ||
                    appointmentEndTime > workingHours.EndTime)
                {
                    return (false, "Istnieją wizyty poza nowymi godzinami pracy");
                }

                if (workingHours.BreakStartTime.HasValue && workingHours.BreakEndTime.HasValue)
                {
                    if (!(appointmentEndTime <= workingHours.BreakStartTime ||
                          appointmentStartTime >= workingHours.BreakEndTime))
                    {
                        return (false, "Istnieją wizyty w czasie nowej przerwy");
                    }
                }
            }

            return (true, string.Empty);
        }

        public async Task<(bool isValid, string errorMessage)> ValidateWorkingHoursDelete(int id)
        {
            var workingHours = await _context.WorkingHours
                .Include(w => w.Employee)
                .FirstOrDefaultAsync(w => w.Id == id);

            if (workingHours == null)
            {
                return (false, "Godziny pracy nie istnieją");
            }

            // Sprawdź czy nie ma zaplanowanych wizyt
            var appointments = await _context.Appointments
                .Where(a => 
                    a.EmployeeId == workingHours.EmployeeId && 
                    (int)a.StartTime.DayOfWeek == workingHours.DayOfWeek &&
                    a.Status != AppointmentStatus.Cancelled)
                .ToListAsync();

            if (appointments.Any())
            {
                return (false, "Nie można usunąć godzin pracy, ponieważ są zaplanowane wizyty");
            }

            return (true, string.Empty);
        }
    }
}
