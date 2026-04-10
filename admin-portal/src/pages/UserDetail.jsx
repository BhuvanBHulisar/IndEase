import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box, Typography, Paper, Grid, Button, CircularProgress,
    Alert, useTheme, Chip, Divider, Avatar
} from '@mui/material';
import {
    ArrowBack, Person, Email, CalendarToday, Phone, LocationOn, Work
} from '@mui/icons-material';
import api from '../services/api';

export default function UserDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const theme = useTheme();

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchUser = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/admin/users/${id}/admin-detail`);
            setUser(res.data);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to load user details');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchUser(); }, [id]);

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', pt: 10 }}><CircularProgress /></Box>;
    if (error) return <Box sx={{ pt: 6 }}><Alert severity="error">{error}</Alert></Box>;
    if (!user) return null;

    const shortId = `USR-${String(id).substring(0, 6).toUpperCase()}`;
    const displayName = [user.first_name, user.last_name].filter(Boolean).join(' ') || user.email.split('@')[0];

    const cardSx = {
        p: 3, borderRadius: 4, border: `1px solid ${theme.palette.divider}`,
        elevation: 0, height: '100%', bgcolor: 'background.paper'
    };

    return (
        <Box>
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                <Button startIcon={<ArrowBack />} onClick={() => navigate('/users')} sx={{ color: 'text.secondary' }}>
                    Back to Users
                </Button>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>{shortId}</Typography>
                <Chip 
                    label={user.is_suspended ? 'SUSPENDED' : 'ACTIVE'} 
                    color={user.is_suspended ? 'error' : 'success'} 
                    size="small" 
                    sx={{ fontWeight: 800, borderRadius: 1.5 }} 
                />
            </Box>

            <Grid container spacing={3}>
                {/* Profile Overview */}
                <Grid item xs={12} md={5}>
                    <Paper elevation={0} sx={{ ...cardSx, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                        <Avatar sx={{ width: 100, height: 100, mb: 2, bgcolor: theme.palette.primary.main, fontSize: 32, fontWeight: 700 }}>
                            {displayName.charAt(0).toUpperCase()}
                        </Avatar>
                        <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>{displayName}</Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>{user.email}</Typography>
                        <Chip label={user.role.toUpperCase()} color="primary" variant="outlined" sx={{ fontWeight: 700, borderRadius: 1.5, mb: 3 }} />
                        
                        <Divider sx={{ width: '100%', mb: 3 }} />
                        
                        <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2, textAlign: 'left' }}>
                            <InfoRow icon={<CalendarToday sx={{ fontSize: 18 }} />} label="Joined Date" value={new Date(user.created_at).toLocaleDateString('en-GB')} />
                            <InfoRow icon={<Phone sx={{ fontSize: 18 }} />} label="Phone" value={user.phone || 'Not provided'} />
                            <InfoRow icon={<LocationOn sx={{ fontSize: 18 }} />} label="Location" value={user.location || 'Not provided'} />
                        </Box>
                    </Paper>
                </Grid>

                {/* Account Activity */}
                <Grid item xs={12} md={7}>
                    <Paper elevation={0} sx={cardSx}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 3, textTransform: 'uppercase', fontSize: '0.8rem', color: 'text.secondary', letterSpacing: 1 }}>
                            Account Activity
                        </Typography>

                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, mb: 4 }}>
                            <Box sx={{ p: 2, borderRadius: 3, bgcolor: 'primary.50', border: '1px solid', borderColor: 'primary.100' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                    <Work sx={{ color: 'primary.main', fontSize: 20 }} />
                                    <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.dark' }}>Total Service Jobs</Typography>
                                </Box>
                                <Typography variant="h4" sx={{ fontWeight: 900, color: 'primary.main' }}>
                                    {user.total_jobs}
                                </Typography>
                            </Box>
                        </Box>

                        <Alert severity={user.is_suspended ? 'error' : 'info'} sx={{ borderRadius: 2 }}>
                            {user.is_suspended 
                                ? 'This user is currently suspended and cannot create new service requests or interact with the platform.' 
                                : 'This user is in good standing currently.'}
                        </Alert>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}

function InfoRow({ icon, label, value }) {
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ color: 'text.secondary', display: 'flex' }}>{icon}</Box>
            <Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.2 }}>{label}</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{value}</Typography>
            </Box>
        </Box>
    );
}
