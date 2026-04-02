import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { CssBaseline, Container, Box } from '@mui/material';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CookieBanner from './components/CookieBanner';
import About from './pages/About';
import Services from './pages/Services';
import Gallery from './pages/Gallery.js';
import Booking from './pages/Booking';
import Contact from './pages/Contact';
import Login from "./pages/Login";
import Register from "./pages/Register";
import Account from './pages/Account';
import AppointmentHistory from './pages/AppointmentHistory';
import AdminPanel from './pages/AdminPanel';
import EmployeeDashboard from './pages/EmployeeDashboard';
import PrivateRoute from './components/PrivateRoute';
import PrivacyPolicy from './pages/PrivacyPolicy';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { GOOGLE_CLIENT_ID } from './config/google.config';

function App() {
    return (
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <AuthProvider>
                <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                    <CssBaseline />
                    <Navbar />
                    <Container>
                        <Routes>
                            <Route path="/" element={<About />} />
                            <Route path="/services" element={<Services />} />
                            <Route path="/gallery" element={<Gallery />} />
                            <Route path="/booking" element={<Booking />} />
                            <Route path="/contact" element={<Contact />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            <Route path="/account" element={<Account />} />
                            <Route path="/appointmenthistory" element={
                                <PrivateRoute>
                                    <AppointmentHistory />
                                </PrivateRoute>
                            } />
                            <Route path="/history" element={<AppointmentHistory />} />
                            <Route path="/admin" element={
                                <PrivateRoute roles={['Admin']}>
                                    <AdminPanel />
                                </PrivateRoute>
                            } />
                            <Route path="/employee" element={
                                <PrivateRoute roles={['Employee', 'Admin']}>
                                    <EmployeeDashboard />
                                </PrivateRoute>
                            } />
                            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                        </Routes>
                    </Container>
                    <Footer />
                    <CookieBanner />
                </Box>
            </AuthProvider>
        </GoogleOAuthProvider>
    );
}

export default App;