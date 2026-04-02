using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AllAboutNail.API.Models;
using AllAboutNail.API.Data;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Identity;

namespace AllAboutNail.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AppointmentsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<AppointmentsController> _logger;
        private readonly UserManager<User> _userManager;

        public AppointmentsController(
            ApplicationDbContext context,
            ILogger<AppointmentsController> logger,
            UserManager<User> userManager)
        {
            _context = context;
            _logger = logger;
            _userManager = userManager;
        }

        // Metoda pomocnicza do aktualizacji statusów przeszłych wizyt
        private async Task UpdatePastAppointmentsStatus(IQueryable<Appointment> appointmentsQuery)
        {
            var now = DateTime.UtcNow;
            var pastAppointments = await appointmentsQuery
                .Where(a => a.StartTime < now && a.Status == AppointmentStatus.Scheduled)
                .ToListAsync();

            foreach (var appointment in pastAppointments)
            {
                appointment.Status = AppointmentStatus.Completed;
            }

            if (pastAppointments.Any())
            {
                await _context.SaveChangesAsync();
            }
        }

        // GET: api/Appointments/employee/{employeeId}
        [HttpGet("employee/{employeeId}")]
        [Authorize(Roles = "Admin,Employee")]
        public async Task<ActionResult<IEnumerable<Appointment>>> GetEmployeeAppointments(int employeeId)
        {
            var appointmentsQuery = _context.Appointments
                .Where(a => a.EmployeeId == employeeId);

            // Aktualizuj statusy przeszłych wizyt
            await UpdatePastAppointmentsStatus(appointmentsQuery);

            var appointments = await appointmentsQuery
                .Include(a => a.Client)
                .Include(a => a.Service)
                .OrderBy(a => a.StartTime)
                .Select(a => new
                {
                    a.Id,
                    a.StartTime,
                    a.Status,
                    Client = new
                    {
                        a.Client.FirstName,
                        a.Client.LastName,
                        a.Client.PhoneNumber
                    },
                    Service = new
                    {
                        a.Service.Name,
                        a.Service.DurationInMinutes,
                        a.Service.Price
                    }
                })
                .ToListAsync();

            return Ok(appointments);
        }

        // GET: api/Appointments/user
        [HttpGet("user/{userId?}")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<Appointment>>> GetUserAppointments(int? userId = null)
        {
            try
            {
                var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
                var isAdminOrEmployee = User.IsInRole("Admin") || User.IsInRole("Employee");
                
                // Jeśli podano userId i użytkownik nie jest adminem/pracownikiem, może widzieć tylko swoje wizyty
                if (userId.HasValue && !isAdminOrEmployee && userId.Value != currentUserId)
                {
                    return Forbid();
                }

                // Jeśli nie podano userId, używamy id zalogowanego użytkownika
                var targetUserId = userId ?? currentUserId;

                var appointmentsQuery = _context.Appointments
                    .Include(a => a.Employee)
                    .Include(a => a.Service)
                    .Where(a => a.ClientId == targetUserId)
                    .OrderByDescending(a => a.StartTime);

                // Aktualizuj statusy przeszłych wizyt
                await UpdatePastAppointmentsStatus(appointmentsQuery);

                var appointments = await appointmentsQuery
                    .Select(a => new
                    {
                        a.Id,
                        a.StartTime,
                        a.EndTime,
                        a.Status,
                        Employee = new
                        {
                            a.Employee.FirstName,
                            a.Employee.LastName
                        },
                        Service = new
                        {
                            a.Service.Name,
                            a.Service.DurationInMinutes,
                            a.Service.Price
                        },
                        a.Notes,
                        a.CreatedAt,
                        a.CancelledAt
                    })
                    .ToListAsync();

                return Ok(appointments);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user appointments");
                return StatusCode(500, "Internal server error while getting user appointments");
            }
        }

        // GET: api/Appointments/available-slots
        [HttpGet("available-slots")]
        public async Task<ActionResult<IEnumerable<DateTime>>> GetAvailableSlots(
            [FromQuery] int employeeId, 
            [FromQuery] DateTime date,
            [FromQuery] int serviceId)
        {
            try
            {
                // Get service duration
                var service = await _context.Services.FindAsync(serviceId);
                if (service == null)
                {
                    return NotFound("Service not found");
                }

                // Generuj terminy na następne 4 tygodnie
                var availableSlots = new List<DateTime>();
                
                // Oblicz datę końcową - do końca ostatniego pełnego tygodnia
                var startDate = date.Date;
                var endDate = date.AddDays(28); // 4 tygodnie
                
                // Znajdź ostatnią sobotę (dzień 6) po endDate
                while (endDate.DayOfWeek != DayOfWeek.Saturday)
                {
                    endDate = endDate.AddDays(1);
                }

                _logger.LogInformation($"Generating slots from {startDate:yyyy-MM-dd} to {endDate:yyyy-MM-dd}");

                for (var currentDate = startDate; currentDate <= endDate; currentDate = currentDate.AddDays(1))
                {
                    var dayOfWeek = (int)currentDate.DayOfWeek;
                    
                    // Get employee's working hours for the day
                    var workingHours = await _context.WorkingHours
                        .FirstOrDefaultAsync(wh => 
                            wh.EmployeeId == employeeId && 
                            wh.DayOfWeek == dayOfWeek);

                    if (workingHours == null)
                    {
                        continue; // Pomiń dni bez zdefiniowanych godzin pracy
                    }

                    // Sprawdź czy pracownik ma urlop w tym dniu
                    var hasTimeOff = await _context.TimeOffs
                        .AnyAsync(to => 
                            to.EmployeeId == employeeId &&
                            to.StartDate.Date <= currentDate.Date &&
                            to.EndDate.Date >= currentDate.Date);

                    if (hasTimeOff)
                    {
                        continue; // Pomiń dni urlopowe
                    }

                    // Pobierz istniejące wizyty na dany dzień
                    var existingAppointments = await _context.Appointments
                        .Include(a => a.Service)
                        .Where(a => 
                            a.EmployeeId == employeeId &&
                            a.StartTime.Date == currentDate.Date &&
                            a.Status == AppointmentStatus.Scheduled)
                        .OrderBy(a => a.StartTime)
                        .ToListAsync();

                    // Oblicz dostępne sloty dla danego dnia
                    var startTime = new DateTime(
                        currentDate.Year, currentDate.Month, currentDate.Day,
                        workingHours.StartTime.Hours, workingHours.StartTime.Minutes, 0
                    );

                    var endTime = new DateTime(
                        currentDate.Year, currentDate.Month, currentDate.Day,
                        workingHours.EndTime.Hours, workingHours.EndTime.Minutes, 0
                    );

                    var currentSlot = startTime;
                    while (currentSlot.AddMinutes(service.DurationInMinutes) <= endTime)
                    {
                        // Sprawdź czy slot nie koliduje z przerwą
                        if (workingHours.BreakStartTime.HasValue && workingHours.BreakEndTime.HasValue)
                        {
                            var breakStart = currentSlot.Date.Add(workingHours.BreakStartTime.Value);
                            var breakEnd = currentSlot.Date.Add(workingHours.BreakEndTime.Value);

                            if (!(currentSlot >= breakEnd || currentSlot.AddMinutes(service.DurationInMinutes) <= breakStart))
                            {
                                currentSlot = breakEnd;
                                continue;
                            }
                        }

                        // Sprawdź czy slot nie koliduje z istniejącymi wizytami
                        var isSlotAvailable = true;
                        foreach (var appointment in existingAppointments)
                        {
                            if (!(currentSlot >= appointment.StartTime.AddMinutes(appointment.Service.DurationInMinutes) ||
                                currentSlot.AddMinutes(service.DurationInMinutes) <= appointment.StartTime))
                            {
                                isSlotAvailable = false;
                                break;
                            }
                        }

                        if (isSlotAvailable)
                        {
                            availableSlots.Add(currentSlot);
                        }

                        currentSlot = currentSlot.AddMinutes(30); // Interwał 30 minut między slotami
                    }
                }

                return Ok(availableSlots.OrderBy(s => s));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting available slots");
                return StatusCode(500, "Internal server error while getting available slots");
            }
        }

        // POST: api/Appointments
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> CreateAppointment([FromBody] AppointmentDto appointmentDto)
        {
            try
            {
                _logger.LogInformation("Creating appointment: {@AppointmentDto}", appointmentDto);

                // Get current user ID from token
                var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
                var client = await _userManager.FindByIdAsync(userId.ToString());
                if (client == null)
                {
                    return BadRequest(new { errors = new { Auth = new[] { "User not found" } } });
                }

                // Validate employee
                var employee = await _context.Users.FindAsync(appointmentDto.EmployeeId);
                if (employee == null)
                {
                    return BadRequest(new { errors = new { Employee = new[] { "Employee not found" } } });
                }

                // Validate service
                var service = await _context.Services.FindAsync(appointmentDto.ServiceId);
                if (service == null)
                {
                    return BadRequest(new { errors = new { Service = new[] { "Service not found" } } });
                }

                // Calculate end time based on service duration
                var startTime = appointmentDto.StartTime;
                var endTime = startTime.AddMinutes(service.DurationInMinutes);

                // Basic validation
                if (startTime < DateTime.UtcNow)
                {
                    return BadRequest(new { errors = new { StartTime = new[] { "Cannot create appointment in the past" } } });
                }

                if (startTime > DateTime.UtcNow.AddDays(28))
                {
                    return BadRequest(new { errors = new { StartTime = new[] { "Cannot create appointment more than 4 weeks in advance" } } });
                }

                // Check employee's working hours
                var dayOfWeek = (int)startTime.DayOfWeek;
                var workingHours = await _context.WorkingHours
                    .FirstOrDefaultAsync(wh => 
                        wh.EmployeeId == appointmentDto.EmployeeId && 
                        wh.DayOfWeek == dayOfWeek);

                if (workingHours == null)
                {
                    return BadRequest(new { errors = new { StartTime = new[] { "Employee is not working on this day" } } });
                }

                var startTimeOfDay = startTime.TimeOfDay;
                var endTimeOfDay = endTime.TimeOfDay;

                if (startTimeOfDay < workingHours.StartTime || endTimeOfDay > workingHours.EndTime)
                {
                    return BadRequest(new { errors = new { StartTime = new[] { "Appointment time is outside of working hours" } } });
                }

                // Check for break time conflicts
                if (workingHours.BreakStartTime.HasValue && workingHours.BreakEndTime.HasValue)
                {
                    var breakStart = startTime.Date.Add(workingHours.BreakStartTime.Value);
                    var breakEnd = startTime.Date.Add(workingHours.BreakEndTime.Value);

                    if (!(startTime >= breakEnd || endTime <= breakStart))
                    {
                        return BadRequest(new { errors = new { StartTime = new[] { "Appointment conflicts with break time" } } });
                    }
                }

                // Check for conflicts with other appointments
                var hasConflict = await _context.Appointments
                    .AnyAsync(a =>
                        a.EmployeeId == appointmentDto.EmployeeId &&
                        a.Status == AppointmentStatus.Scheduled &&
                        !(startTime >= a.EndTime || endTime <= a.StartTime));

                if (hasConflict)
                {
                    return BadRequest(new { errors = new { StartTime = new[] { "Time slot is already booked" } } });
                }

                // Create and save the appointment
                var appointment = new Appointment
                {
                    ClientId = userId,
                    EmployeeId = appointmentDto.EmployeeId,
                    ServiceId = appointmentDto.ServiceId,
                    StartTime = startTime,
                    EndTime = endTime,
                    Status = AppointmentStatus.Scheduled,
                    CreatedAt = DateTime.UtcNow,
                    Notes = appointmentDto.Notes
                };

                _context.Appointments.Add(appointment);
                await _context.SaveChangesAsync();

                // Include related entities in the response
                appointment.Client = client;
                appointment.Employee = employee;
                appointment.Service = service;

                return CreatedAtAction(nameof(GetUserAppointments), 
                    new { userId = appointment.ClientId }, appointment);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating appointment");
                return StatusCode(500, "Error creating appointment");
            }
        }

        // DELETE: api/Appointments/5
        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteAppointment(int id)
        {
            try
            {
                var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
                var appointment = await _context.Appointments.FindAsync(id);
                
                if (appointment == null)
                {
                    return NotFound(new { errors = new { Appointment = new[] { "Appointment not found" } } });
                }

                // Sprawdź czy użytkownik jest właścicielem rezerwacji
                if (appointment.ClientId != userId)
                {
                    return BadRequest(new { errors = new { Auth = new[] { "You can only cancel your own appointments" } } });
                }

                // Sprawdź czy do wizyty zostało więcej niż 24h
                var now = DateTime.UtcNow;
                var hoursUntilAppointment = (appointment.StartTime - now).TotalHours;
                
                if (hoursUntilAppointment < 24)
                {
                    return BadRequest(new { errors = new { Time = new[] { "You cannot cancel appointments less than 24 hours before the scheduled time" } } });
                }

                _context.Appointments.Remove(appointment);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting appointment");
                return StatusCode(500, "Internal server error while deleting appointment");
            }
        }

        // PUT: api/Appointments/{id}/cancel
        [HttpPut("{id}/cancel")]
        [Authorize]
        public async Task<IActionResult> CancelAppointment(int id)
        {
            var appointment = await _context.Appointments.FindAsync(id);

            if (appointment == null)
            {
                return NotFound();
            }

            var user = await _userManager.GetUserAsync(User);
            var isAdminOrEmployee = User.IsInRole("Admin") || User.IsInRole("Employee");

            // Sprawdź czy użytkownik ma prawo anulować tę wizytę
            if (!isAdminOrEmployee && appointment.ClientId != user.Id)
            {
                return Forbid();
            }

            // Sprawdź czy wizyta może być anulowana
            if (appointment.Status == AppointmentStatus.Completed || 
                appointment.Status == AppointmentStatus.NoShow)
            {
                return BadRequest("Nie można anulować zakończonej wizyty lub wizyty oznaczonej jako 'nie przyszedł'.");
            }

            // Dla zwykłych użytkowników sprawdź limit czasowy 24h
            if (!isAdminOrEmployee && appointment.StartTime <= DateTime.UtcNow.AddHours(24))
            {
                return BadRequest("Wizytę można anulować najpóźniej 24 godziny przed jej rozpoczęciem.");
            }

            appointment.Status = AppointmentStatus.Cancelled;
            appointment.CancelledAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // PUT: api/Appointments/{id}/complete
        [HttpPut("{id}/complete")]
        [Authorize(Roles = "Admin,Employee")]
        public async Task<IActionResult> CompleteAppointment(int id)
        {
            var appointment = await _context.Appointments.FindAsync(id);
            if (appointment == null)
            {
                return NotFound();
            }

            if (appointment.Status != AppointmentStatus.Scheduled)
            {
                return BadRequest("Only scheduled appointments can be completed");
            }

            appointment.Status = AppointmentStatus.Completed;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // PUT: api/Appointments/{id}/noshow
        [HttpPut("{id}/noshow")]
        public async Task<IActionResult> MarkAsNoShow(int id)
        {
            var appointment = await _context.Appointments.FindAsync(id);

            if (appointment == null)
            {
                return NotFound();
            }

            // Sprawdź czy wizyta może być oznaczona jako "no-show"
            if (appointment.Status != AppointmentStatus.Scheduled)
            {
                return BadRequest("Tylko zaplanowane wizyty mogą być oznaczone jako 'no-show'.");
            }

            appointment.Status = AppointmentStatus.NoShow;
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
