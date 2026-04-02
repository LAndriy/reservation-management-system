using System.ComponentModel.DataAnnotations;

namespace AllAboutNail.API.Models.DTOs
{
    public class ServiceDto
    {
        [Required(ErrorMessage = "Nazwa jest wymagana")]
        [StringLength(100, ErrorMessage = "Nazwa nie może być dłuższa niż 100 znaków")]
        public string Name { get; set; }

        [StringLength(500, ErrorMessage = "Opis nie może być dłuższy niż 500 znaków")]
        public string Description { get; set; }

        [Required(ErrorMessage = "Cena jest wymagana")]
        [Range(0.01, 10000, ErrorMessage = "Cena musi być większa od 0 i mniejsza niż 10000")]
        public decimal Price { get; set; }

        [Required(ErrorMessage = "Czas trwania jest wymagany")]
        [Range(1, 480, ErrorMessage = "Czas trwania musi być między 1 a 480 minut")]
        public int DurationInMinutes { get; set; }

        public string Category { get; set; } = "Inne";
    }

    public class ServiceResponseDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public decimal Price { get; set; }
        public int DurationInMinutes { get; set; }
        public string Category { get; set; }
        public bool IsActive { get; set; }
        public DateTime? DeactivatedAt { get; set; }
    }
}
