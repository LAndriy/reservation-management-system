# AllAboutNail.API

Backend aplikacji realizujący logikę biznesową dla systemu zarządzania salonem kosmetycznym. API zbudowane w oparciu o architekturę ASP.NET Core, zapewniające obsługę rezerwacji, autoryzację użytkowników oraz zarządzanie harmonogramami pracowników.

## 🏗️ Struktura Projektu

Kod został zorganizowany z zachowaniem separacji warstw:

* **Controllers/** - Udostępnia punkty końcowe (endpoints) i zarządza routingiem HTTP.
* **Services/** - Realizuje główną logikę biznesową (np. walidacja dostępności terminów, generowanie JWT).
* **Data/** - Definiuje kontekst bazy danych (Entity Framework Core) oraz repozytoria.
* **Models/** - Reprezentuje encje domenowe oraz obiekty transferu danych (DTO).
* **Migrations/** - Przechowuje historię zmian schematu bazy danych.

## ⚙️ Kluczowe Funkcjonalności i Implementacja

### 1. System Rezerwacji Wizyt
Obsługuje proces tworzenia, anulowania i weryfikacji rezerwacji, przypisując je do konkretnych pracowników i usług.

```csharp
public async Task<IActionResult> CreateAppointment([FromBody] AppointmentDto appointmentDto)
{
    var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
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

### 2. System Harmonogramowania
Automatycznie wylicza dostępne sloty czasowe na podstawie godzin pracy salonu oraz już istniejących rezerwacji.

```csharp
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

### 3. Bezpieczeństwo i Autoryzacja (JWT)
API zabezpieczone jest mechanizmem tokenów JWT. System weryfikuje tożsamość i zarządza dostępem na podstawie ról (Admin, Employee, Client).

```csharp
// Generowanie i walidacja oparta na Claims
public async Task<string> GenerateJwtToken(User user)
{
    var claims = new List<Claim>
    {
        new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
        new Claim(ClaimTypes.Email, user.Email),
        new Claim(ClaimTypes.Role, user.Role)
    };
    // Implementacja podpisu
}
```

## 📡 Główne Endpointy API

### Autentykacja
- `POST /api/auth/register` - Rejestracja nowego klienta
- `POST /api/auth/login` - Logowanie i pobieranie tokena JWT

### Zarządzanie Wizytami
- `POST /api/appointments` - Tworzenie nowej rezerwacji
- `GET /api/appointments/available-slots` - Pobieranie dostępnych terminów
- `PUT /api/appointments/{id}/cancel` - Anulowanie wizyty
- `GET /api/appointments/user` - Historia wizyt zalogowanego użytkownika

### Administracja Użytkownikami
- `GET /api/users/{id}` - Pobieranie danych profilowych
- `PUT /api/users/{id}` - Aktualizacja danych
- `POST /api/users/employee` - Dodawanie konta pracowniczego (Wymaga roli Admin)

## 🚀 Konfiguracja i Uruchomienie

### Wymagania
* .NET 8.0 SDK
* Serwer SQL (np. SQL Server Express lub obraz Docker)

### Setup lokalny
1. Przejdź do katalogu backendu: `cd src/Backend`
2. Zaktualizuj łańcuch połączenia (`ConnectionStrings:DefaultConnection`) w pliku `appsettings.Development.json`.
3. Zastosuj migracje do swojej bazy danych:
   ```bash
   dotnet ef database update
   ```
4. Uruchom aplikację:
   ```bash
   dotnet run
   ```

## 📝 Licencja
Projekt udostępniony na licencji MIT. Szablon i kod można swobodnie modyfikować.