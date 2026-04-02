using Microsoft.AspNetCore.Identity;

namespace AllAboutNail.API.Models
{
    public class User : IdentityUser<int>
    {
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string? AvatarUrl { get; set; }
        public bool PrivacyConsent { get; set; }
        public DateTime PrivacyConsentDate { get; set; }
        public DateTime? LastLogin { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public bool IsActive { get; set; } = true;
        public DateTime? DeactivatedAt { get; set; }
    }
}
