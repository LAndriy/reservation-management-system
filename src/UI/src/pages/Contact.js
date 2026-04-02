import React from 'react';
import { Typography, Link, Box, Paper, Container, Grid } from '@mui/material';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import "../Style/Contact.css";

const center = {
    lat: 50.04200593684404,
    lng: 21.998741324785357,
};

const Contact = () => {
    return (
        <Container maxWidth="lg" className="contact-container">
            <Box className="contact-header">
                <Typography variant="h4" sx={{ color: '#5C4033', fontWeight: 'bold', mb: 2 }}>
                    Kontakt
                </Typography>
                <Typography variant="subtitle1" sx={{ color: '#666', mb: 4 }}>
                    Jesteśmy tu dla Ciebie - skontaktuj się z nami!
                </Typography>
            </Box>

            <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                    <Paper elevation={3} className="contact-info-card">
                        <Typography variant="h5" sx={{ color: '#5C4033', mb: 3 }}>
                            Informacje kontaktowe
                        </Typography>
                        
                        <Box className="contact-detail">
                            <PhoneIcon sx={{ color: '#8B7355' }} />
                            <Typography>
                                <Link href="tel:+48123456789" className="contact-link">
                                    +48 123 456 789
                                </Link>
                            </Typography>
                        </Box>

                        <Box className="contact-detail">
                            <EmailIcon sx={{ color: '#8B7355' }} />
                            <Typography>
                                <Link href="mailto:kontakt@allaboutnail.pl" className="contact-link">
                                    kontakt@allaboutnail.pl
                                </Link>
                            </Typography>
                        </Box>

                        <Box className="contact-detail">
                            <LocationOnIcon sx={{ color: '#8B7355' }} />
                                <Typography>
                                    <a 
                                        href="https://maps.app.goo.gl/FBZk2SHpM7oc2XaFA" 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        style={{ textDecoration: 'none',color: '#8B7355'}}
                                    >
                                        ul. Przykładowa 123<br />
                                        35-000 Rzeszów
                                    </a>
                                </Typography>
                        </Box>

                        <Box className="contact-detail">
                            <Typography sx={{ color: '#5C4033'}}>
                                Godziny otwarcia
                            </Typography>
                            <Typography sx={{ color: '#8B7355' }}>
                                Pn. - Pt. : 8:00 - 18:00
                            </Typography>
                            <Typography sx={{ color: '#8B7355' }}>
                                Sb. : 9:00 - 17:00
                            </Typography>
                        </Box>

                        <Box className="social-links">
                            <Link href="https://www.instagram.com/allabout.nail" target="_blank" className="social-icon">
                                <FacebookIcon fontSize="large" />
                            </Link>
                            <Link href="https://www.instagram.com/allabout.nail" target="_blank" className="social-icon">
                                <InstagramIcon fontSize="large" />
                            </Link>
                        </Box>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Paper elevation={3} className="map-card">
                        <Typography variant="h5" sx={{ color: '#5C4033', mb: 2 }}>
                            Lokalizacja
                        </Typography>
                        <LoadScript googleMapsApiKey="AIzaSyAfPR19sg0qNMCRNaNG86pBySD9Dn91__E">
                            <GoogleMap mapContainerClassName="map-container" center={center} zoom={15}>
                                <Marker position={center} />
                            </GoogleMap>
                        </LoadScript>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};

export default Contact;
