import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { bookingService } from '../services/bookingService';
import {
    Container,
    Box,
    Typography,
    TextField,
    Button,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    List,
    ListItem,
    ListItemText,
    Divider,
    Paper,
    IconButton,
    InputAdornment
} from '@mui/material';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import '../Style/Account.css';
import { Visibility, VisibilityOff } from '@mui/icons-material';

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,}$/;
const PHONE_REGEX = /^(?:\+48)?(?:(?:[\s-]?\d{3}){3}|(?:\d{9}))$/;

function Account() {
    const navigate = useNavigate();
    const { user, logout, updateUserData, deleteAccount } = useAuth();
    const [formData, setFormData] = useState({
        id: user?.id || '',
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
        phoneNumber: user?.phoneNumber || '',
        role: user?.role || ''
    });
    const [appointments, setAppointments] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showPasswordDialog, setShowPasswordDialog] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });

    useEffect(() => {
        if (user) {
            setFormData({
                id: user.id,
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                email: user.email || '',
                phoneNumber: user.phoneNumber || '',
                role: user.role || ''
            });
        }
    }, [user]);

    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                console.log('Rozpoczynam pobieranie wizyt...');
                const data = await bookingService.getUserAppointments();
                console.log('Pobrane wizyty:', data);
                setAppointments(data);
            } catch (err) {
                console.error('Błąd podczas pobierania wizyt:', {
                    error: err,
                    message: err.message,
                    details: err.errors
                });
                setError('Nie udało się pobrać historii wizyt');
            }
        };

        fetchAppointments();
    }, []);

    const validateForm = () => {
        if (!formData.firstName || !formData.lastName || !formData.email || !formData.phoneNumber) {
            setError('Wypełnij wszystkie wymagane pola');
            return false;
        }

        if (!PHONE_REGEX.test(formData.phoneNumber)) {
            setError('Nieprawidłowy format numeru telefonu. Użyj formatu: 123456789 lub +48 123 456 789');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');
        
        if (!validateForm()) {
            setLoading(false);
            return;
        }

        try {
            const updatedUser = await authService.updateUser({
                ...formData,
                id: user.id
            });

            // Aktualizujemy dane w kontekście bez wylogowywania
            updateUserData({
                ...user,
                ...updatedUser
            });

            setSuccess('Dane zostały pomyślnie zaktualizowane');
        } catch (err) {
            setError(err.message || 'Wystąpił błąd podczas aktualizacji danych');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        
        if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
            setError('Wypełnij wszystkie pola formularza');
            return;
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setError('Nowe hasła nie są identyczne');
            return;
        }

        if (!PASSWORD_REGEX.test(passwordData.newPassword)) {
            setError('Hasło musi zawierać minimum 8 znaków, w tym jedną wielką literę, jedną małą literę, jedną cyfrę i jeden znak specjalny');
            return;
        }

        setLoading(true);
        try {
            await authService.changePassword(user.id, {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            setSuccess('Hasło zostało pomyślnie zmienione');
            setShowPasswordDialog(false);
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePasswordDataChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const togglePasswordVisibility = (field) => {
        setShowPasswords(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    const handleDeleteAccount = async () => {
        if (window.confirm('Czy na pewno chcesz usunąć swoje konto? Ta operacja jest nieodwracalna i nie będzie można jej cofnąć.')) {
            setLoading(true);
            setError('');
            try {
                await deleteAccount();
                navigate('/');
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
    };

    if (!user) {
        return (
            <Container>
                <Typography>Zaloguj się, aby zobaczyć swoje konto</Typography>
            </Container>
        );
    }

    return (
        <Container maxWidth="md">
            <Box sx={{ mt: 4, mb: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Moje konto
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {success && (
                    <Alert severity="success" sx={{ mb: 2 }}>
                        {success}
                    </Alert>
                )}

                <Paper sx={{ p: 3, mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Dane osobowe
                    </Typography>
                    <form onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            label="Imię"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            margin="normal"
                        />
                        <TextField
                            fullWidth
                            label="Nazwisko"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            margin="normal"
                        />
                        <TextField
                            fullWidth
                            label="Email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            margin="normal"
                            type="email"
                        />
                        <TextField
                            fullWidth
                            label="Telefon"
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleChange}
                            margin="normal"
                        />
                        <Box sx={{ mt: 2 }}>
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                disabled={loading}
                            >
                                {loading ? 'Aktualizacja...' : 'Zapisz zmiany'}
                            </Button>
                        </Box>
                    </form>
                </Paper>

                <Paper sx={{ p: 3, mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Bezpieczeństwo
                    </Typography>
                    <Button
                        variant="outlined"
                        color="primary"
                        onClick={() => setShowPasswordDialog(true)}
                        sx={{ mb: 2 }}
                    >
                        Zmień hasło
                    </Button>
                </Paper>

                <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Usuwanie konta
                    </Typography>
                    <Typography paragraph>
                        Uwaga: Usunięcie konta jest nieodwracalne. Wszystkie Twoje dane zostaną permanentnie usunięte.
                    </Typography>
                    <Button
                        variant="outlined"
                        color="error"
                        onClick={() => setShowDeleteDialog(true)}
                    >
                        Usuń konto
                    </Button>
                </Paper>
            </Box>

            {/* Dialog zmiany hasła */}
            <Dialog open={showPasswordDialog} onClose={() => setShowPasswordDialog(false)}>
                <DialogTitle>Zmień hasło</DialogTitle>
                <form onSubmit={handlePasswordChange}>
                    <DialogContent>
                        <TextField
                            fullWidth
                            margin="normal"
                            label="Obecne hasło"
                            name="currentPassword"
                            type={showPasswords.current ? 'text' : 'password'}
                            value={passwordData.currentPassword}
                            onChange={handlePasswordDataChange}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={() => togglePasswordVisibility('current')}
                                            edge="end"
                                        >
                                            {showPasswords.current ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <TextField
                            fullWidth
                            margin="normal"
                            label="Nowe hasło"
                            name="newPassword"
                            type={showPasswords.new ? 'text' : 'password'}
                            value={passwordData.newPassword}
                            onChange={handlePasswordDataChange}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={() => togglePasswordVisibility('new')}
                                            edge="end"
                                        >
                                            {showPasswords.new ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <TextField
                            fullWidth
                            margin="normal"
                            label="Potwierdź nowe hasło"
                            name="confirmPassword"
                            type={showPasswords.confirm ? 'text' : 'password'}
                            value={passwordData.confirmPassword}
                            onChange={handlePasswordDataChange}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={() => togglePasswordVisibility('confirm')}
                                            edge="end"
                                        >
                                            {showPasswords.confirm ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setShowPasswordDialog(false)}>
                            Anuluj
                        </Button>
                        <Button type="submit" variant="contained" color="primary" disabled={loading}>
                            {loading ? 'Zmiana hasła...' : 'Zmień hasło'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>

            {/* Dialog usuwania konta */}
            <Dialog open={showDeleteDialog} onClose={() => setShowDeleteDialog(false)}>
                <DialogTitle>Potwierdź usunięcie konta</DialogTitle>
                <DialogContent>
                    <Typography>
                        Czy na pewno chcesz usunąć swoje konto? Ta operacja jest nieodwracalna i nie będzie można jej cofnąć.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowDeleteDialog(false)}>
                        Anuluj
                    </Button>
                    <Button onClick={handleDeleteAccount} color="error" variant="contained">
                        Usuń konto
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}

export default Account;
