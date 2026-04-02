# AllAboutNail.API

## Opis Projektu
AllAboutNail.API to backend aplikacji służącej do zarządzania salonem kosmetycznym, specjalizującym się w usługach manicure i pedicure. API zostało zbudowane przy użyciu ASP.NET Core.

## Struktura Projektu

### Główne Komponenty
- **Controllers/** - Kontrolery API odpowiedzialne za obsługę żądań HTTP
- **Models/** - Modele danych reprezentujące encje biznesowe
- **Data/** - Warstwa dostępu do danych i konfiguracja bazy danych
- **Services/** - Warstwa usług zawierająca logikę biznesową
- **Migrations/** - Migracje bazy danych

### 1. Controllers
Kontrolery API odpowiadające za obsługę żądań HTTP.

### 2. Models
Modele danych reprezentujące encje biznesowe.

### 3. Services
Warstwa usług zawierająca logikę biznesową:

```csharp
// JwtService.cs - serwis do obsługi tokenów JWT
public class JwtService : IJwtService
{
    public async Task<string> GenerateJwtToken(User user)
    {
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email)
        };
        // Implementacja generowania tokena
    }
}
```

### 4. Data
Warstwa dostępu do danych i konfiguracja bazy danych.

## Kluczowe Funkcjonalności

### 1. System Rezerwacji Wizyt
```csharp
// Przykład tworzenia rezerwacji
public async Task<IActionResult> CreateAppointment([FromBody] AppointmentDto appointmentDto)
{
    var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
    var client = await _userManager.FindByIdAsync(userId.ToString());
    
    var appointment = new Appointment
    {
        EmployeeId = appointmentDto.EmployeeId,
        ClientId = userId,
        StartTime = appointmentDto.StartTime,
        ServiceId = appointmentDto.ServiceId
    };
    
    await _context.Appointments.AddAsync(appointment);
    await _context.SaveChangesAsync();
}
```

### 2. Zarządzanie Użytkownikami

### 3. System Harmonogramowania
```csharp
// Przykład sprawdzania dostępności terminów
public async Task<List<DateTime>> GetAvailableSlots(int employeeId, DateTime date)
{
    var workingHours = await _context.WorkingHours
        .Where(wh => wh.EmployeeId == employeeId)
        .ToListAsync();
        
    var existingAppointments = await _context.Appointments
        .Where(a => a.EmployeeId == employeeId && a.StartTime.Date == date.Date)
        .ToListAsync();
        
    // Logika generowania dostępnych slotów
}
```

## Endpointy API

### Autentykacja

### Zarządzanie Wizytami
- `POST /api/appointments` - Tworzenie nowej wizyty
- `GET /api/appointments/available-slots` - Pobieranie dostępnych terminów
- `PUT /api/appointments/{id}/cancel` - Anulowanie wizyty
- `GET /api/appointments/user` - Historia wizyt użytkownika

### Zarządzanie Użytkownikami
- `POST /api/users` - Rejestracja nowego użytkownika
- `GET /api/users/{id}` - Pobieranie danych użytkownika
- `PUT /api/users/{id}` - Aktualizacja danych użytkownika

## Bezpieczeństwo

### 1. Autoryzacja JWT
```csharp
// Konfiguracja JWT w Program.cs
services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(key),
            ValidateIssuer = false,
            ValidateAudience = false
        };
    });
```

### 2. Walidacja Danych
```csharp
public class AppointmentDto
{
    [Required]
    public int EmployeeId { get; set; }
    
    [Required]
    public int ServiceId { get; set; }
    
    [Required]
    [FutureDate]
    public DateTime StartTime { get; set; }
}
```

### 3. Obsługa Ról
```csharp
[Authorize(Roles = "Admin")]
[HttpPost("api/users/create-employee")]
public async Task<IActionResult> CreateEmployee(RegisterDto registerDto)
{
    var user = new User { /* ... */ };
    await _userManager.CreateAsync(user, registerDto.Password);
    await _userManager.AddToRoleAsync(user, "Employee");
}
```

### 4. Szyfrowanie Danych
```csharp
// Przykład hashowania hasła
public async Task<bool> ValidatePassword(string password)
{
    return await _userManager.CheckPasswordAsync(user, password);
}
```

## Wymagania Systemowe
- .NET 6.0 lub nowszy
- SQL Server (baza danych)
- Visual Studio 2022 lub nowszy (zalecane do rozwoju)

## Konfiguracja Projektu

### Instalacja
1. Sklonuj repozytorium
2. Otwórz projekt w Visual Studio
3. Przywróć pakiety NuGet
4. Zaktualizuj connection string w `appsettings.json`
5. Uruchom migracje bazy danych:
```
dotnet ef database update
```

### Uruchomienie
1. Skompiluj projekt
2. Uruchom aplikację poprzez:
```
dotnet run
```

## Rozwój Projektu
Projekt jest aktywnie rozwijany. Planowane funkcjonalności:
- System powiadomień
- Integracja z systemem płatności

## Wsparcie
W przypadku problemów lub pytań, prosimy o kontakt z zespołem deweloperskim lub utworzenie nowego issue w repozytorium.

## Licencja
Wszelkie prawa zastrzeżone
