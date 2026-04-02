import React, { useState, useEffect } from 'react';
import { 
    Typography, 
    Box, 
    Grid, 
    CircularProgress, 
    Card, 
    CardContent,
    Divider,
    Container,
    Collapse,
    IconButton
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import serviceService from '../services/serviceService';
import ServiceManagement from '../components/ServiceManagement';
import { useAuth } from '../context/AuthContext';
import '../Style/Services.css';

function Services() {
    const { user } = useAuth();
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isManagementOpen, setIsManagementOpen] = useState(false);

    const fetchServices = async () => {
        try {
            const data = await serviceService.getAllServices();
            setServices(data);
            setError(null);
        } catch (error) {
            setError('Nie udało się pobrać listy usług');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchServices();
    }, []);

    const groupedServices = services.reduce((acc, service) => {
        const category = service.category || 'Inne';
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(service);
        return acc;
    }, {});

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <CircularProgress sx={{ color: '#8B7355' }} />
            </Box>
        );
    }

    if (error) {
        return (
            <Box mt={4}>
                <Typography color="error" align="center">
                    {error}
                </Typography>
            </Box>
        );
    }

    const canManageServices = user?.roles?.includes('Employee') || user?.roles?.includes('Admin');

    return (
        <Container maxWidth="lg" className="services-container">
            <Box className="services-header">
                <Typography variant="h4" sx={{ color: '#5C4033', fontWeight: 'bold', mb: 2 }}>
                    Nasze Usługi
                </Typography>
                <Typography variant="subtitle1" sx={{ color: '#666', mb: 4 }}>
                    Profesjonalne usługi manicure i pedicure
                </Typography>
            </Box>

            {canManageServices && (
                <Card className="management-section">
                    <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
                        <Box 
                            className="management-header"
                            onClick={() => setIsManagementOpen(!isManagementOpen)}
                        >
                            <Typography variant="h6">
                                Panel zarządzania usługami
                            </Typography>
                            <IconButton>
                                {isManagementOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                            </IconButton>
                        </Box>
                        <Collapse in={isManagementOpen}>
                            <Box className="management-content">
                                <ServiceManagement 
                                    services={services} 
                                    onServiceUpdate={fetchServices} 
                                />
                            </Box>
                        </Collapse>
                    </CardContent>
                </Card>
            )}
                        <Grid container spacing={4}>
                {Object.entries(groupedServices).map(([category, categoryServices]) => (
                    categoryServices.length > 0 && (
                        <Grid item xs={12} key={category}>
                            <Card className="category-card">
                                <CardContent>
                                    <Typography variant="h5" className="category-title">
                                        {category}
                                    </Typography>
                                    <Divider sx={{ my: 2 }} />
                                    
                                    <Grid container spacing={3}>
                                        {categoryServices.map((service) => (
                                            <Grid item xs={12} md={6} key={service.id}>
                                                <Card className="service-card">
                                                    <CardContent>
                                                        <Box className="service-header">
                                                            <Typography variant="h6" className="service-name">
                                                                {service.name}
                                                            </Typography>
                                                            <Typography variant="h6" className="service-price">
                                                                {service.price} zł
                                                            </Typography>
                                                        </Box>
                                                        
                                                        {service.description && (
                                                            <Typography className="service-description">
                                                                {service.description}
                                                            </Typography>
                                                        )}
                                                        
                                                        <Box className="service-details">
                                                            <Box className="detail-item">
                                                                <AccessTimeIcon sx={{ color: '#8B7355' }} />
                                                                <Typography>
                                                                    {service.durationInMinutes} min
                                                                </Typography>
                                                            </Box>
                                                        </Box>
                                                    </CardContent>
                                                </Card>
                                            </Grid>
                                        ))}
                                    </Grid>
                                </CardContent>
                            </Card>
                        </Grid>
                    )
                ))}
            </Grid>

        </Container>
    );
}

export default Services;