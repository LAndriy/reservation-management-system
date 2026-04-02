import React from 'react';
import { Box, Container, Typography, Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const Footer = () => {
  return (
    <Box component="footer" sx={{ bgcolor: 'background.paper', py: 3, mt: 'auto' }}>
      <Container maxWidth="lg">
        <Typography variant="body2" color="text.secondary" align="center">
          © {new Date().getFullYear()} All About Nail. Wszelkie prawa zastrzeżone.
          {' | '}
          <Link component={RouterLink} to="/privacy-policy" color="inherit">
            Polityka Prywatności
          </Link>
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;
