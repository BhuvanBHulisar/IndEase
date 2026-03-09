import React, { useContext, useState, useRef, useEffect } from 'react';
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
import { useNavigate } from 'react-router-dom';
import socket from '../services/socket';
import api from '../services/api';

const Header = ({ onMenuClick }) => {
    const theme = useTheme();
    const colorMode = useContext(ColorModeContext);
    const navigate = useNavigate();

    const [notifications, setNotifications] = useState([]);
    const [notifOpen, setNotifOpen] = useState(false);
    const notifRef = useRef(null);

    // Profile dropdown
    const [profileOpen, setProfileOpen] = useState(false);
    const profileRef = useRef(null);

    // Handle outside click for dropdowns
    useEffect(() => {
        function handleClickOutside(event) {
            if (notifOpen && notifRef.current && !notifRef.current.contains(event.target)) {
                setNotifOpen(false);
            }
            if (profileOpen && profileRef.current && !profileRef.current.contains(event.target)) {
                setProfileOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [notifOpen, profileOpen]);

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        navigate('/login', { replace: true });
    };

    const handleNotifClick = () => {
        setNotifOpen((open) => !open);
        // Mark notifications as viewed (clear badge)
        if (notifications.length > 0) setNotifications([]);
    };

    const handleProfileClick = () => {
        setProfileOpen((open) => !open);
    };

    useEffect(() => {
        let mounted = true;
        const fetchNotifications = async () => {
            try {
                const res = await api.get('/admin/notifications');
                if (mounted) {
                    setNotifications(res.data.map(n => n.message));
                }
            } catch (err) {
                // Silently handle notification fetch errors
            }
        };
        fetchNotifications();
        // Listen for real-time notifications
        socket.on('admin_notification', (data) => {
            if (mounted) {
                setNotifications(prev => [data.message, ...prev]);
            }
        });
        return () => {
            mounted = false;
            socket.off('admin_notification');
        };
    }, []);

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

                    {/* Notification Bell */}
                    <Box ref={notifRef} sx={{ position: 'relative' }}>
                        <IconButton color="inherit" onClick={handleNotifClick}>
                            <Badge badgeContent={notifications.length} color="error">
                                <NotificationsIcon sx={{ fontSize: 22 }} />
                            </Badge>
                        </IconButton>
                        {notifOpen && (
                            <Box sx={{
                                position: 'absolute',
                                top: '110%',
                                right: 0,
                                minWidth: 240,
                                bgcolor: 'background.paper',
                                boxShadow: 3,
                                borderRadius: 2,
                                p: 2,
                                zIndex: 1201,
                            }}>
                                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>Notifications</Typography>
                                {notifications.length > 0 ? notifications.map((notification, idx) => (
                                    <Box key={idx} sx={{
                                        py: 1,
                                        borderBottom: idx < notifications.length - 1 ? '1px solid #e0e0e0' : 'none',
                                        color: 'text.primary',
                                    }}>
                                        {notification.message || notification}
                                    </Box>
                                )) : (
                                    <Typography variant="caption" color="text.secondary">All notifications viewed</Typography>
                                )}
                            </Box>
                        )}
                    </Box>

                    {/* Profile Dropdown */}
                    <Box ref={profileRef} sx={{ display: 'flex', alignItems: 'center', ml: 2, gap: 1.5, position: 'relative' }}>
                        <Box sx={{ textAlign: 'right', display: { xs: 'none', sm: 'block' }, cursor: 'pointer' }} onClick={handleProfileClick}>
                            <Typography variant="subtitle2" sx={{ lineHeight: 1 }}>Admin Root</Typography>
                            <Typography variant="caption" color="text.secondary">Software Engineer</Typography>
                        </Box>
                        <Avatar
                            sx={{
                                width: 40,
                                height: 40,
                                bgcolor: 'primary.main',
                                fontWeight: 700,
                                fontSize: '0.9rem',
                                cursor: 'pointer'
                            }}
                            onClick={handleProfileClick}
                        >
                            AR
                        </Avatar>
                        {profileOpen && (
                            <Box sx={{
                                position: 'absolute',
                                top: '110%',
                                right: 0,
                                minWidth: 180,
                                bgcolor: 'background.paper',
                                boxShadow: 3,
                                borderRadius: 2,
                                p: 1,
                                zIndex: 1201,
                            }}>
                                <Box sx={{ py: 1, cursor: 'pointer', color: 'text.primary', fontWeight: 600 }} onClick={() => { setProfileOpen(false); navigate('/admin/profile'); }}>View Profile</Box>
                                <Box sx={{ py: 1, cursor: 'pointer', color: 'text.primary', fontWeight: 600 }} onClick={() => { setProfileOpen(false); navigate('/settings'); }}>Settings</Box>
                                <Box sx={{ py: 1, cursor: 'pointer', color: 'error.main', fontWeight: 600 }} onClick={() => { setProfileOpen(false); handleLogout(); }}>Logout</Box>
                            </Box>
                        )}
                    </Box>
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Header;
