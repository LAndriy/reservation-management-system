import React, { useState, useEffect, useCallback } from 'react';
import { CircularProgress } from '@mui/material';
import '../Style/Calendar.css';

const daysOfWeek = ['Pon.', 'Wto.', 'Śro.', 'Czw.', 'Pią.', 'Sob.'];
const monthNames = [
    'Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec',
    'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'
];

const Calendar = ({ 
    onSlotSelect, 
    selectedSlot, 
    loading: externalLoading, 
    onDateChange, 
    selectedDate: initialSelectedDate, 
    availableSlots = [],
    onTimeSelect 
}) => {
    const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
    const [startDate, setStartDate] = useState(new Date());
    const [selectedTime, setSelectedTime] = useState(null);
    const [selectedDate, setSelectedDate] = useState(initialSelectedDate || new Date());

    const generateDays = useCallback(() => {
        const days = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Find Monday of the current week
        const monday = new Date(startDate);
        monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));

        // Generate 6 days (Mon-Sat)
        for (let i = 0; i < 6; i++) {
            const date = new Date(monday);
            date.setDate(monday.getDate() + i);
            days.push(date);
        }
        return days;
    }, [startDate]);

    useEffect(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        setStartDate(today);
    }, []);

    useEffect(() => {
        if (onDateChange) {
            onDateChange(selectedDate);
        }
    }, [selectedDate, onDateChange]);

    useEffect(() => {
        const today = new Date();
        const dayOfWeek = today.getDay();
        const shift = dayOfWeek === 0 ? 1 : (1 - dayOfWeek);
        const newStartDate = new Date(today);
        newStartDate.setDate(today.getDate() + shift + currentWeekOffset * 7);
        newStartDate.setHours(0, 0, 0, 0);
        setStartDate(newStartDate);
    }, [currentWeekOffset]);

    const handlePrevWeek = () => {
        setCurrentWeekOffset(prev => prev - 1);
    };

    const handleNextWeek = () => {
        setCurrentWeekOffset(prev => prev + 1);
    };

    const handleTimeSelect = (slot) => {
        setSelectedTime(slot);
        onTimeSelect(slot);
    };

    const isSlotAvailable = (date, timeSlot) => {
        const slotDateTime = new Date(date);
        slotDateTime.setHours(timeSlot.hour, timeSlot.minute, 0, 0);
        
        return availableSlots.some(slot => {
            const availableSlot = new Date(slot);
            return availableSlot.getTime() === slotDateTime.getTime();
        });
    };

    const isSlotInPast = (date, timeSlot) => {
        const now = new Date();
        const slotDateTime = new Date(date);
        slotDateTime.setHours(timeSlot.hour, timeSlot.minute, 0, 0);
        return slotDateTime < now;
    };

    const renderTimeSlots = (date) => {
        // Get unique hours from available slots for this date
        const slotsForDay = availableSlots.filter(slot => {
            const slotDate = new Date(slot);
            return slotDate.getDate() === date.getDate() &&
                   slotDate.getMonth() === date.getMonth() &&
                   slotDate.getFullYear() === date.getFullYear();
        });

        // Extract hours and minutes from available slots
        const timeSlots = slotsForDay.map(slot => {
            const slotDate = new Date(slot);
            return {
                hour: slotDate.getHours(),
                minute: slotDate.getMinutes()
            };
        });

        return (
            <div className="time-slots">
                {timeSlots.map((timeSlot, index) => {
                    const slotDateTime = new Date(date);
                    slotDateTime.setHours(timeSlot.hour, timeSlot.minute, 0, 0);
                    const isSelected = selectedTime && selectedTime.getTime() === slotDateTime.getTime();
                    const isPast = isSlotInPast(date, timeSlot);

                    return (
                        <button
                            key={index}
                            className={`time-slot available ${isPast ? 'past' : ''} ${isSelected ? 'selected' : ''}`}
                            onClick={() => !isPast && handleTimeSelect(slotDateTime)}
                            disabled={isPast}
                            title={isPast ? 'Ten termin już minął' : 'Kliknij aby zarezerwować'}
                        >
                            {`${timeSlot.hour.toString().padStart(2, '0')}:${timeSlot.minute.toString().padStart(2, '0')}`}
                        </button>
                    );
                })}
            </div>
        );
    };

    const renderDayCell = (date) => {
        const isToday = date.toDateString() === new Date().toDateString();
        const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
        const isPast = date < new Date().setHours(0, 0, 0, 0);

        const cellClasses = [
            'calendar-day',
            isToday ? 'today' : '',
            isSelected ? 'selected' : '',
            isPast ? 'past' : '',
        ].filter(Boolean).join(' ');

        return (
            <div 
                key={date.toISOString()} 
                className={cellClasses}
            >
                <div className="day-header">
                    <span className="day-name">{daysOfWeek[date.getDay() === 0 ? 6 : date.getDay() - 1]}</span>
                    <span className="day-number">{date.getDate()}</span>
                </div>
                {renderTimeSlots(date)}
            </div>
        );
    };

    if (externalLoading) {
        return (
            <div className="calendar-loading">
                <CircularProgress />
                <p>Ładowanie dostępnych terminów...</p>
            </div>
        );
    }

    return (
        <div className='reservation-container'>
            <div className="calendar">
                <div className="calendar-header">
                    <button onClick={handlePrevWeek}>
                        &lt;
                    </button>
                    <div className="month-year-header">
                        {monthNames[startDate.getMonth()]} {startDate.getFullYear()}
                    </div>
                    <button 
                        onClick={handleNextWeek}
                        disabled={currentWeekOffset >= 4}
                    >
                        &gt;
                    </button>
                </div>
                <div className="days-container">
                    {generateDays().map(date => renderDayCell(date))}
                </div>
            </div>
        </div>
    );
};

export default Calendar;