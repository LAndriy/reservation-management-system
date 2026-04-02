import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import timeOffService from '../../services/timeOffService';
import Notification from '../Notification';

const TimeOffForm = ({ onSuccess }) => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState({
        show: false,
        message: '',
        type: 'success'
    });

    const handleCloseNotification = () => {
        setNotification({ ...notification, show: false });
    };

    const validateDates = () => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (start >= end) {
            return 'Data rozpoczęcia musi być wcześniejsza niż data zakończenia';
        }

        if (start < today) {
            return 'Data rozpoczęcia nie może być w przeszłości';
        }

        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Walidacja
        if (!startDate || !endDate || !reason) {
            setNotification({
                show: true,
                message: 'Wypełnij wszystkie pola formularza',
                type: 'error'
            });
            setLoading(false);
            return;
        }

        const dateError = validateDates();
        if (dateError) {
            setNotification({
                show: true,
                message: dateError,
                type: 'error'
            });
            setLoading(false);
            return;
        }

        try {
            await timeOffService.createTimeOff({
                startDate: new Date(startDate).toISOString(),
                endDate: new Date(endDate).toISOString(),
                reason
            });
            
            // Wyczyść formularz
            setStartDate('');
            setEndDate('');
            setReason('');
            
            setNotification({
                show: true,
                message: 'Pomyślnie dodano urlop',
                type: 'success'
            });
            if (onSuccess) onSuccess();
        } catch (error) {
            if (error.response?.data?.errors) {
                const errorMessages = Object.values(error.response.data.errors)
                    .flat()
                    .join(', ');
                setNotification({
                    show: true,
                    message: errorMessages,
                    type: 'error'
                });
            } else {
                setNotification({
                    show: true,
                    message: 'Nie udało się zapisać urlopu',
                    type: 'error'
                });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <Notification
                show={notification.show}
                message={notification.message}
                type={notification.type}
                onClose={handleCloseNotification}
            />
            <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                    <Form.Label>Data rozpoczęcia</Form.Label>
                    <Form.Control
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        required
                        min={new Date().toISOString().split('T')[0]}
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Data zakończenia</Form.Label>
                    <Form.Control
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        required
                        min={startDate || new Date().toISOString().split('T')[0]}
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Powód</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={3}
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        required
                        maxLength={200}
                        placeholder="Opisz powód urlopu..."
                    />
                </Form.Group>

                <Button variant="primary" type="submit" disabled={loading}>
                    {loading ? 'Zapisywanie...' : 'Zapisz urlop'}
                </Button>
            </Form>
        </div>
    );
};

export default TimeOffForm;
