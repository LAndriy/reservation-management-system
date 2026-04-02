using System.ComponentModel.DataAnnotations;

namespace AllAboutNail.API.Models
{
    public class Service
    {
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
        public string Name { get; set; }

        [StringLength(500)]
        public string Description { get; set; }

        [Required]
        [Range(0, 10000)]
        public decimal Price { get; set; }

        [Required]
        [Range(1, 480)]
        public int DurationInMinutes { get; set; }

        public string Category { get; set; } = "Inne"; 
        public bool IsActive { get; set; } = true;
        public DateTime? DeactivatedAt { get; set; }
    }
}
