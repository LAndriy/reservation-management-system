import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircle from '@mui/icons-material/AccountCircle';
import { 
    AppBar, 
    Toolbar, 
    IconButton, 
    Typography, 
    Button, 
    Drawer, 
    Menu, 
    MenuItem,
    List,
    ListItem,
    ListItemText,
    Box
} from '@mui/material';
import '../Style/Navbar.css';
import { useAuth } from '../context/AuthContext';

function Navbar() {
    const navigate = useNavigate();
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const { isAuthenticated, logout, user } = useAuth();

    const menuItems = [
        { text: 'O nas', path: '/' },
        { text: 'Uslugi', path: '/Services' },
        { text: 'Galeria', path: '/gallery' },
        { text: 'Rezerwacja', path: '/booking' },
        { text: 'Kontakt', path: '/contact' },
    ];
    
    const authMenuItems = [
        { text: 'Zaloguj się', path: '/login' },
        { text: 'Zarejestruj się', path: '/register' },
    ];
    
    const userMenuItems = [
        { text: 'Moje konto', path: '/account' },
        { text: 'Historia wizyt', path: '/appointmenthistory' },
        ...(user?.roles?.includes('Admin') ? [{ text: 'Panel Administracyjny', path: '/admin' }] : []),
        ...(user?.roles?.includes('Employee') || user?.roles?.includes('Admin') ? [{ text: 'Panel Pracownika', path: '/employee' }] : []),
        { text: 'Wyloguj się', path: null }
    ];

    const toggleDrawer = (open) => (event) => {
        if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return;
        }
        setDrawerOpen(open);
    };

    const handleMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleMenuItemClick = (path) => {
        handleClose();
        if (path === null) {
            logout();
            navigate('/');
        } else {
            navigate(path);
        }
    };

    const drawer = (
        <div
            role="presentation"
            onClick={toggleDrawer(false)}
            onKeyDown={toggleDrawer(false)}
        >
            <List>
                {menuItems.map((item) => (
                    <ListItem button key={item.text} component={Link} to={item.path}>
                        <ListItemText primary={item.text} />
                    </ListItem>
                ))}
                {!isAuthenticated && authMenuItems.map((item) => (
                    <ListItem button key={item.text} component={Link} to={item.path}>
                        <ListItemText primary={item.text} />
                    </ListItem>
                ))}
                {isAuthenticated && userMenuItems.map((item) => (
                    <ListItem 
                        button 
                        key={item.text} 
                        onClick={() => handleMenuItemClick(item.path)}
                    >
                        <ListItemText primary={item.text} />
                    </ListItem>
                ))}
            </List>
        </div>
    );

    return (
        <>
            <AppBar position="static" className='Navbar'>
                <Toolbar>
                    <IconButton
                        edge="start"
                        color="inherit"
                        aria-label="menu"
                        onClick={toggleDrawer(true)}
                        sx={{ display: { xs: 'block', sm: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" component={Link} to="/" style={{ flexGrow: 1, textDecoration: 'none', color: 'inherit' }}>
                        AllAboutNail
                    </Typography>
                    
                    {/* Menu items for desktop */}
                    <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center' }}>
                        {menuItems.map((item) => (
                            <Button
                                key={item.text}
                                component={Link}
                                to={item.path}
                                sx={{ color: 'white', mx: 1 }}
                            >
                                {item.text}
                            </Button>
                        ))}

                        {!isAuthenticated && authMenuItems.map((item) => (
                            <Button
                                key={item.text}
                                component={Link}
                                to={item.path}
                                sx={{ color: 'white', mx: 1 }}
                            >
                                {item.text}
                            </Button>
                        ))}

                        {isAuthenticated && (
                            <>
                                <IconButton
                                    onClick={handleMenu}
                                    color="inherit"
                                    sx={{ ml: 1 }}
                                >
                                    <AccountCircle />
                                    <Typography variant="body1" sx={{ ml: 1 }}>
                                        Moje konto
                                    </Typography>
                                </IconButton>
                                <Menu
                                    anchorEl={anchorEl}
                                    open={Boolean(anchorEl)}
                                    onClose={handleClose}
                                >
                                    {userMenuItems.map((item) => (
                                        <MenuItem
                                            key={item.text}
                                            onClick={() => handleMenuItemClick(item.path)}
                                        >
                                            {item.text}
                                        </MenuItem>
                                    ))}
                                </Menu>
                            </>
                        )}
                    </Box>
                </Toolbar>
            </AppBar>
            <Drawer
                anchor="left"
                open={drawerOpen}
                onClose={toggleDrawer(false)}
            >
                {drawer}
            </Drawer>
        </>
    );
}

export default Navbar;
