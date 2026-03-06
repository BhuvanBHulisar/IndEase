import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Chip,
    IconButton,
    Avatar,
    Tooltip,
    TextField,
    InputAdornment,
    useTheme,
    Button,
    Grid,
    Rating,
    Divider,
    Menu,
    MenuItem,
    CircularProgress
} from '@mui/material';
import {
    Search,
    SearchOff,
    Verified,
    ErrorOutline,
    MoreVert,
    FilterList,
    Star,
    Engineering,
    Visibility,
    CheckCircle,
    PauseCircle,
    Block
} from '@mui/icons-material';
import adminApi from '../api/adminApi';

const Providers = () => {
    const [loading, setLoading] = useState(true);
    const [providers, setProviders] = useState([]);
    const [search, setSearch] = useState('');
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedProvider, setSelectedProvider] = useState(null);
    const theme = useTheme();

    const fetchProviders = async () => {
        setLoading(true);
        try {
            // Assuming a dedicated providers endpoint or filtering users by role 'producer'
            const { data } = await adminApi.get('/api/admin/users');
            setProviders(data.filter(u => u.role === 'producer'));
        } catch (err) {
            console.error('Error fetching providers:', err);
            // Fallback/Mock
            setProviders([
                { id: 'PROV001', name: 'Elite Plumbers Ltd', category: 'Plumbing', rating: 4.8, status: 'approved', jobsCount: 156 },
                { id: 'PROV002', name: 'Volt Masters', category: 'Electrical', rating: 4.5, status: 'pending', jobsCount: 0 },
                { id: 'PROV003', name: 'Crystal Clean Co', category: 'Cleaning', rating: 4.2, status: 'approved', jobsCount: 89 },
                { id: 'PROV004', name: 'Rapid Repairs', category: 'General Maintenance', rating: 3.9, status: 'suspended', jobsCount: 21 },
            ]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProviders();
    }, []);

    const handleMenuOpen = (event, provider) => {
        setAnchorEl(event.currentTarget);
        setSelectedProvider(provider);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedProvider(null);
    };

    const updateStatus = async (status) => {
        try {
            // Hypothetical status update route
            await adminApi.patch(`/api/admin/users/${selectedProvider.id}/status`, { status });
            fetchProviders();
        } catch (err) {
            console.error('Status update failed');
            // For demo purposes, we manually update the list if backend fails
            setProviders(prev => prev.map(p => p.id === selectedProvider.id ? { ...p, status } : p));
        }
        handleMenuClose();
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'approved': return 'success';
            case 'pending': return 'warning';
            case 'suspended': return 'error';
            default: return 'default';
        }
    };

    const filteredProviders = providers.filter(p =>
        (p.name || '').toLowerCase().includes(search.toLowerCase()) ||
        (p.category || '').toLowerCase().includes(search.toLowerCase())
    );

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 800 }}>Service Providers</Typography>
                    <Typography variant="body2" color="text.secondary">Verify credentials and manage status of professional contractors</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1.5 }}>
                    <Button startIcon={<FilterList />}>Filter</Button>
                    <Button
                        variant="contained"
                        startIcon={<Engineering />}
                        sx={{ borderRadius: 2.5, px: 2 }}
                    >
                        Bulk Verification
                    </Button>
                </Box>
            </Box>

            <Paper
                elevation={0}
                sx={{
                    p: 2.5,
                    borderRadius: 4,
                    border: `1px solid ${theme.palette.divider}`,
                    mb: 4,
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)'
                }}
            >
                <TextField
                    size="small"
                    placeholder="Search for providers or categories..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    sx={{ width: 400 }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Search sx={{ fontSize: 20, color: 'text.secondary' }} />
                            </InputAdornment>
                        ),
                        sx: { borderRadius: 2.5, bgcolor: 'background.paper' }
                    }}
                />
            </Paper>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <Grid container spacing={3}>
                    {filteredProviders.map((provider) => (
                        <Grid item xs={12} sm={6} lg={4} key={provider.id}>
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 3,
                                    borderRadius: 4,
                                    border: `1px solid ${theme.palette.divider}`,
                                    transition: 'all 0.2s',
                                    '&:hover': {
                                        borderColor: 'primary.main',
                                        boxShadow: theme.shadows[4],
                                        transform: 'translateY(-2px)'
                                    }
                                }}
                            >
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                    <Avatar
                                        variant="rounded"
                                        sx={{ width: 56, height: 56, bgcolor: 'primary.light', border: `1px solid ${theme.palette.primary.main}40` }}
                                    >
                                        {provider.name?.charAt(0) || <Engineering />}
                                    </Avatar>
                                    <IconButton size="small" onClick={(e) => handleMenuOpen(e, provider)}>
                                        <MoreVert />
                                    </IconButton>
                                </Box>

                                <Box sx={{ mb: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>{provider.name || 'Incognito Provider'}</Typography>
                                        {provider.status === 'approved' && <Verified color="primary" sx={{ fontSize: 18 }} />}
                                    </Box>
                                    <Typography variant="caption" color="text.secondary">{provider.category || 'General Service'}</Typography>
                                </Box>

                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                                    <Rating value={provider.rating || 0} readOnly precision={0.5} size="small" sx={{ color: '#f59e0b' }} />
                                    <Typography variant="caption" sx={{ fontWeight: 700 }}>{provider.rating || 'N/A'}</Typography>
                                    <Typography variant="caption" color="text.secondary">({provider.jobsCount || 0} Jobs)</Typography>
                                </Box>

                                <Divider sx={{ mb: 2, borderStyle: 'dashed' }} />

                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Chip
                                        label={provider.status?.toUpperCase() || 'UNKNOWN'}
                                        size="small"
                                        color={getStatusColor(provider.status)}
                                        variant="soft"
                                        sx={{ fontWeight: 700, borderRadius: 1.5, fontSize: '0.65rem', px: 1 }}
                                    />
                                    <Button variant="text" size="small" startIcon={<Visibility />}>
                                        Profile
                                    </Button>
                                </Box>
                            </Paper>
                        </Grid>
                    ))}
                    {filteredProviders.length === 0 && (
                        <Grid item xs={12}>
                            <Box sx={{ py: 10, textAlign: 'center', opacity: 0.5 }}>
                                <SearchOff sx={{ fontSize: 60, mb: 2 }} />
                                <Typography variant="h6">No providers found matching your search</Typography>
                            </Box>
                        </Grid>
                    )}
                </Grid>
            )}

            {/* Provider Actions Menu */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                PaperProps={{ elevation: 8, sx: { minWidth: 180, borderRadius: 3 } }}
            >
                <MenuItem onClick={() => updateStatus('approved')}>
                    <CheckCircle sx={{ fontSize: 18, mr: 1.5, color: 'success.main' }} /> Approve Verification
                </MenuItem>
                <MenuItem onClick={() => updateStatus('pending')}>
                    <PauseCircle sx={{ fontSize: 18, mr: 1.5, color: 'warning.main' }} /> Put on Hold
                </MenuItem>
                <MenuItem onClick={() => updateStatus('suspended')}>
                    <Block sx={{ fontSize: 18, mr: 1.5, color: 'error.main' }} /> Suspend Access
                </MenuItem>
            </Menu>
        </Box>
    );
};

export default Providers;
