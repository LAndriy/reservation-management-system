using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace AllAboutNail.API.Models.DTOs
{
    public class UserDto
    {
        public int Id { get; set; }
        public string Email { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string PhoneNumber { get; set; }
        public List<string> Roles { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? LastLogin { get; set; }
        public bool IsActive { get; set; }
        public DateTime? DeactivatedAt { get; set; }
    }

    public class UpdateUserDto
    {
        [Required(ErrorMessage = "Imię jest wymagane")]
        [StringLength(50, ErrorMessage = "Imię nie może być dłuższe niż 50 znaków")]
        public string FirstName { get; set; }

        [Required(ErrorMessage = "Nazwisko jest wymagane")]
        [StringLength(50, ErrorMessage = "Nazwisko nie może być dłuższe niż 50 znaków")]
        public string LastName { get; set; }

        [Phone(ErrorMessage = "Nieprawidłowy format numeru telefonu")]
        [StringLength(15, ErrorMessage = "Numer telefonu nie może być dłuższy niż 15 znaków")]
        public string PhoneNumber { get; set; }
    }

    public class UpdateEmailDto
    {
        public string Email { get; set; }
    }

    public class AssignRoleDto
    {
        public string Email { get; set; }
        public string Role { get; set; }
    }
}
