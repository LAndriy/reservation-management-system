using System.ComponentModel.DataAnnotations;

namespace AllAboutNail.API.Models
{
    public class AppointmentDto
    {
        [Required]
        public int EmployeeId { get; set; }

        [Required]
        public int ServiceId { get; set; }

        [Required]
        public DateTime StartTime { get; set; }

        public string Notes { get; set; }
    }
}
