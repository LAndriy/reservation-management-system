using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace AllAboutNail.API.Models
{
    public class WorkingHours
    {
        public int Id { get; set; }

        [Required]
        [Range(1, int.MaxValue, ErrorMessage = "EmployeeId must be greater than 0")]
        public int EmployeeId { get; set; }
        public User Employee { get; set; }

        [Required]
        public TimeSpan StartTime { get; set; } // 8:00

        [Required]
        public TimeSpan EndTime { get; set; }   // 18:00

        public TimeSpan? BreakStartTime { get; set; }
        public TimeSpan? BreakEndTime { get; set; }

        [Required]
        [Range(1, 6, ErrorMessage = "DayOfWeek must be between 1 (Monday) and 6 (Saturday)")]
        public int DayOfWeek { get; set; } 

        // Walidacja
        public bool IsValid()
        {
            if (StartTime >= EndTime)
                return false;

            if (BreakStartTime.HasValue && BreakEndTime.HasValue)
            {
                if (BreakStartTime.Value >= BreakEndTime.Value)
                    return false;

                if (BreakStartTime.Value < StartTime || BreakEndTime.Value > EndTime)
                    return false;
            }

            return true;
        }
    }
}
