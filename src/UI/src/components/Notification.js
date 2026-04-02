import React from 'react';
import { Snackbar, Alert } from '@mui/material';

function Notification({ show, message, type, onClose }) {
    // Map type to severity
    const getSeverity = (type) => {
        switch (type) {
            case 'success':
                return 'success';
            case 'error':
                return 'error';
            case 'warning':
                return 'warning';
            case 'info':
                return 'info';
            default:
                return 'info';
        }
    };

    return (
        <Snackbar
            open={show}
            autoHideDuration={3000}
            onClose={onClose}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
            <Alert onClose={onClose} severity={getSeverity(type)} sx={{ width: '100%' }}>
                {message}
            </Alert>
        </Snackbar>
    );
}

export default Notification;
