import React from 'react';
import { Typography, Box, List, ListItem, ListItemText } from '@mui/material';

function VisitHistory() {
    const reservations = [
        { id: 1, date: '2025-01-15', time: '10:00', employee: 'Anna' },
        { id: 2, date: '2025-01-20', time: '14:30', employee: 'Ewa' },
    ];

    return (
        <Box>
            <Typography  mt={4} variant="h4" sx={{ fontWeight: 'bold', color: '#555' }}>Historia wizyt</Typography>
            <Box mt={2}>
                <List>
                    {reservations.map((reservation) => (
                        <ListItem key={reservation.id}>
                            <ListItemText
                                primary={`Data: ${reservation.date}, Godzina: ${reservation.time}`}
                                secondary={`Pracownik: ${reservation.employee}`}
                            />
                        </ListItem>
                    ))}
                </List>
            </Box>
        </Box>
    );
}

export default VisitHistory;
