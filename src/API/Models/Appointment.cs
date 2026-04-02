using System.ComponentModel.DataAnnotations;

namespace AllAboutNail.API.Models
{
    public class Appointment
    {
        public int Id { get; set; }

        [Required]
        public int EmployeeId { get; set; }
        public User Employee { get; set; }

        [Required]
        public int ClientId { get; set; }
        public User Client { get; set; }

        [Required]
        public int ServiceId { get; set; }
        public Service Service { get; set; }

        [Required]
        public DateTime StartTime { get; set; }

        [Required]
        public DateTime EndTime { get; set; }

        [Required]
        public AppointmentStatus Status { get; set; } = AppointmentStatus.Scheduled;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime? CancelledAt { get; set; }

        public string Notes { get; set; }

        // Walidacja
        public bool IsValid()
        {
            // Sprawdź czy data rozpoczęcia jest przed datą zakończenia
            if (StartTime >= EndTime)
                return false;

            // Sprawdź czy wizyta nie jest w przeszłości
            if (StartTime < DateTime.UtcNow)
                return false;

            // Sprawdź czy wizyta nie jest za daleko w przyszłości (max 3 tygodnie)
            if (StartTime > DateTime.UtcNow.AddDays(21))
                return false;

            return true;
        }

        // Sprawdź czy można anulować wizytę (24h przed)
        public bool CanBeCancelled()
        {
            if (Status != AppointmentStatus.Scheduled)
                return false;

            return StartTime > DateTime.UtcNow.AddHours(24);
        }

        // Sprawdź czy wizyta się nakłada z inną
        public bool OverlapsWith(Appointment other)
        {
            if (other == null || other.Id == this.Id)
                return false;

            return (StartTime < other.EndTime && EndTime > other.StartTime);
        }
    }
}
