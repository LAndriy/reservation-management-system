using System.Collections.Generic;
using System.Threading.Tasks;
using AllAboutNail.API.Models;

namespace AllAboutNail.API.Repositories
{
    public interface IUserRepository
    {
        Task<List<User>> GetAllUsers();
        Task<User> GetUserById(int userId);
        Task<User> AddUser(User user);
        Task UpdateUser(User user);
        Task DeleteUser(int userId);
        Task<User> GetUserByEmail(string email);
    }
}