using System.ComponentModel.DataAnnotations;

namespace AllAboutNail.API.Models.DTOs
{
    public class RegisterDto
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,}$",
            ErrorMessage = "Hasło musi zawierać minimum 8 znaków, w tym jedną wielką literę, jedną małą literę, jedną cyfrę i jeden znak specjalny.")]
        public string Password { get; set; }

        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        [Required]
        [RegularExpression(@"^\d{9}$", ErrorMessage = "Nieprawidłowy format numeru telefonu (wymagane 9 cyfr)")]
        public string? PhoneNumber { get; set; }

        [Required]
        [Range(typeof(bool), "true", "true", ErrorMessage = "Musisz wyrazić zgodę na przetwarzanie danych osobowych")]
        public bool PrivacyConsent { get; set; }
    }
}
