namespace AllAboutNail.API.Models.DTOs
{
    public class AuthResponseDto
    {
        public UserDto User { get; set; }
        public string Token { get; set; }
    }
}
