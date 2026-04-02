using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using AllAboutNail.API.Models;

namespace AllAboutNail.API.Data
{
    public class ApplicationDbContext : IdentityDbContext<User, IdentityRole<int>, int,
        IdentityUserClaim<int>, IdentityUserRole<int>, IdentityUserLogin<int>,
        IdentityRoleClaim<int>, IdentityUserToken<int>>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<Service> Services { get; set; }
        public DbSet<WorkingHours> WorkingHours { get; set; }
        public DbSet<TimeOff> TimeOffs { get; set; }
        public DbSet<Appointment> Appointments { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            // Konfiguracja dla User
            builder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();

            builder.Entity<User>()
                .Property(u => u.FirstName)
                .HasMaxLength(100);

            builder.Entity<User>()
                .Property(u => u.LastName)
                .HasMaxLength(100);

            // Konfiguracja dla Service
            builder.Entity<Service>()
                .Property(s => s.Price)
                .HasPrecision(10, 2);

            // Konfiguracja dla WorkingHours
            builder.Entity<WorkingHours>()
                .HasOne(wh => wh.Employee)
                .WithMany()
                .HasForeignKey(wh => wh.EmployeeId)
                .OnDelete(DeleteBehavior.Restrict);

            // Konfiguracja dla TimeOff
            builder.Entity<TimeOff>()
                .HasOne(to => to.Employee)
                .WithMany()
                .HasForeignKey(to => to.EmployeeId)
                .OnDelete(DeleteBehavior.Restrict);

            // Konfiguracja dla Appointment
            builder.Entity<Appointment>()
                .HasOne(a => a.Employee)
                .WithMany()
                .HasForeignKey(a => a.EmployeeId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<Appointment>()
                .HasOne(a => a.Client)
                .WithMany()
                .HasForeignKey(a => a.ClientId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<Appointment>()
                .HasOne(a => a.Service)
                .WithMany()
                .HasForeignKey(a => a.ServiceId)
                .OnDelete(DeleteBehavior.Restrict);

            // Seed initial services
            builder.Entity<Service>().HasData(
                new Service
                {
                    Id = 1,
                    Name = "Manicure klasyczny",
                    Description = "Tradycyjny manicure z malowaniem paznokci",
                    Price = 60.00M,
                    DurationInMinutes = 45
                },
                new Service
                {
                    Id = 2,
                    Name = "Manicure hybrydowy",
                    Description = "Manicure z użyciem lakieru hybrydowego",
                    Price = 90.00M,
                    DurationInMinutes = 60
                },
                new Service
                {
                    Id = 3,
                    Name = "Pedicure",
                    Description = "Pełny zabieg pedicure",
                    Price = 100.00M,
                    DurationInMinutes = 60
                }
            );
        }
    }
}
