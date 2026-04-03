# AllAboutNail - System Zarządzania Rezerwacjami

Kompletny system zarządzania rezerwacjami z panelem analitycznym, realizujący pełny przepływ procesów biznesowych. Zbudowany z użyciem technologii Microsoft (.NET, C#, SQL) po stronie serwera oraz ekosystemu JavaScript/TypeScript po stronie klienta.

Projekt wykorzystuje architekturę monorepo w celu centralizacji zarządzania kodem i ułatwienia procesu CI/CD.

## 🏗️ Struktura Repozytorium

Logika aplikacji została podzielona na dwa niezależne środowiska technologiczne:

* **[Backend (API)](./src/API/README.md)** - Serwer oparty na platformie .NET. Odpowiada za logikę biznesową, autoryzację oraz komunikację z bazą danych SQL.
* **[Frontend (UI)](./src/UI/README.md)** - Aplikacja kliencka obsługująca interfejs użytkownika.

> **Uwaga:** Szczegółowe instrukcje konfiguracji (w tym zmienne środowiskowe i instalacja zależności) znajdują się w lokalnych plikach README wewnątrz powyższych katalogów.

## ⚙️ Wymagania wstępne (Prerequisites)

Aby uruchomić projekt lokalnie, upewnij się, że posiadasz zainstalowane:
* [.NET 8.0 SDK](https://dotnet.microsoft.com/) (lub nowszy)
* [Node.js](https://nodejs.org/) (wersja LTS)
* Serwer bazy danych SQL (np. SQL Server Express / Docker)

## 🚀 Szybki start (Lokalnie)

Aby uruchomić cały system, potrzebujesz dwóch okien terminala.

**1. Uruchomienie Backendu (.NET)**
```bash
cd src/Backend
dotnet run
```

**2. Uruchomienie Frontendu (NPM)**
```bash
cd src/Frontend
npm install
npm start
```