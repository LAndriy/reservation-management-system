using System.Collections.Generic;
using System.Threading.Tasks;
using AllAboutNail.API.Models;

namespace AllAboutNail.API.Repositories
{
    public interface IServiceRepository
    {
        Task<List<Service>> GetAllServices();
        Task<Service> GetServiceById(int serviceId);
        Task<Service> AddService(Service service);
        Task UpdateService(Service service);
        Task DeleteService(int serviceId);
    }
}