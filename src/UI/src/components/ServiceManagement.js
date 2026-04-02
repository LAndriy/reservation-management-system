import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    IconButton,
    Box,
    Typography,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    MenuItem
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import serviceService from '../services/serviceService';
import Notification from './Notification';

const ServiceManagement = ({ services, onServiceUpdate }) => {
    const { user } = useAuth();
    const [openDialog, setOpenDialog] = useState(false);
    const [editingService, setEditingService] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        durationInMinutes: '',
        category: 'Inne'
    });
    const [error, setError] = useState('');
    const [notification, setNotification] = useState({
        show: false,
        message: '',
        type: 'success'
    });

    const categories = ["Manicure", "Pedicure", "Usługi dodatkowe", "Inne"];

    const showNotification = (message, type = 'success') => {
        setNotification({
            show: true,
            message,
            type
        });
    };

    const handleCloseNotification = () => {
        setNotification(prev => ({ ...prev, show: false }));
    };

    const handleOpenDialog = (service = null) => {
        if (service) {
            setFormData({
                name: service.name,
                description: service.description || '',
                price: service.price.toString(),
                durationInMinutes: service.durationInMinutes.toString(),
                category: service.category || 'Inne'
            });
            setEditingService(service);
        } else {
            setFormData({
                name: '',
                description: '',
                price: '',
                durationInMinutes: '',
                category: 'Inne'
            });
            setEditingService(null);
        }
        setOpenDialog(true);
        setError('');
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingService(null);
        setFormData({
            name: '',
            description: '',
            price: '',
            durationInMinutes: '',
            category: 'Inne'
        });
        setError('');
    };

    const validateForm = () => {
        if (!formData.name || !formData.price || !formData.durationInMinutes || !formData.category) {
            setError('Wypełnij wszystkie wymagane pola');
            return false;
        }
        if (isNaN(formData.price) || parseFloat(formData.price) <= 0) {
            setError('Cena musi być liczbą większą od 0');
            return false;
        }
        if (isNaN(formData.durationInMinutes) || parseInt(formData.durationInMinutes) <= 0) {
            setError('Czas trwania musi być liczbą całkowitą większą od 0');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            const serviceData = {
                ...formData,
                price: parseFloat(formData.price),
                durationInMinutes: parseInt(formData.durationInMinutes)
            };

            if (editingService) {
                await serviceService.updateService(editingService.id, {
                    ...serviceData,
                    id: editingService.id
                });
                showNotification('Usługa została zaktualizowana pomyślnie', 'success');
            } else {
                await serviceService.createService(serviceData);
                showNotification('Nowa usługa została dodana pomyślnie', 'success');
            }
            
            onServiceUpdate();
            handleCloseDialog();
        } catch (error) {
            console.error('Error saving service:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Wystąpił błąd podczas zapisywania usługi';
            setError(errorMessage);
            showNotification(errorMessage, 'error');
        }
    };

    const handleDelete = async (serviceId) => {
        if (window.confirm('Czy na pewno chcesz usunąć tę usługę?')) {
            try {
                await serviceService.deleteService(serviceId);
                showNotification('Usługa została usunięta pomyślnie', 'success');
                onServiceUpdate();
            } catch (error) {
                const errorMessage = error.response?.data?.message || error.message || 'Wystąpił błąd podczas usuwania usługi';
                setError(errorMessage);
                showNotification(errorMessage, 'error');
            }
        }
    };

    if (!user || !user.roles?.includes('Admin') && !user.roles?.includes('Employee')) {
        console.log('User has no permissions:', user);
        return null;
    }

    return (
        <Box sx={{ mt: 4 }}>
            <Notification
                show={notification.show}
                message={notification.message}
                type={notification.type}
                onClose={handleCloseNotification}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Zarządzanie Usługami</Typography>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                >
                    Dodaj Usługę
                </Button>
            </Box>

            <List>
                {services.map((service) => (
                    <ListItem key={service.id} divider>
                        <ListItemText
                            primary={
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                    <Typography component="span" variant="subtitle1">
                                        {service.name}
                                    </Typography>
                                    <Typography component="span" variant="body1" color="text.primary">
                                        {service.price} zł
                                    </Typography>
                                </Box>
                            }
                            secondary={
                                <>
                                    {service.description && (
                                        <Typography component="span" variant="body2" color="text.secondary">
                                            {service.description}
                                        </Typography>
                                    )}
                                    <Typography component="span" variant="body2" color="text.secondary" sx={{ display: 'block' }}>
                                        Czas trwania: {service.durationInMinutes} min
                                    </Typography>
                                </>
                            }
                        />
                        <ListItemSecondaryAction>
                            <IconButton edge="end" aria-label="edit" onClick={() => handleOpenDialog(service)} sx={{ mr: 1 }}>
                                <EditIcon />
                            </IconButton>
                            <IconButton edge="end" aria-label="delete" style={{ color: '#c82333' }} onClick={() => handleDelete(service.id)}>
                                <DeleteIcon />
                            </IconButton>
                        </ListItemSecondaryAction>
                    </ListItem>
                ))}
            </List>

            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {editingService ? 'Edytuj Usługę' : 'Dodaj Nową Usługę'}
                </DialogTitle>
                <DialogContent>
                    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                        <TextField
                            fullWidth
                            label="Nazwa usługi"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            margin="normal"
                            required
                        />
                        <TextField
                            fullWidth
                            label="Opis"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            margin="normal"
                            multiline
                            rows={3}
                        />
                        <TextField
                            fullWidth
                            label="Cena (zł)"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            margin="normal"
                            required
                            type="number"
                            inputProps={{ min: "0", step: "0.01" }}
                        />
                        <TextField
                            fullWidth
                            label="Czas trwania (minuty)"
                            value={formData.durationInMinutes}
                            onChange={(e) => setFormData({ ...formData, durationInMinutes: e.target.value })}
                            margin="normal"
                            required
                            type="number"
                            inputProps={{ min: "1", step: "1" }}
                        />
                        <TextField
                            select
                            fullWidth
                            label="Kategoria"
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            margin="normal"
                            required
                        >
                            {categories.map((category) => (
                                <MenuItem key={category} value={category}>
                                    {category}
                                </MenuItem>
                            ))}
                        </TextField>
                        {error && (
                            <Typography color="error" variant="body2" sx={{ mt: 2 }}>
                                {error}
                            </Typography>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Anuluj</Button>
                    <Button onClick={handleSubmit} variant="contained" color="primary">
                        {editingService ? 'Zapisz zmiany' : 'Dodaj usługę'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ServiceManagement;
