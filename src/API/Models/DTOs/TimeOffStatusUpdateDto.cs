using System.ComponentModel.DataAnnotations;

namespace AllAboutNail.API.Models.DTOs
{
    public class TimeOffStatusUpdateDto
    {
        [Required]
        public TimeOffStatus NewStatus { get; set; }
    }
}
