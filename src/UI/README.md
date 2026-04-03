# AllAboutNail - Frontend (UI)

Aplikacja kliencka dla systemu zarządzania salonem kosmetycznym. Interfejs został zbudowany w bibliotece React i zapewnia obsługę panelu klienta (rezerwacja wizyt) oraz operacji pracowniczych. Aplikacja komunikuje się z backendem w środowisku .NET poprzez REST API.

## 🛠️ Technologie i Narzędzia

Interfejs użytkownika wykorzystuje następujący stos technologiczny:
* **Silnik:** React 18 (zainicjalizowany przez Create React App)
* **Styling i Komponenty:** [Material UI]
* **Komunikacja z API:** [Axios]
* **Zarządzanie stanem:** [React Context API]
* **Routing:** [React Router Dom]

## 🎯 Główne Funkcjonalności Interfejsu

Aplikacja realizuje kluczowe procesy biznesowe po stronie przeglądarki:
1. **Moduł Autoryzacji:** Formularze logowania i rejestracji z bezpieczną obsługą tokenów JWT przechowywanych po stronie klienta.
2. **Kreator Rezerwacji:** Interaktywny kalendarz pozwalający użytkownikom na wybór usługi, pracownika oraz wolnego slotu czasowego.
3. **Panel Użytkownika:** Widok historii wizyt oraz możliwość anulowania nadchodzących rezerwacji.
4. **Zarządzanie (Dla ról pracowniczych):** [.....].

## ⚙️ Konfiguracja Środowiska

### Wymagania
* [Node.js](https://nodejs.org/) w wersji LTS (v18+)
* Menedżer pakietów NPM

### Zmienne środowiskowe
Aplikacja wymaga skonfigurowania adresu URL do backendu API. 
W głównym katalogu `Frontend` utwórz plik `.env.local` na podstawie poniższego schematu:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

## 🚀 Uruchomienie lokalne

1. Zainstaluj wymagane zależności projektowe:
   ```bash
   npm install
   ```

2. Uruchom serwer deweloperski:
   ```bash
   npm start
   ```

Aplikacja uruchomi się domyślnie pod adresem [http://localhost:3000](http://localhost:3000). Serwer wspiera Hot Module Replacement (HMR) – zmiany w kodzie będą natychmiast widoczne w przeglądarce.

## 📦 Budowanie na produkcję

Aby wygenerować zoptymalizowaną, zminifikowaną wersję aplikacji gotową do wdrożenia (np. na serwerze statycznym lub w usługach chmurowych):

```bash
npm run build
```
Gotowe pliki znajdą się w nowym folderze `build/`.