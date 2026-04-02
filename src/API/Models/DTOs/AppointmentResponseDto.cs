namespace AllAboutNail.API.Models.DTOs
{
    public class AppointmentResponseDto
    {
        public int Id { get; set; }
        public int EmployeeId { get; set; }
        public string EmployeeName { get; set; }
        public int ServiceId { get; set; }
        public string ServiceName { get; set; }
        public string StartTime { get; set; }
        public string EndTime { get; set; }
        public string Status { get; set; }
        public decimal Price { get; set; }
    }
}
