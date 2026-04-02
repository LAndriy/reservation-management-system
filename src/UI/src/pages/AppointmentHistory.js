import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import {
    Container,
    Typography,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    Button,
    Box,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    Tooltip,
    CircularProgress
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { ArrowUpward, ArrowDownward } from '@mui/icons-material/';
import { useAuth } from '../context/AuthContext';
import appointmentService from '../services/appointmentService';
import Notification from '../components/Notification';
import '../Style/AppointmentHistory.css';

const AppointmentStatus = {
    SCHEDULED: 0,
    COMPLETED: 1,
    CANCELLED: 2,
    NO_SHOW: 3
};

function AppointmentHistory() {
    const [appointments, setAppointments] = useState([]);
    const [sortedAppointments, setSortedAppointments] = useState([]);
    const [sortOrder, setSortOrder] = useState('desc');
    const [loading, setLoading] = useState(true);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
    const { user } = useAuth();

    useEffect(() => {
        fetchAppointments();
    }, []);

    useEffect(() => {
        setSortedAppointments(sortAppointments(appointments, sortOrder));
    }, [appointments, sortOrder]);

    const fetchAppointments = async () => {
        try {
            setLoading(true);
            const data = user.roles.includes('Employee') 
                ? await appointmentService.getEmployeeAppointments(user.id)
                : await appointmentService.getClientAppointments();
            setAppointments(data);
        } catch (error) {
            showNotification('Nie udało się pobrać historii wizyt', 'error');
        } finally {
            setLoading(false);
        }
    };

    const sortAppointments = (appointments, order) => {
        return [...appointments].sort((a, b) => {
            const dateA = new Date(a.startTime);
            const dateB = new Date(b.startTime);
            return order === 'asc' ? dateA - dateB : dateB - dateA;
        });
    };

    const showNotification = (message, type = 'success') => {
        setNotification({ show: true, message, type });
    };

    const handleCloseNotification = () => {
        setNotification({ ...notification, show: false });
    };

    const isAppointmentPast = (appointment) => {
        return new Date(appointment.startTime) < new Date();
    };

    const canCancelAppointment = (appointment) => {
        if (appointment.status !== AppointmentStatus.SCHEDULED) return false;
        if (isAppointmentPast(appointment)) return false;

        if (user.roles.includes('Admin') || user.roles.includes('Employee')) return true;

        const appointmentDate = new Date(appointment.startTime);
        const now = new Date();
        const hoursUntilAppointment = (appointmentDate - now) / (1000 * 60 * 60);
        return hoursUntilAppointment >= 24;
    };

    const handleCancelClick = (appointment) => {
        setSelectedAppointment(appointment);
        setShowCancelDialog(true);
    };

    const handleCancelConfirm = async () => {
        if (!selectedAppointment) return;

        try {
            setLoading(true);
            await appointmentService.cancelAppointment(selectedAppointment.id);
            showNotification('Wizyta została anulowana');
            await fetchAppointments();
        } catch (error) {
            showNotification('Nie udało się anulować wizyty', 'error');
        } finally {
            setLoading(false);
            setShowCancelDialog(false);
            setSelectedAppointment(null);
        }
    };

    const getStatusText = (status) => {
        const statusMap = {
            [AppointmentStatus.SCHEDULED]: 'Zaplanowana',
            [AppointmentStatus.COMPLETED]: 'Zakończona',
            [AppointmentStatus.CANCELLED]: 'Anulowana',
            [AppointmentStatus.NO_SHOW]: 'Nie przyszedł/a'
        };
        return statusMap[status] || 'Nieznany';
    };

    const getStatusClass = (status) => {
        const statusMap = {
            [AppointmentStatus.SCHEDULED]: 'status-scheduled',
            [AppointmentStatus.COMPLETED]: 'status-completed',
            [AppointmentStatus.CANCELLED]: 'status-cancelled',
            [AppointmentStatus.NO_SHOW]: 'status-noshow'
        };
        return statusMap[status] || '';
    };

    return (
        <Container maxWidth="md" className="appointment-container">
            <Notification
                show={notification.show}
                message={notification.message}
                type={notification.type}
                onClose={handleCloseNotification}
            />
            
            <Typography className="appointment-title" variant="h4" component="h1">
                Historia wizyt
            </Typography>

            {loading ? (
                <Box className="loading-container">
                    <CircularProgress />
                </Box>
            ) : sortedAppointments.length === 0 ? (
                <Typography className="no-appointments">
                    Brak wizyt w historii
                </Typography>
            ) : (
                <>
                    <Box className="sort-controls">
                        <Button
                            variant="outlined"
                            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                            startIcon={sortOrder === 'desc' ? <ArrowDownward /> : <ArrowUpward />}
                            className="sort-button"
                        >
                            {sortOrder === 'desc' ? 'Od najnowszych' : 'Od najstarszych'}
                        </Button>
                    </Box>

                    <List className="appointment-list">
    {sortedAppointments.map((appointment) => (
        <ListItem 
            key={appointment.id}
            className={`appointment-item ${isAppointmentPast(appointment) ? 'past-appointment' : ''}`}
        >
            <ListItemText
                primary={
                    <Typography 
                        component="span" 
                        className="appointment-date"
                    >
                        {format(new Date(appointment.startTime), 'PPP', { locale: pl })} 
                        {' o '} 
                        {format(new Date(appointment.startTime), 'HH:mm')}
                    </Typography>
                }
                secondary={
                    <Box component="span" className="appointment-details">
                        <Typography component="span" display="block">
                            {user.roles.includes('Employee')
                                ? `Klient: ${appointment.client.firstName} ${appointment.client.lastName}`
                                : `Pracownik: ${appointment.employee.firstName} ${appointment.employee.lastName}`}
                        </Typography>
                        <Typography component="span" display="block">
                            Usługa: {appointment.service.name}
                        </Typography>
                        <Typography 
                            component="span" 
                            display="block"
                            className={`appointment-status ${getStatusClass(appointment.status)}`}
                        >
                            Status: {getStatusText(appointment.status)}
                        </Typography>
                    </Box>
                }
            />
            {canCancelAppointment(appointment) && (
                <ListItemSecondaryAction>
                    <Tooltip title="Anuluj wizytę">
                        <IconButton
                            className="cancel-button"
                            onClick={() => handleCancelClick(appointment)}
                        >
                            <DeleteIcon />
                        </IconButton>
                    </Tooltip>
                </ListItemSecondaryAction>
            )}
        </ListItem>
    ))}
</List>
                </>
            )}

            <Dialog
                open={showCancelDialog}
                onClose={() => setShowCancelDialog(false)}
                className="cancel-dialog"
            >
                <DialogTitle className="dialog-title">
                    Potwierdź anulowanie
                </DialogTitle>
                <DialogContent className="dialog-content">
                    <Typography>
                        Czy na pewno chcesz anulować tę wizytę?
                    </Typography>
                    {selectedAppointment && (
                        <Box className="dialog-appointment-details">
                            <Typography>
                                Data: {format(new Date(selectedAppointment.startTime), 'PPP', { locale: pl })}
                                {' o '}
                                {format(new Date(selectedAppointment.startTime), 'HH:mm')}
                            </Typography>
                            <Typography>
                                Usługa: {selectedAppointment.service.name}
                            </Typography>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions className="dialog-actions">
                    <Button 
                        onClick={() => setShowCancelDialog(false)}
                        className="cancel-action-button"
                    >
                        Anuluj
                    </Button>
                    <Button 
                        onClick={handleCancelConfirm}
                        className="confirm-button"
                        disabled={loading}
                    >
                        {loading ? 'Anulowanie...' : 'Potwierdź'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}

export default AppointmentHistory;