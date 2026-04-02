using System;
using AllAboutNail.API.Data;
using Microsoft.EntityFrameworkCore;

namespace AllAboutNail.API.Models.Validators
{
    public class AppointmentValidator
    {
        private readonly ApplicationDbContext _context;

        public AppointmentValidator(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<(bool isValid, string errorMessage)> ValidateAppointmentTime(
            DateTime startTime,
            int employeeId,
            int serviceId,
            int? existingAppointmentId = null)
        {
            // Sprawdź czy termin nie jest w przeszłości
            if (startTime < DateTime.UtcNow)
            {
                return (false, "Nie można utworzyć wizyty w przeszłości");
            }

            // Sprawdź czy termin nie jest dalej niż 4 tygodnie
            if (startTime > DateTime.UtcNow.AddDays(28))
            {
                return (false, "Nie można utworzyć wizyty dalej niż 4 tygodnie w przód");
            }

            // Pobierz godziny pracy
            var dayOfWeek = (int)startTime.DayOfWeek - 1;
            var workingHours = await _context.WorkingHours
                .FirstOrDefaultAsync(wh => 
                    wh.EmployeeId == employeeId && 
                    wh.DayOfWeek == dayOfWeek);

            if (workingHours == null)
            {
                return (false, "Pracownik nie pracuje w tym dniu");
            }

            // Pobierz usługę
            var service = await _context.Services.FindAsync(serviceId);
            if (service == null)
            {
                return (false, "Nie znaleziono wybranej usługi");
            }

            if (!service.IsActive)
            {
                return (false, "Usługa jest nieaktywna");
            }

            var endTime = startTime.AddMinutes(service.DurationInMinutes);
            var startTimeOfDay = startTime.TimeOfDay;
            var endTimeOfDay = endTime.TimeOfDay;

            // Sprawdź czy wizyta mieści się w godzinach pracy
            if (startTimeOfDay < workingHours.StartTime || endTimeOfDay > workingHours.EndTime)
            {
                return (false, "Termin wizyty jest poza godzinami pracy");
            }

            // Sprawdź kolizję z przerwą
            if (workingHours.BreakStartTime.HasValue && workingHours.BreakEndTime.HasValue)
            {
                var breakStart = startTime.Date.Add(workingHours.BreakStartTime.Value);
                var breakEnd = startTime.Date.Add(workingHours.BreakEndTime.Value);

                if (!(startTime >= breakEnd || endTime <= breakStart))
                {
                    return (false, "Termin koliduje z przerwą pracownika");
                }
            }

            // Sprawdź kolizje z innymi wizytami
            var conflictQuery = _context.Appointments
                .Where(a =>
                    a.EmployeeId == employeeId &&
                    a.Status == AppointmentStatus.Scheduled &&
                    !(startTime >= a.EndTime || endTime <= a.StartTime));

            // Jeśli edytujemy istniejącą wizytę, wykluczamy ją z sprawdzania kolizji
            if (existingAppointmentId.HasValue)
            {
                conflictQuery = conflictQuery.Where(a => a.Id != existingAppointmentId.Value);
            }

            var hasConflict = await conflictQuery.AnyAsync();
            if (hasConflict)
            {
                return (false, "Wybrany termin koliduje z inną wizytą");
            }

            return (true, null);
        }

        public async Task<(bool isValid, string errorMessage)> ValidateAppointment(Appointment appointment)
        {
            var service = await _context.Services.FindAsync(appointment.ServiceId);
            if (service == null)
            {
                return (false, "Usługa nie istnieje");
            }

            if (!service.IsActive)
            {
                return (false, "Usługa jest nieaktywna");
            }

            var employee = await _context.Users.FindAsync(appointment.EmployeeId);
            if (employee == null)
            {
                return (false, "Pracownik nie istnieje");
            }

            if (!employee.IsActive)
            {
                return (false, "Pracownik jest nieaktywny");
            }

            var client = await _context.Users.FindAsync(appointment.ClientId);
            if (client == null)
            {
                return (false, "Klient nie istnieje");
            }

            if (!client.IsActive)
            {
                return (false, "Klient jest nieaktywny");
            }

            return (true, null);
        }

        public bool CanUserModifyAppointment(Appointment appointment, int userId, bool isAdminOrEmployee)
        {
            // Admin lub pracownik może modyfikować wszystkie wizyty
            if (isAdminOrEmployee)
            {
                return true;
            }

            // Zwykły użytkownik może modyfikować tylko swoje wizyty
            if (appointment.ClientId != userId)
            {
                return false;
            }

            // Sprawdź czy do wizyty zostało więcej niż 24h
            var hoursUntilAppointment = (appointment.StartTime - DateTime.UtcNow).TotalHours;
            return hoursUntilAppointment >= 24;
        }

        public async Task<(bool canChange, string errorMessage)> CanChangeStatus(int appointmentId, AppointmentStatus newStatus)
        {
            var appointment = await _context.Appointments
                .Include(a => a.Employee)
                .Include(a => a.Client)
                .FirstOrDefaultAsync(a => a.Id == appointmentId);

            if (appointment == null)
            {
                return (false, "Wizyta nie istnieje");
            }

            if (!appointment.Employee.IsActive)
            {
                return (false, "Pracownik jest nieaktywny");
            }

            if (!appointment.Client.IsActive)
            {
                return (false, "Klient jest nieaktywny");
            }

            switch (newStatus)
            {
                case AppointmentStatus.Cancelled:
                    if (!appointment.Employee.IsActive)
                    {
                        var hoursUntilAppointment = (appointment.StartTime - DateTime.UtcNow).TotalHours;
                        if (hoursUntilAppointment < 24)
                        {
                            return (false, "Wizytę można anulować najpóźniej 24 godziny przed jej rozpoczęciem");
                        }
                    }
                    break;

                case AppointmentStatus.Completed:
                case AppointmentStatus.NoShow:
                    if (!appointment.Employee.IsActive)
                    {
                        return (false, "Tylko pracownik lub administrator może zmienić status na ten typ");
                    }
                    if (appointment.Status != AppointmentStatus.Scheduled)
                    {
                        return (false, "Tylko zaplanowane wizyty mogą zmienić status na ten typ");
                    }
                    break;

                default:
                    return (false, "Nieprawidłowy status");
            }

            return (true, null);
        }
    }
}
