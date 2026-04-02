import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { GoogleLogin } from '@react-oauth/google';
import { GOOGLE_CLIENT_ID } from '../config/google.config';
import {
    Box,
    TextField,
    Button,
    Typography,
    Alert,
    Container,
    Divider,
    IconButton,
    InputAdornment,
    FormControlLabel,
    Checkbox,
    FormHelperText
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import '../Style/Auth.css';

// Hasło musi zawierać:
// - minimum 8 znaków
// - przynajmniej jedną wielką literę
// - przynajmniej jedną małą literę
// - przynajmniej jedną cyfrę
// - przynajmniej jeden znak specjalny
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/;

function Register() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        phoneNumber: '',
        firstName: '',
        lastName: ''
    });
    const [showPasswords, setShowPasswords] = useState({
        password: false,
        confirm: false
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [privacyConsent, setPrivacyConsent] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.email || !formData.password || !formData.confirmPassword || !formData.firstName || !formData.lastName) {
            setError('Wypełnij wszystkie wymagane pola');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Hasła nie są identyczne');
            return;
        }

        if (!PASSWORD_REGEX.test(formData.password)) {
            setError('Hasło musi zawierać minimum 8 znaków, jedną wielką literę, jedną małą literę, jedną cyfrę i jeden znak specjalny');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError('Podaj prawidłowy adres email');
            return;
        }

        if (formData.phoneNumber && !/^\d{9}$/.test(formData.phoneNumber)) {
            setError('Numer telefonu powinien składać się z 9 cyfr');
            return;
        }

        if (!privacyConsent) {
            setError('Wymagana jest zgoda na przetwarzanie danych osobowych');
            return;
        }

        setLoading(true);
        try {
            const response = await authService.register({
                email: formData.email,
                password: formData.password,
                firstName: formData.firstName,
                lastName: formData.lastName,
                phoneNumber: formData.phoneNumber || null,
                privacyConsent: privacyConsent
            });
            
            // Po udanej rejestracji, zaloguj się
            const loginResponse = await authService.login({
                email: formData.email,
                password: formData.password
            });
            await login(loginResponse.user, loginResponse.token);
            navigate('/');
        } catch (err) {
            setError(err.message || 'Wystąpił błąd podczas rejestracji');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            const response = await authService.googleLogin(credentialResponse.credential);
            await login(response.user, response.token);
            navigate('/');
        } catch (err) {
            setError(err.message || 'Wystąpił błąd podczas logowania przez Google');
        }
    };

    const handleGoogleError = () => {
        setError('Wystąpił błąd podczas logowania przez Google');
    };

    return (
        <Container maxWidth="sm">
            <Box sx={{ mt: 8, mb: 4 }}>
                <Typography variant="h4" align="center" gutterBottom>
                    Rejestracja
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
                        {error}
                    </Alert>
                )}

                <form onSubmit={handleSubmit}>
                    <TextField
                        fullWidth
                        type="email"
                        label="Email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        margin="normal"
                        required
                    />

                    <TextField
                        fullWidth
                        label="Imię"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        margin="normal"
                        required
                    />

                    <TextField
                        fullWidth
                        label="Nazwisko"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        margin="normal"
                        required
                    />

                    <TextField
                        fullWidth
                        type={showPasswords.password ? 'text' : 'password'}
                        label="Hasło"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        margin="normal"
                        required
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={() => setShowPasswords({ ...showPasswords, password: !showPasswords.password })}
                                        edge="end"
                                    >
                                        {showPasswords.password ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />

                    <TextField
                        fullWidth
                        type={showPasswords.confirm ? 'text' : 'password'}
                        label="Potwierdź hasło"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        margin="normal"
                        required
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                                        edge="end"
                                    >
                                        {showPasswords.confirm ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />

                    <TextField
                        fullWidth
                        label="Numer telefonu"
                        value={formData.phoneNumber}
                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                        margin="normal"
                        placeholder="123456789"
                    />

                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={privacyConsent}
                                onChange={(e) => setPrivacyConsent(e.target.checked)}
                                color="primary"
                            />
                        }
                        label={
                            <Typography variant="body2">
                                Wyrażam zgodę na przetwarzanie moich danych osobowych zgodnie z{' '}
                                <Link to="/privacy-policy" target="_blank">
                                    polityką prywatności
                                </Link>
                            </Typography>
                        }
                    />
                    {error === 'Wymagana jest zgoda na przetwarzanie danych osobowych' && (
                        <FormHelperText error>{error}</FormHelperText>
                    )}

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                        disabled={loading}
                    >
                        {loading ? 'Rejestracja...' : 'Zarejestruj się'}
                    </Button>
                </form>

                <Divider sx={{ my: 2 }}>lub</Divider>

                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                    <GoogleLogin
                        clientId={GOOGLE_CLIENT_ID}
                        onSuccess={handleGoogleSuccess}
                        onError={handleGoogleError}
                        useOneTap={false}
                        text="continue_with"
                        locale="pl"
                        shape="rectangular"
                        width="300"
                    />
                </Box>

                <Typography align="center" color="textSecondary">
                    Masz już konto? <Link className='link' to="/login">Zaloguj się</Link>
                </Typography>
            </Box>
        </Container>
    );
}

export default Register;
