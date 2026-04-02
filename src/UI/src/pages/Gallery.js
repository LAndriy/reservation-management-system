import React, { useState } from 'react';
import { Box, Grid, Typography, Container, Modal, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import '../Style/Gallery.css';

function Gallery() {
    const [selectedImage, setSelectedImage] = useState(null);

    const images = [
        { src: '/images/nails1.jpg' },
        { src: '/images/nails2.jpg' },
        { src: '/images/nails3.jpg' },
        { src: '/images/nails4.jpg' },
        { src: '/images/nails5.jpg' },
        { src: '/images/nails6.jpg' },
        { src: '/images/nails7.jpg' },
        { src: '/images/nails11.jpg' },
        { src: '/images/nails12.jpg' }
    ];

    const handleImageClick = (index) => {
        setSelectedImage(index);
    };

    const handleClose = () => {
        setSelectedImage(null);
    };

    const handlePrevious = () => {
        setSelectedImage((prev) => (prev > 0 ? prev - 1 : images.length - 1));
    };

    const handleNext = () => {
        setSelectedImage((prev) => (prev < images.length - 1 ? prev + 1 : 0));
    };

    return (
        <Container maxWidth="lg" className="gallery-container">
            <Box className="gallery-header">
                <Typography variant="h4" sx={{ color: '#5C4033', fontWeight: 'bold', mb: 2 }}>
                    Galeria prac
                </Typography>
            </Box>

            <Grid container spacing={3}>
                {images.map((image, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                        <div className="gallery-item">
                            <div className="image-wrapper" onClick={() => handleImageClick(index)}>
                                <img
                                    src={image.src}
                                    alt={`Nail design ${index + 1}`}
                                    className="gallery-image"
                                />
                                <div className="image-overlay">
                                    <span>Powiększ</span>
                                </div>
                            </div>
                        </div>
                    </Grid>
                ))}
            </Grid>

            <Modal
                open={selectedImage !== null}
                onClose={handleClose}
                className="gallery-modal"
            >
                <Box className="modal-content">
                    <IconButton className="close-button" onClick={handleClose}>
                        <CloseIcon />
                    </IconButton>
                    <IconButton className="nav-button prev" onClick={handlePrevious}>
                        <NavigateBeforeIcon />
                    </IconButton>
                    {selectedImage !== null && (
                        <img
                            src={images[selectedImage].src}
                            alt={`Nail design ${selectedImage + 1}`}
                            className="modal-image"
                        />
                    )}
                    <IconButton className="nav-button next" onClick={handleNext}>
                        <NavigateNextIcon />
                    </IconButton>
                </Box>
            </Modal>
        </Container>
    );
}

export default Gallery;