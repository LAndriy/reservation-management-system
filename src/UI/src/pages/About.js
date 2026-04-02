import React from 'react';
import { Typography, Box, Grid, Card, CardContent, CardMedia, IconButton } from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import '../Style/About.css';

function About() {
    const teamMembers = [
        {
            name: 'Anna Kowalska',
            role: 'Główny Stylista',
            image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80',
            description: 'Specjalistka z 10-letnim doświadczeniem w stylizacji paznokci.',
            social: {
                facebook: '#',
                instagram: '#'
            }
        },
        {
            name: 'Maria Nowak',
            role: 'Stylista',
            image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
            description: 'Ekspertka w manicure hybrydowym i zdobnictwie.',
            social: {
                facebook: '#',
                instagram: '#'
            }
        }
    ];

    return (
        <Box className="about-container">
            <div className="about-header">
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#5C4033', mb: 2 }}>
                    O nas
                </Typography>
                <Typography variant="subtitle1" sx={{ color: '#666', mb: 4 }}>
                    Witamy w naszym ekskluzywnym salonie stylizacji paznokci
                </Typography>
            </div>

            <div className="about-content">
                <div className="about-section">
                    <img 
                        src="https://images.unsplash.com/photo-1604654894610-df63bc536371" 
                        alt="Salon" 
                        className="about-image"
                    />
                    <Typography variant="h5">Nasz Salon</Typography>
                    <Typography>
                        Nasz salon to miejsce, gdzie pasja spotyka się z profesjonalizmem. 
                        Oferujemy najwyższej jakości usługi manicure i pedicure w przytulnej, 
                        relaksującej atmosferze.
                    </Typography>
                </div>

                <div className="about-section">
                    <img 
                        src="https://images.unsplash.com/photo-1632345031435-8727f6897d53" 
                        alt="Usługi" 
                        className="about-image"
                    />
                    <Typography variant="h5">Nasze Usługi</Typography>
                    <Typography>
                        Specjalizujemy się w manicure hybrydowym, klasycznym oraz żelowym. 
                        Używamy tylko najlepszych produktów i najnowszych technik, aby zapewnić 
                        naszym klientom najwyższą jakość usług.
                    </Typography>
                </div>

                <div className="about-section">
                    <img 
                        src="/images/doswiadczenie.png" 
                        alt="Doświadczenie" 
                        className="about-image"
                    />
                    <Typography variant="h5">Nasze Doświadczenie</Typography>
                    <Typography>
                        Z ponad 10-letnim doświadczeniem w branży, nasz zespół profesjonalistów 
                        jest gotowy spełnić wszystkie Twoje oczekiwania. Regularnie szkolimy się 
                        i śledzimy najnowsze trendy.
                    </Typography>
                </div>
            </div>

            <div className="team-section">
                <Typography variant="h4" sx={{ color: '#5C4033', mb: 4 }}>
                    Nasz Zespół
                </Typography>
                <div className="team-grid">
                    {teamMembers.map((member, index) => (
                        <div key={index} className="team-member">
                            <img 
                                src={member.image} 
                                alt={member.name} 
                                className="member-image"
                            />
                            <Typography variant="h6" sx={{ color: '#5C4033' }}>
                                {member.name}
                            </Typography>
                            <Typography variant="subtitle1" sx={{ color: '#8B7355' }}>
                                {member.role}
                            </Typography>
                            <Typography sx={{ color: '#666', my: 2 }}>
                                {member.description}
                            </Typography>
                            <div className="social-links">
                                <IconButton 
                                    href={member.social.facebook}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <FacebookIcon />
                                </IconButton>
                                <IconButton 
                                    href={member.social.instagram}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <InstagramIcon />
                                </IconButton>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </Box>
    );
}

export default About;