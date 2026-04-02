import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    FormControl,
    Select,
    MenuItem,
    Button,
    Alert,
    InputLabel
} from '@mui/material';
import { authService } from '../services/authService';
import '../Style/AdminPanel.css';

const AdminPanel = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRoles, setSelectedRoles] = useState({});
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await authService.getUsers();
                setUsers(response);
                const initialRoles = {};
                response.forEach(user => {
                    initialRoles[user.email] = '';
                });
                setSelectedRoles(initialRoles);
            } catch (error) {
                setError('Nie udało się pobrać listy użytkowników');
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    const handleRoleChange = async (userEmail) => {
        try {
            await authService.assignRole({ email: userEmail, role: selectedRoles[userEmail] });
            setSuccessMessage('Rola została zaktualizowana pomyślnie');
            const response = await authService.getUsers();
            setUsers(response);
        } catch (error) {
            setError('Nie udało się zaktualizować roli użytkownika');
        }
    };

    const handleRoleSelect = (email, role) => {
        setSelectedRoles(prev => ({
            ...prev,
            [email]: role
        }));
    };

    if (loading) return <Typography>Ładowanie...</Typography>;

    return (
        <Container className="admin-panel-container" maxWidth="lg" sx={{ mt: 2, mb: 2 }}>
            <Typography variant="h5" className="admin-panel-title" gutterBottom>
                Panel Administracyjny
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
                    {error}
                </Alert>
            )}

            {successMessage && (
                <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage('')}>
                    {successMessage}
                </Alert>
            )}

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell className="table-cell">Imię i Nazwisko</TableCell>
                            <TableCell className="table-cell">Email</TableCell>
                            <TableCell className="table-cell">Obecne role</TableCell>
                            <TableCell className="table-cell">Nowa rola</TableCell>
                            <TableCell className="table-cell">Akcja</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.email}>
                                <TableCell className="table-cell">{`${user.firstName} ${user.lastName}`}</TableCell>
                                <TableCell className="table-cell">{user.email}</TableCell>
                                <TableCell className="table-cell">{user.roles.join(', ')}</TableCell>
                                <TableCell className="table-cell">
                                    <FormControl fullWidth>
                                        <InputLabel>Rola</InputLabel>
                                        <Select
                                            value={selectedRoles[user.email]}
                                            onChange={(e) => handleRoleSelect(user.email, e.target.value)}
                                        >
                                            <MenuItem value=""  style={{ padding: '4px 16px' }}>
                                                <em>Wybierz rolę</em>
                                            </MenuItem>
                                            <MenuItem value="Admin">Administrator</MenuItem>
                                            <MenuItem value="Employee">Pracownik</MenuItem>
                                            <MenuItem value="User">Użytkownik</MenuItem>
                                        </Select>
                                    </FormControl>
                                </TableCell>
                                <TableCell className="table-cell">
                                    <Button 
                                        className="assign-role-button" 
                                        onClick={() => handleRoleChange(user.email)}
                                        disabled={!selectedRoles[user.email]}
                                    >
                                        Przypisz rolę
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Container>
    );
};

export default AdminPanel;