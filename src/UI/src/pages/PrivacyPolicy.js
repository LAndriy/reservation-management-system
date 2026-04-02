import React from 'react';
import { Container, Typography, Box } from '@mui/material';

const PrivacyPolicy = () => {
  return (
    <Container maxWidth="md">
      <Box py={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Polityka Prywatności
        </Typography>

        <Typography variant="h6" gutterBottom>
          1. Informacje ogólne
        </Typography>
        <Typography paragraph>
          Niniejsza polityka prywatności określa zasady przetwarzania i ochrony danych osobowych przekazanych przez Użytkowników w związku z korzystaniem z serwisu All About Nail.
        </Typography>

        <Typography variant="h6" gutterBottom>
          2. Administrator danych
        </Typography>
        <Typography paragraph>
          Administratorem danych osobowych jest All About Nail z siedzibą przy ul. Przykładowa 123, 35-000 Rzeszów.
        </Typography>

        <Typography variant="h6" gutterBottom>
          3. Cel i zakres zbierania danych
        </Typography>
        <Typography paragraph>
          Przetwarzamy dane osobowe w następujących celach:
        </Typography>
        <Typography component="ul">
          <li>Realizacja usługi rezerwacji wizyt</li>
          <li>Prowadzenie konta użytkownika</li>
          <li>Wysyłanie powiadomień o statusie rezerwacji</li>
          <li>Kontakt w sprawie świadczonych usług</li>
        </Typography>

        <Typography variant="h6" gutterBottom>
          4. Rodzaj przetwarzanych danych
        </Typography>
        <Typography paragraph>
          Przetwarzamy następujące dane osobowe:
        </Typography>
        <Typography component="ul">
          <li>Imię i nazwisko</li>
          <li>Adres e-mail</li>
          <li>Numer telefonu</li>
          <li>Historia rezerwacji</li>
        </Typography>

        <Typography variant="h6" gutterBottom>
          5. Prawa użytkownika
        </Typography>
        <Typography paragraph>
          Użytkownik ma prawo do:
        </Typography>
        <Typography component="ul">
          <li>Dostępu do swoich danych</li>
          <li>Sprostowania danych</li>
          <li>Usunięcia danych ("prawo do bycia zapomnianym")</li>
          <li>Ograniczenia przetwarzania</li>
          <li>Przenoszenia danych</li>
          <li>Wniesienia sprzeciwu</li>
          <li>Wycofania zgody na przetwarzanie danych</li>
        </Typography>

        <Typography variant="h6" gutterBottom>
          6. Okres przechowywania danych
        </Typography>
        <Typography paragraph>
          Dane osobowe będą przechowywane przez okres niezbędny do realizacji celów, w których są przetwarzane, lub do czasu wycofania zgody.
        </Typography>

        <Typography variant="h6" gutterBottom>
          7. Przechowywanie danych w przeglądarce
        </Typography>
        <Typography paragraph>
          Nasza aplikacja wykorzystuje następujące mechanizmy przechowywania danych w przeglądarce:
        </Typography>
        
        <Typography variant="subtitle1" gutterBottom>
          7.1. Local Storage
        </Typography>
        <Typography paragraph>
          Wykorzystujemy mechanizm Local Storage przeglądarki do przechowywania:
        </Typography>
        <Typography component="ul">
          <li>Tokenu uwierzytelniającego (JWT) - używanego do autoryzacji użytkownika</li>
          <li>Podstawowych informacji o zalogowanym użytkowniku</li>
          <li>Tokenu odświeżającego - używanego do automatycznego odnawiania sesji</li>
        </Typography>
        <Typography paragraph>
          Dane w Local Storage są przechowywane do momentu wylogowania się lub ręcznego wyczyszczenia danych przeglądarki.
        </Typography>

        <Typography variant="subtitle1" gutterBottom>
          7.2. Cookies systemowe
        </Typography>
        <Typography paragraph>
          Aplikacja wykorzystuje niezbędne pliki cookies:
        </Typography>
        <Typography component="ul">
          <li>Cookies sesyjne - używane przez React Router do zarządzania nawigacją w aplikacji</li>
          <li>Cookies CSRF - wymagane przez ASP.NET Core do ochrony przed atakami Cross-Site Request Forgery</li>
        </Typography>
        <Typography paragraph>
          Te pliki cookies są niezbędne do prawidłowego działania aplikacji i są automatycznie usuwane po zamknięciu przeglądarki.
        </Typography>

        <Typography paragraph>
          Użytkownik może w każdej chwili zmienić ustawienia dotyczące plików cookies w swojej przeglądarce, w tym całkowicie wyłączyć ich obsługę. Należy jednak pamiętać, że wyłączenie niezbędnych plików cookies może spowodować nieprawidłowe działanie niektórych funkcji serwisu.
        </Typography>

        <Typography variant="h6" gutterBottom>
          8. Zabezpieczenie danych
        </Typography>
        <Typography paragraph>
          Stosujemy odpowiednie środki techniczne i organizacyjne zapewniające bezpieczeństwo przetwarzanych danych osobowych.
        </Typography>

        <Typography variant="h6" gutterBottom>
          9. Kontakt
        </Typography>
        <Typography paragraph>
          W sprawach związanych z ochroną danych osobowych można kontaktować się z nami pod adresem email: kontakt@allaboutnail.pl.
        </Typography>

        <Typography variant="body2" color="textSecondary" align="right">
          Ostatnia aktualizacja: {new Date().toLocaleDateString()}
        </Typography>
      </Box>
    </Container>
  );
};

export default PrivacyPolicy;
