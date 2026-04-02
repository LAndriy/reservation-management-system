using System.Collections.Generic;
using System.Threading.Tasks;
using AllAboutNail.API.Models;

namespace AllAboutNail.API.Repositories
{
    public interface IAppointmentRepository
    {
        Task<List<Appointment>> GetEmployeeAppointments(int employeeId);
        Task<Appointment> AddAppointment(Appointment appointment);
        Task CancelAppointment(int appointmentId);
        Task<Appointment> GetAppointmentById(int appointmentId);
        Task UpdateAppointment(Appointment appointment);
        Task<List<Appointment>> GetAllAppointments();
    }
}