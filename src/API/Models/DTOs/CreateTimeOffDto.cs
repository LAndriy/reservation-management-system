using System.ComponentModel.DataAnnotations;

namespace AllAboutNail.API.Models.DTOs
{
    public class CreateTimeOffDto
    {
        [Required(ErrorMessage = "Data rozpoczęcia jest wymagana")]
        public DateTime StartDate { get; set; }

        [Required(ErrorMessage = "Data zakończenia jest wymagana")]
        public DateTime EndDate { get; set; }

        [Required(ErrorMessage = "Powód jest wymagany")]
        [MaxLength(200, ErrorMessage = "Powód nie może być dłuższy niż 200 znaków")]
        public string Reason { get; set; }
    }
}
