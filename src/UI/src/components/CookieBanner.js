import React, { useState, useEffect } from 'react';
import { Snackbar, Button, Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const CookieBanner = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const cookiesAccepted = localStorage.getItem('cookiesAccepted');
    if (!cookiesAccepted) {
      setOpen(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookiesAccepted', 'true');
    setOpen(false);
  };

  return (
    <Snackbar
      open={open}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      message={
        <>
          Ta strona używa niezbędnych plików cookies i local storage do prawidłowego działania.{' '}
          <Link component={RouterLink} to="/privacy-policy" color="inherit" underline="always">
            Dowiedz się więcej
          </Link>
        </>
      }
      action={
        <Button color="primary" size="small" onClick={handleAccept}>
          Rozumiem
        </Button>
      }
    />
  );
};

export default CookieBanner;
