using System.ComponentModel.DataAnnotations;

namespace AllAboutNail.API.Models.DTOs
{
    public class AppointmentStatusUpdateDto
    {
        [Required]
        public AppointmentStatus Status { get; set; }
    }
}
