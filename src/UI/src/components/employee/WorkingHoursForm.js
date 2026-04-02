import React, { useState, useEffect } from 'react';
import { Form, Button, Alert, Row, Col } from 'react-bootstrap';
import workingHoursService from '../../services/workingHoursService';
import Notification from '../Notification';

const WorkingHoursForm = ({ employeeId, onSuccess }) => {
    const daysOfWeek = [
        'Niedziela', 'Poniedziałek', 'Wtorek', 'Środa', 'Czwartek',
        'Piątek', 'Sobota'
    ];

    const [workingHours, setWorkingHours] = useState(daysOfWeek.map((_, index) => ({
        dayOfWeek: index,
        startTime: '',
        endTime: '',
        isWorking: false,
        breaks: []
    })));
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState({
        show: false,
        message: '',
        type: 'success'
    });

    const handleCloseNotification = () => {
        setNotification({ ...notification, show: false });
    };

    const showNotification = (message, type = 'success') => {
        setNotification({
            show: true,
            message,
            type
        });
    };

    useEffect(() => {
        loadWorkingHours();
    }, [employeeId]);

    const loadWorkingHours = async () => {
        try {
            const data = await workingHoursService.getEmployeeWorkingHours(employeeId);
            if (Array.isArray(data)) {
                // Tworzymy pełną tablicę dni tygodnia
                const fullWeek = daysOfWeek.map((_, index) => ({
                    dayOfWeek: index,
                    startTime: '',
                    endTime: '',
                    isWorking: false,
                    breaks: []
                }));

                // Aktualizujemy dni, dla których mamy dane
                data.forEach(workingHour => {
                    fullWeek[workingHour.dayOfWeek] = {
                        ...workingHour,
                        isWorking: true,
                        breaks: workingHour.breakStartTime ? [{
                            startTime: workingHour.breakStartTime,
                            endTime: workingHour.breakEndTime
                        }] : []
                    };
                });

                setWorkingHours(fullWeek);
            }
        } catch (error) {
            console.error('Error loading working hours:', error);
            setError('Nie udało się załadować harmonogramu');
        }
    };

    const validateWorkingHours = (workingHour) => {
        if (!workingHour.startTime || !workingHour.endTime) {
            return 'Godziny pracy są wymagane';
        }

        const startTime = new Date(`1970-01-01T${workingHour.startTime}`);
        const endTime = new Date(`1970-01-01T${workingHour.endTime}`);

        if (startTime >= endTime) {
            return 'Godzina rozpoczęcia musi być wcześniejsza niż godzina zakończenia';
        }

        if (workingHour.breaks?.length > 0) {
            const breakStartTime = new Date(`1970-01-01T${workingHour.breaks[0].startTime}`);
            const breakEndTime = new Date(`1970-01-01T${workingHour.breaks[0].endTime}`);

            if (breakStartTime >= breakEndTime) {
                return 'Godzina rozpoczęcia przerwy musi być wcześniejsza niż godzina zakończenia';
            }

            if (breakStartTime < startTime || breakEndTime > endTime) {
                return 'Przerwa musi być w godzinach pracy';
            }
        }

        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Wysyłamy tylko dni, które są zaznaczone jako robocze
            const validWorkingHours = workingHours
                .filter(day => day.isWorking)
                .map(day => ({
                    employeeId: parseInt(employeeId),
                    dayOfWeek: day.dayOfWeek,
                    startTime: day.startTime || null,
                    endTime: day.endTime || null,
                    breakStartTime: day.breaks?.[0]?.startTime || null,
                    breakEndTime: day.breaks?.[0]?.endTime || null
                }));

            console.log('Valid working hours:', validWorkingHours);

            // Walidacja przed wysłaniem
            for (const workingHour of validWorkingHours) {
                const error = validateWorkingHours(workingHour);
                if (error) {
                    setError(`${daysOfWeek[workingHour.dayOfWeek]}: ${error}`);
                    setLoading(false);
                    return;
                }
            }

            // Wysyłamy każdy dzień osobno
            for (const workingHour of validWorkingHours) {
                try {
                    await workingHoursService.setWorkingHours(workingHour);
                } catch (error) {
                    // Jeśli błąd dotyczy istniejących godzin, kontynuujemy (zostanie zaktualizowane)
                    if (error.message?.includes('already exist')) {
                        continue;
                    }
                    throw error; // Rzucamy błąd dalej jeśli to inny problem
                }
            }
            showNotification('Pomyślnie zapisano godziny pracy', 'success');
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error('Error saving working hours:', error);
            const errorMessage = error.message || 'Nie udało się zapisać harmonogramu';
            setError(errorMessage);
            showNotification(errorMessage, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleHoursChange = (dayIndex, field, value) => {
        const updatedHours = [...workingHours];
        if (!updatedHours[dayIndex]) {
            updatedHours[dayIndex] = {
                dayOfWeek: dayIndex,
                startTime: '',
                endTime: '',
                isWorking: false,
                breaks: []
            };
        }

        if (field === 'isWorking') {
            updatedHours[dayIndex].isWorking = value;
            if (!value) {
                updatedHours[dayIndex].startTime = '';
                updatedHours[dayIndex].endTime = '';
                updatedHours[dayIndex].breaks = [];
            }
        } else {
            updatedHours[dayIndex][field] = value;
        }

        setWorkingHours(updatedHours);
    };

    const addBreak = (dayIndex) => {
        const updatedHours = [...workingHours];
        if (!updatedHours[dayIndex].breaks) {
            updatedHours[dayIndex].breaks = [];
        }
        updatedHours[dayIndex].breaks.push({
            startTime: '',
            endTime: ''
        });
        setWorkingHours(updatedHours);
    };

    const updateBreak = (dayIndex, breakIndex, field, value) => {
        const updatedHours = [...workingHours];
        updatedHours[dayIndex].breaks[breakIndex][field] = value;
        setWorkingHours(updatedHours);
    };

    const removeBreak = (dayIndex, breakIndex) => {
        const updatedHours = [...workingHours];
        updatedHours[dayIndex].breaks.splice(breakIndex, 1);
        setWorkingHours(updatedHours);
    };

    return (
        <div>
            <Form onSubmit={handleSubmit}>
                {error && <Alert variant="danger">{error}</Alert>}

                {daysOfWeek.map((day, index) => (
                    <div key={day} className="mb-4 border-bottom pb-4">
                        <Row className="mb-3 align-items-center">
                            <Col xs={12} md={3}>
                                <Form.Check
                                    type="checkbox"
                                    id={`working-${index}`}
                                    label={day}
                                    checked={workingHours[index]?.isWorking || false}
                                    onChange={(e) => handleHoursChange(index, 'isWorking', e.target.checked)}
                                />
                            </Col>
                            {workingHours[index]?.isWorking && (
                                <>
                                    <Col xs={12} md={4}>
                                        <Form.Group>
                                            <Form.Label>Od</Form.Label>
                                            <Form.Control
                                                type="time"
                                                value={workingHours[index]?.startTime || ''}
                                                onChange={(e) => handleHoursChange(index, 'startTime', e.target.value)}
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col xs={12} md={4}>
                                        <Form.Group>
                                            <Form.Label>Do</Form.Label>
                                            <Form.Control
                                                type="time"
                                                value={workingHours[index]?.endTime || ''}
                                                onChange={(e) => handleHoursChange(index, 'endTime', e.target.value)}
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                </>
                            )}
                        </Row>

                        {workingHours[index]?.isWorking && (
                            <div className="ms-3">
                                <h6 className="mb-3">Przerwy</h6>
                                {workingHours[index]?.breaks?.map((breakItem, breakIndex) => (
                                    <Row key={breakIndex} className="mb-2 align-items-end">
                                        <Col xs={12} md={4}>
                                            <Form.Group>
                                                <Form.Label>Od</Form.Label>
                                                <Form.Control
                                                    type="time"
                                                    value={breakItem.startTime}
                                                    onChange={(e) => updateBreak(index, breakIndex, 'startTime', e.target.value)}
                                                    required
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col xs={12} md={4}>
                                            <Form.Group>
                                                <Form.Label>Do</Form.Label>
                                                <Form.Control
                                                    type="time"
                                                    value={breakItem.endTime}
                                                    onChange={(e) => updateBreak(index, breakIndex, 'endTime', e.target.value)}
                                                    required
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col xs={12} md={4}>
                                            <Button
                                                variant="danger"
                                                size="sm"
                                                onClick={() => removeBreak(index, breakIndex)}
                                                className="mb-3"
                                            >
                                                Usuń przerwę
                                            </Button>
                                        </Col>
                                    </Row>
                                ))}
                                <Button
                                    variant="outline-secondary"
                                    size="sm"
                                    onClick={() => addBreak(index)}
                                    className="mt-2"
                                >
                                    + Dodaj przerwę
                                </Button>
                            </div>
                        )}
                    </div>
                ))}

                <Button
                    type="submit"
                    variant="primary"
                    disabled={loading}
                    className="w-100 mt-3"
                >
                    {loading ? 'Zapisywanie...' : 'Zapisz harmonogram'}
                </Button>
            </Form>
            <Notification
                show={notification.show}
                message={notification.message}
                type={notification.type}
                onClose={handleCloseNotification}
            />
        </div>
    );
};

export default WorkingHoursForm;
