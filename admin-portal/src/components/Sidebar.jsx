import React from 'react';
import {
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Toolbar,
    Box,
    Typography,
    Divider,
    useTheme
} from '@mui/material';
import {
    Dashboard as DashboardIcon,
    People as PeopleIcon,
    Engineering as EngineeringIcon,
    Work as WorkIcon,
    Payments as PaymentsIcon,
    Analytics as AnalyticsIcon,
    Settings as SettingsIcon,
    Shield as ShieldIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const sidebarWidth = 260;

const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Users', icon: <PeopleIcon />, path: '/users' },
    { text: 'Providers', icon: <EngineeringIcon />, path: '/providers' },
    { text: 'Jobs', icon: <WorkIcon />, path: '/jobs' },
    { text: 'Payments', icon: <PaymentsIcon />, path: '/payments' },
    { text: 'Analytics', icon: <AnalyticsIcon />, path: '/analytics' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
];

const Sidebar = ({ open, onToggle, isMobile }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();

    const drawerContent = (
        <Box>
            <Toolbar disableGutters sx={{ px: 3, display: 'flex', alignItems: 'center', pb: 2 }}>
                <ShieldIcon sx={{ mr: 1, color: 'primary.main', fontSize: 22 }} />
                <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: '-0.5px', fontSize: '1.2rem' }}>
                    CORE<span style={{ color: theme.palette.primary.main }}>PANEL</span>
                </Typography>
            </Toolbar>

            <List sx={{ mt: 2, px: 2 }}>
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
                            <ListItemButton
                                onClick={() => {
                                    navigate(item.path);
                                    if (isMobile) onToggle();
                                }}
                                sx={{
                                    borderRadius: 2,
                                    px: 2,
                                    py: 1.25,
                                    backgroundColor: isActive ? 'primary.main' : 'transparent',
                                    color: isActive ? '#fff' : 'text.secondary',
                                    '&:hover': {
                                        backgroundColor: isActive ? 'primary.main' : 'rgba(59, 130, 246, 0.08)',
                                        color: isActive ? '#fff' : 'primary.main',
                                    },
                                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                }}
                            >
                                <ListItemIcon sx={{
                                    minWidth: 40,
                                    color: isActive ? '#fff' : 'inherit',
                                    '& svg': { fontSize: 22 }
                                }}>
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText
                                    primary={item.text}
                                    primaryTypographyProps={{
                                        fontWeight: isActive ? 700 : 500,
                                        fontSize: '0.925rem'
                                    }}
                                />
                            </ListItemButton>
                        </ListItem>
                    );
                })}
            </List>

            <Box sx={{ flexGrow: 1 }} />
            <Divider sx={{ mx: 2, my: 4 }} />

            {/* Sidebar Footer/Help card */}
            <Box sx={{ p: 2, m: 2, bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Version 2.4.1</Typography>
                <Typography variant="caption" color="text.secondary">Secure Core Platform</Typography>
            </Box>
        </Box>
    );

    return (
        <Box
            component="nav"
            sx={{ width: { md: sidebarWidth }, flexShrink: { md: 0 } }}
        >
            {/* Mobile drawer */}
            <Drawer
                variant="temporary"
                open={open}
                onClose={onToggle}
                ModalProps={{ keepMounted: true }}
                sx={{
                    display: { xs: 'block', md: 'none' },
                    '& .MuiDrawer-paper': {
                        boxSizing: 'border-box',
                        width: sidebarWidth,
                        boxShadow: theme.shadows[10],
                        bgcolor: theme.palette.background.paper
                    },
                }}
            >
                {drawerContent}
            </Drawer>

            {/* Desktop drawer */}
            <Drawer
                variant="permanent"
                sx={{
                    display: { xs: 'none', md: 'block' },
                    '& .MuiDrawer-paper': {
                        boxSizing: 'border-box',
                        width: sidebarWidth,
                        border: 'none',
                        borderRight: `1px solid ${theme.palette.divider}`,
                        bgcolor: theme.palette.background.paper
                    },
                }}
                open
            >
                {drawerContent}
            </Drawer>
        </Box>
    );
};

export default Sidebar;
