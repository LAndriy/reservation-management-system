import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Modal, Badge } from 'react-bootstrap';
import Calendar from '../components/Calendar';
import WorkingHoursForm from '../components/employee/WorkingHoursForm';
import TimeOffForm from '../components/employee/TimeOffForm';
import { useAuth } from '../context/AuthContext';
import appointmentService, { AppointmentStatus } from '../services/appointmentService';
import timeOffService from '../services/timeOffService';
import '../Style/EmployeeDashboard.css';
import Notification from '../components/Notification';

const EmployeeDashboard = () => {
    const [showWorkingHoursModal, setShowWorkingHoursModal] = useState(false);
    const [showTimeOffModal, setShowTimeOffModal] = useState(false);
    const [appointments, setAppointments] = useState([]);
    const [timeOffs, setTimeOffs] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [availableSlots, setAvailableSlots] = useState([]);
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        id: user?.id || '',
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
        phoneNumber: user?.phoneNumber || '',
        role: user?.role || ''
    });

    // Mapowanie statusów na tekst
    const getStatusText = (status) => {
        const statusMap = {
            0: 'Zaplanowana',
            1: 'Zakończona', 
            2: 'Anulowana',
            3: 'Nie przyszedł/a',
            [AppointmentStatus.SCHEDULED]: 'Zaplanowana',
            [AppointmentStatus.COMPLETED]: 'Zakończona',
            [AppointmentStatus.CANCELLED]: 'Anulowana',
            [AppointmentStatus.NO_SHOW]: 'Nie przyszedł/a'
        };
        return statusMap[status] || status;
    };

    // Mapowanie statusów na kolor
    const getStatusVariant = (status) => {
        const variantMap = {
            0: 'primary',
            1: 'success',
            2: 'danger',
            3: 'warning',
            [AppointmentStatus.SCHEDULED]: 'primary',
            [AppointmentStatus.COMPLETED]: 'success',
            [AppointmentStatus.CANCELLED]: 'danger',
            [AppointmentStatus.NO_SHOW]: 'warning'
        };
        return variantMap[status] || 'secondary';
    };

    useEffect(() => {
        loadAppointments();
        loadTimeOffs();
    }, []);

    useEffect(() => {
        loadAvailableSlots();
    }, [selectedDate]);

    const loadAppointments = async () => {
        try {
            const data = await appointmentService.getEmployeeAppointments(user.id);
            setAppointments(data);
        } catch (error) {
            console.error('Error loading appointments:', error);
        }
    };

    const loadTimeOffs = async () => {
        try {
            const data = await timeOffService.getEmployeeTimeOffs(user.id);
            setTimeOffs(data);
        } catch (error) {
            console.error('Error loading time offs:', error);
        }
    };

    const loadAvailableSlots = async () => {
        setLoading(true);
        try {
            // TODO: Dodać wybór usługi w interfejsie
            const serviceId = 1; // Tymczasowo używamy ID pierwszej usługi
            const slots = await appointmentService.getAvailableSlots(user.id, selectedDate, serviceId);
            setAvailableSlots(slots);
        } catch (error) {
            console.error('Error loading available slots:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAppointmentStatusChange = async (appointmentId, status) => {
        try {
            if (status === AppointmentStatus.COMPLETED) {
                await appointmentService.completeAppointment(appointmentId);
            } else if (status === AppointmentStatus.NO_SHOW) {
                await appointmentService.markNoShow(appointmentId);
            } else if (status === AppointmentStatus.CANCELLED) {
                await appointmentService.cancelAppointment(appointmentId);
            }
            loadAppointments();
        } catch (error) {
            console.error('Error updating appointment status:', error);
        }
    };

    const handleDateChange = (date) => {
        setSelectedDate(date);
    };

    const handleTimeOffDelete = async (timeOffId) => {
        try {
            await timeOffService.deleteTimeOff(timeOffId);
            setNotification({
                show: true,
                message: 'Urlop został pomyślnie usunięty',
                type: 'success'
            });
            loadTimeOffs();
        } catch (error) {
            setNotification({
                show: true,
                message: 'Wystąpił błąd podczas usuwania urlopu',
                type: 'error'
            });
            console.error('Error deleting time off:', error);
        }
    };

    return (
        <Container className="employee-dashboard-container"> {/* Użyj nowej klasy */}
            <Notification
                show={notification.show}
                message={notification.message}
                type={notification.type}
                onClose={() => setNotification({ ...notification, show: false })}
            />
            <h1 className="employee-dashboard-title mb-3">
                Panel Pracownika - {formData.firstName} {formData.lastName}
            </h1>
            
            <Row>
                <Col md={8}>
                    <Card className="employee-card mb-4">
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h4 className="mb-0">Kalendarz Wizyt</h4>
                                <div>
                                    <Button
                                        variant="outline-secondary"
                                        className="employee-button me-2"
                                        onClick={() => setShowWorkingHoursModal(true)}
                                    >
                                        Ustaw Godziny Pracy
                                    </Button>
                                    <Button
                                        variant="outline-secondary"
                                        className="employee-button"
                                        onClick={() => setShowTimeOffModal(true)}
                                    >
                                        Zaplanuj Urlop
                                    </Button>
                                </div>
                            </div>
                            <Calendar
                                onDateChange={handleDateChange}
                                selectedDate={selectedDate}
                                availableSlots={availableSlots}
                                loading={loading}
                            />
                        </Card.Body>
                    </Card>

                    <Card>
                        <Card.Body>
                            <h4 className="mb-3">Dzisiejsze Wizyty</h4>
                            <Table responsive>
                                <thead>
                                    <tr>
                                        <th>Godzina</th>
                                        <th>Klient</th>
                                        <th>Telefon</th>
                                        <th>Usługa</th>
                                        <th>Uwagi</th>
                                        <th>Status</th>
                                        <th>Akcje</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {appointments
                                        .filter(apt => new Date(apt.startTime).toDateString() === new Date().toDateString())
                                        .map(appointment => (
                                            <tr key={appointment.id}>
                                                <td>{new Date(appointment.startTime).toLocaleTimeString()}</td>
                                                <td>{`${appointment.client.firstName} ${appointment.client.lastName}`}</td>
                                                <td>{appointment.client.phoneNumber}</td>
                                                <td>{appointment.service.name}</td>
                                                <td>{appointment.notes}</td>
                                                <td>
                                                    <Badge bg={getStatusVariant(appointment.status)} className="me-2 employee-badge"> {/* Użyj nowej klasy */}
                                                        {getStatusText(appointment.status)}
                                                    </Badge>
                                                </td>
                                                <td>
                                                    <Button
                                                        variant="success"
                                                        size="sm"
                                                        className="me-2"
                                                        onClick={() => handleAppointmentStatusChange(appointment.id, AppointmentStatus.COMPLETED)}
                                                        disabled={appointment.status !== AppointmentStatus.SCHEDULED}
                                                    >
                                                        Zakończ
                                                    </Button>
                                                    <Button
                                                        variant="warning"
                                                        size="sm"
                                                        className="me-2"
                                                        onClick={() => handleAppointmentStatusChange(appointment.id, AppointmentStatus.NO_SHOW)}
                                                        disabled={appointment.status !== AppointmentStatus.SCHEDULED}
                                                    >
                                                        Nie przyszedł
                                                    </Button>
                                                    <Button
                                                        variant="danger"
                                                        size="sm"
                                                        onClick={() => handleAppointmentStatusChange(appointment.id, AppointmentStatus.CANCELLED)}
                                                        disabled={appointment.status === AppointmentStatus.COMPLETED || 
                                                                 appointment.status === AppointmentStatus.NO_SHOW}
                                                    >
                                                        Anuluj
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={4}>
                    <Card>
                        <Card.Body>
                            <h4 className="mb-3">Zaplanowane Urlopy</h4>
                            {timeOffs.map(timeOff => (
                                <div key={timeOff.id} className="time-off-card mb-3"> {/* Użyj nowej klasy */}
                                    <div className="d-flex justify-content-between">
                                        <div>
                                            <strong>
                                                {new Date(timeOff.startDate).toLocaleDateString()} - {new Date(timeOff.endDate).toLocaleDateString()}
                                            </strong>
                                        </div>
                                        <Button
                                            variant="outline-danger time-off-delete-button"
                                            size="sm"
                                            onClick={() => handleTimeOffDelete(timeOff.id)}
                                        >
                                            Usuń
                                        </Button>
                                    </div>
                                    <div className="text-muted mt-2">{timeOff.reason}</div>
                                </div>
                            ))}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Modal godzin pracy */}
            <Modal
                show={showWorkingHoursModal}
                onHide={() => setShowWorkingHoursModal(false)}
                size="lg"
            >
                <Modal.Header closeButton>
                    <Modal.Title>Ustaw Godziny Pracy</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <WorkingHoursForm
                        employeeId={user.id}
                        onSuccess={() => {
                            setShowWorkingHoursModal(false);
                            loadAppointments();
                        }}
                    />
                </Modal.Body>
            </Modal>

            {/* Modal urlopu */}
            <Modal
                show={showTimeOffModal}
                onHide={() => setShowTimeOffModal(false)}
            >
                <Modal.Header closeButton>
                    <Modal.Title>Zaplanuj Urlop</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <TimeOffForm
                        onSuccess={() => {
                            setShowTimeOffModal(false);
                            loadTimeOffs();
                        }}
                    />
                </Modal.Body>
            </Modal>
        </Container>
    );
};

export default EmployeeDashboard;
