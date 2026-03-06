import React, { useContext } from 'react';
import {
    AppBar,
    Toolbar,
    IconButton,
    Typography,
    Box,
    Badge,
    Avatar,
    Tooltip,
    useTheme
} from '@mui/material';
import {
    Menu as MenuIcon,
    Notifications as NotificationsIcon,
    DarkMode as DarkModeIcon,
    LightMode as LightModeIcon,
    Logout as LogoutIcon
} from '@mui/icons-material';
import { ColorModeContext } from '../theme';

const Header = ({ onMenuClick }) => {
    const theme = useTheme();
    const colorMode = useContext(ColorModeContext);

    const handleLogout = () => {
        // Clear admin-related sessions if needed, but here it's token-based from .env
        console.log('Logging out from admin portal...');
        window.location.reload();
    };

    return (
        <AppBar
            position="fixed"
            elevation={0}
            sx={{
                zIndex: (theme) => theme.zIndex.drawer + 1,
                backgroundColor: theme.palette.background.paper,
                color: theme.palette.text.primary,
                borderBottom: `1px solid ${theme.palette.divider}`,
            }}
        >
            <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <IconButton
                        size="large"
                        edge="start"
                        color="inherit"
                        aria-label="menu"
                        sx={{ mr: 2, display: { md: 'none' } }}
                        onClick={onMenuClick}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography
                        variant="h6"
                        noWrap
                        component="div"
                        sx={{ fontWeight: 800, color: 'primary.main', letterSpacing: '-0.5px' }}
                    >
                        ORIGINODE <span style={{ color: theme.palette.text.primary }}>ADMIN</span>
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Tooltip title={theme.palette.mode === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
                        <IconButton onClick={colorMode.toggleColorMode} color="inherit">
                            {theme.palette.mode === 'dark' ? <LightModeIcon sx={{ fontSize: 22 }} /> : <DarkModeIcon sx={{ fontSize: 22 }} />}
                        </IconButton>
                    </Tooltip>

                    <IconButton color="inherit">
                        <Badge badgeContent={4} color="error">
                            <NotificationsIcon sx={{ fontSize: 22 }} />
                        </Badge>
                    </IconButton>

                    <Box sx={{ display: 'flex', alignItems: 'center', ml: 2, gap: 1.5 }}>
                        <Box sx={{ textAlign: 'right', display: { xs: 'none', sm: 'block' } }}>
                            <Typography variant="subtitle2" sx={{ lineHeight: 1 }}>Admin Root</Typography>
                            <Typography variant="caption" color="text.secondary">Software Engineer</Typography>
                        </Box>
                        <Avatar
                            sx={{
                                width: 40,
                                height: 40,
                                bgcolor: 'primary.main',
                                fontWeight: 700,
                                fontSize: '0.9rem'
                            }}
                        >
                            AR
                        </Avatar>
                        <Tooltip title="Logout">
                            <IconButton onClick={handleLogout} color="inherit" sx={{ ml: 1 }}>
                                <LogoutIcon sx={{ fontSize: 20 }} />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Header;
