using AllAboutNail.API.Models;

namespace AllAboutNail.API.Services
{
    public interface IJwtService
    {
        Task<string> GenerateJwtToken(User user);
    }
}
