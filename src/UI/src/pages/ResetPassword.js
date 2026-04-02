import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/authService';
import {
    Container,
    Box,
    Typography,
    TextField,
    Button,
    Alert,
    IconButton,
    InputAdornment,
    Paper
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;

function ResetPassword() {
    const navigate = useNavigate();
    const location = useLocation();
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const token = new URLSearchParams(location.search).get('token');

    const handleRequestReset = async (e) => {
        e.preventDefault();
        if (!email) {
            setError('Wprowadź adres email');
            return;
        }

        setLoading(true);
        try {
            await authService.requestPasswordReset(email);
            setSuccess('Link do resetowania hasła został wysłany na Twój adres email');
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || 'Wystąpił błąd podczas wysyłania linku resetującego');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        
        if (!password || !confirmPassword) {
            setError('Wypełnij wszystkie pola');
            return;
        }

        if (password !== confirmPassword) {
            setError('Hasła nie są identyczne');
            return;
        }

        if (!PASSWORD_REGEX.test(password)) {
            setError('Hasło musi zawierać minimum 8 znaków, jedną wielką literę, jedną małą literę i jedną cyfrę');
            return;
        }

        setLoading(true);
        try {
            await authService.resetPassword(token, password);
            setSuccess('Hasło zostało zmienione. Możesz się teraz zalogować.');
            setError('');
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Wystąpił błąd podczas resetowania hasła');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="sm">
            <Box sx={{ mt: 8, mb: 4 }}>
                <Typography variant="h4" align="center" gutterBottom>
                    Resetowanie hasła
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
                        {error}
                    </Alert>
                )}

                {success && (
                    <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
                        {success}
                    </Alert>
                )}

                <Paper sx={{ p: 3 }}>
                    {!token ? (
                        <form onSubmit={handleRequestReset}>
                            <Typography paragraph>
                                Wprowadź swój adres email. Wyślemy Ci link do zresetowania hasła.
                            </Typography>
                            
                            <TextField
                                fullWidth
                                type="email"
                                label="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                margin="normal"
                                required
                            />

                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                sx={{ mt: 3 }}
                                disabled={loading}
                            >
                                {loading ? 'Wysyłanie...' : 'Wyślij link resetujący'}
                            </Button>
                        </form>
                    ) : (
                        <form onSubmit={handleResetPassword}>
                            <Typography paragraph>
                                Wprowadź nowe hasło.
                            </Typography>

                            <TextField
                                fullWidth
                                type={showPassword ? 'text' : 'password'}
                                label="Nowe hasło"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                margin="normal"
                                required
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => setShowPassword(!showPassword)}
                                                edge="end"
                                            >
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            <TextField
                                fullWidth
                                type={showPassword ? 'text' : 'password'}
                                label="Potwierdź nowe hasło"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                margin="normal"
                                required
                            />

                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                sx={{ mt: 3 }}
                                disabled={loading}
                            >
                                {loading ? 'Resetowanie...' : 'Zresetuj hasło'}
                            </Button>
                        </form>
                    )}
                </Paper>
            </Box>
        </Container>
    );
}

export default ResetPassword;
