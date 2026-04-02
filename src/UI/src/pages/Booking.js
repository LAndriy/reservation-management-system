import React, { useState, useContext, useEffect } from 'react';
import { 
    Typography, 
    Box, 
    TextField, 
    MenuItem, 
    Button, 
    CircularProgress, 
    FormControl, 
    InputLabel, 
    Select, 
    Grid,
    Container,
    Card,
    CardContent,
    Stepper,
    Step,
    StepLabel
} from '@mui/material';
import EventNoteIcon from '@mui/icons-material/EventNote';
import PersonIcon from '@mui/icons-material/Person';
import SpaIcon from '@mui/icons-material/Spa';
import Calendar from '../components/Calendar';
import '../Style/Booking.css';
import { ReservationsContext } from '../context/ReservationContext';
import { bookingService } from '../services/bookingService';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Notification from '../components/Notification';

function Booking() {
    const { addReservation, error, clearError, loading } = useContext(ReservationsContext);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [selectedEmployee, setSelectedEmployee] = useState('');
    const [clientName, setClientName] = useState('');
    const [clientPhone, setClientPhone] = useState('');
    const [selectedService, setSelectedService] = useState('');
    const [employees, setEmployees] = useState([]);
    const [services, setServices] = useState([]);
    const [availableSlots, setAvailableSlots] = useState([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [workingHours, setWorkingHours] = useState(null);
    const [notes, setNotes] = useState('');
    const [localError, setLocalError] = useState(null);
    const [activeStep, setActiveStep] = useState(0);
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const steps = [
        { label: 'Wybierz pracownika', icon: <PersonIcon /> },
        { label: 'Wybierz usługę', icon: <SpaIcon /> },
        { label: 'Wybierz termin', icon: <EventNoteIcon /> }
    ];
    const [notification, setNotification] = useState({ 
        show: false, 
        message: '', 
        type: 'success' 
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const employeesData = await bookingService.getEmployees();
                setEmployees(Array.isArray(employeesData) ? employeesData : []);
            } catch (err) {
                console.error('Błąd podczas pobierania pracowników:', err);
                setEmployees([]);
            }

            try {
                const servicesData = await bookingService.getServices();
                setServices(Array.isArray(servicesData) ? servicesData : []);
            } catch (err) {
                console.error('Błąd podczas pobierania usług:', err);
                setServices([]);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login', { state: { from: '/booking' } });
        }
    }, [isAuthenticated, navigate]);

    useEffect(() => {
        const fetchAvailability = async () => {
            if (!selectedEmployee || !selectedService || !selectedDate) {
                return;
            }
            
            setLoadingSlots(true);
            try {
                const response = await bookingService.getAvailability(
                    selectedEmployee,
                    selectedDate,
                    selectedService
                );
                setAvailableSlots(response);
            } catch (err) {
                console.error('Błąd podczas pobierania dostępności:', err);
                setAvailableSlots([]);
            } finally {
                setLoadingSlots(false);
            }
        };

        fetchAvailability();
    }, [selectedEmployee, selectedService, selectedDate]);

    const validateForm = () => {
        if (!selectedSlot) return 'Wybierz termin';
        if (!selectedEmployee) return 'Wybierz pracownika';
        if (!selectedService) return 'Wybierz usługę';
        if (!clientName.trim()) return 'Podaj imię';
        if (!clientPhone.trim()) return 'Podaj numer telefonu';
        if (!/^\d{9}$/.test(clientPhone.replace(/\s/g, ''))) return 'Nieprawidłowy numer telefonu';
        return null;
    };

    const handleBooking = async () => {
        const validationError = validateForm();
        if (validationError) {
            setLocalError(validationError);
            setNotification({ 
                show: true, 
                message: validationError, 
                type: 'error' 
            });
            return;
        }
    
        try {
            await addReservation({
                startTime: selectedSlot.toISOString(),
                employeeId: parseInt(selectedEmployee),
                serviceId: parseInt(selectedService),
                notes: notes
            });
            
            setSelectedSlot(null);
            setSelectedService('');
            setNotes('');
            setLocalError(null);
            setActiveStep(0);
            
            setNotification({ 
                show: true, 
                message: 'Rezerwacja została utworzona pomyślnie!', 
                type: 'success' 
            });
        } catch (err) {
            console.error('Błąd podczas tworzenia rezerwacji:', err);
            const errorMessage = err.errors 
                ? Object.values(err.errors).flat().join(', ')
                : err.message || 'Wystąpił błąd podczas tworzenia rezerwacji';
                
            setNotification({ 
                show: true, 
                message: errorMessage, 
                type: 'error' 
            });
        }
    };

    const handleCloseNotification = () => {
        setNotification({ ...notification, show: false });
    };

    return (
        <Container maxWidth="lg" className="booking-container">
            <Card className="booking-card">
                <CardContent>
                    <Typography variant="h4" className="booking-title">
                        Rezerwacja wizyty
                    </Typography>
                    
                    <Stepper activeStep={activeStep} className="booking-stepper">
                        {steps.map((step, index) => (
                            <Step key={step.label}>
                                <StepLabel StepIconComponent={() => (
                                    <div className={`step-icon ${activeStep >= index ? 'active' : ''}`}>
                                        {step.icon}
                                    </div>
                                )}>
                                    {step.label}
                                </StepLabel>
                            </Step>
                        ))}
                    </Stepper>

                    <Box className="booking-form">
                        {activeStep === 0 && (
                            <FormControl className="form-field">
                                <InputLabel>Wybierz pracownika</InputLabel>
                                <Select
                                    value={selectedEmployee}
                                    onChange={async (e) => {
                                        const employeeId = e.target.value;
                                        setSelectedEmployee(employeeId);
                                        if (employeeId) {
                                            try {
                                                await bookingService.initializeWorkingHours(employeeId);
                                                const workingHours = await bookingService.getEmployeeWorkingHours(employeeId);
                                                setWorkingHours(workingHours);
                                                setActiveStep(1);
                                            } catch (err) {
                                                console.error('Error:', err);
                                            }
                                        }
                                    }}
                                    label="Wybierz pracownika"
                                >
                                    <MenuItem value="">
                                        <em>Wybierz pracownika</em>
                                    </MenuItem>
                                    {employees.map((employee) => (
                                        <MenuItem key={employee.id} value={employee.id}>
                                            {employee.firstName} {employee.lastName}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        )}

                        {activeStep === 1 && (
                            <FormControl className="form-field">
                                <InputLabel>Wybierz usługę</InputLabel>
                                <Select
                                    value={selectedService}
                                    onChange={(e) => {
                                        setSelectedService(e.target.value);
                                        if (e.target.value) {
                                            setActiveStep(2);
                                        }
                                    }}
                                    label="Wybierz usługę"
                                >
                                    <MenuItem value="">
                                        <em>Wybierz usługę</em>
                                    </MenuItem>
                                    {services.map((service) => (
                                        <MenuItem key={service.id} value={service.id}>
                                            {service.name} ({service.durationInMinutes} min) - {service.price.toFixed(2)} zł
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        )}

                        {activeStep === 2 && (
                            <Box className="calendar-container">
                                <Calendar
                                    onSlotSelect={setSelectedSlot}
                                    selectedSlot={selectedSlot}
                                    loading={loadingSlots}
                                    onDateChange={setSelectedDate}
                                    selectedDate={selectedDate}
                                    availableSlots={availableSlots}
                                    onTimeSelect={setSelectedSlot}
                                    workingHours={workingHours}
                                />
                            </Box>
                        )}

                        {selectedSlot && (
                            <Box className="booking-details">
                                <Grid container spacing={3}>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            className="form-field"
                                            fullWidth
                                            label="Imię i nazwisko"
                                            value={clientName}
                                            onChange={(e) => setClientName(e.target.value)}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            className="form-field"
                                            fullWidth
                                            label="Numer telefonu"
                                            value={clientPhone}
                                            onChange={(e) => setClientPhone(e.target.value)}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            className="form-field"
                                            fullWidth
                                            multiline
                                            rows={3}
                                            label="Dodatkowe uwagi"
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                            placeholder="Np. preferencje dotyczące stylizacji, alergii, itp."
                                        />
                                    </Grid>
                                </Grid>
                                
                                <Button
                                    variant="contained"
                                    onClick={handleBooking}
                                    disabled={loading}
                                    className="submit-button"
                                >
                                    {loading ? <CircularProgress size={24} /> : 'Zarezerwuj wizytę'}
                                </Button>
                            </Box>
                        )}
                    </Box>
                </CardContent>
            </Card>
            
            <Notification
                show={notification.show || !!error || !!localError}
                message={notification.message || error || localError}
                type={notification.type}
                onClose={() => {
                    handleCloseNotification();
                    clearError();
                    setLocalError(null);
                }}
            />
        </Container>
    );
}

export default Booking;