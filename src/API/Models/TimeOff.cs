using System.ComponentModel.DataAnnotations;

namespace AllAboutNail.API.Models
{
    public enum TimeOffStatus
    {
        Pending,
        Approved,
        Rejected
    }

    public class TimeOff
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "ID pracownika jest wymagane")]
        public int EmployeeId { get; set; }
        public User? Employee { get; set; }

        [Required(ErrorMessage = "Data rozpoczęcia jest wymagana")]
        public DateTime StartDate { get; set; }

        [Required(ErrorMessage = "Data zakończenia jest wymagana")]
        public DateTime EndDate { get; set; }

        [Required(ErrorMessage = "Powód jest wymagany")]
        [MaxLength(200, ErrorMessage = "Powód nie może być dłuższy niż 200 znaków")]
        public string? Reason { get; set; }

        public TimeOffStatus Status { get; set; } = TimeOffStatus.Pending;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Walidacja
        public bool IsValid()
        {
            if (StartDate >= EndDate)
                return false;

            if (StartDate.Date < DateTime.UtcNow.Date)
                return false;

            return true;
        }
    }
}
