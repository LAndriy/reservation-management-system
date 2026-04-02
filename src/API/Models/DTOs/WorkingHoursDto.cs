namespace AllAboutNail.API.Models.DTOs
{
    public class WorkingHoursDto
    {
        public int EmployeeId { get; set; }
        public int DayOfWeek { get; set; }
        public string StartTime { get; set; }
        public string EndTime { get; set; }
        public string? BreakStartTime { get; set; }
        public string? BreakEndTime { get; set; }
    }

    public class WorkingHoursResponseDto
    {
        public int Id { get; set; }
        public int EmployeeId { get; set; }
        public int DayOfWeek { get; set; }
        public string StartTime { get; set; }
        public string EndTime { get; set; }
        public string? BreakStartTime { get; set; }
        public string? BreakEndTime { get; set; }
    }
}
