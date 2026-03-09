import api from '../services/api';
import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Grid,
    useTheme,
    Button,
    Divider,
    TextField,
    InputAdornment,
    Switch,
    FormControlLabel,
    CircularProgress,
    Snackbar,
    Alert,
    Tooltip,
    IconButton,
    Card,
    CardContent,
    CardHeader,
    List,
    ListItem,
    ListItemText
} from '@mui/material';
import {
    Settings as SettingsIcon,
    Save,
    InfoOutlined,
    AccountBalance,
    VpnKey,
    AdminPanelSettings,
    NotificationsActive,
    CloudDone,
    Security
} from '@mui/icons-material';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import Avatar from '@mui/material/Avatar';
import PercentIcon from '@mui/icons-material/Percent';
import adminApi from '../api/adminApi';

const Settings = () => {
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });
    const theme = useTheme();

    const [platformSettings, setPlatformSettings] = useState({
        commissionPercentage: 10,
        gstPercentage: 18,
        payoutInterval: 7,
        autoApproveProviders: false,
        mfaEnabled: true,
        realtimeLogging: true,
        razorpayId: 'rzp_test_XXXXXXXXX',
        razorpaySecret: '*********************'
    });

    const handleUpdate = (field, value) => {
        setPlatformSettings(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            // Hypothetical update settings route
            await adminApi.patch('/api/admin/settings', platformSettings);
            setToast({ open: true, message: 'Global platform settings updated successfully', severity: 'success' });
        } catch (err) {
            setToast({ open: true, message: 'Administrative override failed. Check logs.', severity: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 800 }}>Platform Directives</Typography>
                    <Typography variant="body2" color="text.secondary">Master parameters of the OrigiNode Marketplace</Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Save />}
                    onClick={handleSave}
                    disabled={loading}
                    sx={{ borderRadius: 2.5, px: 3 }}
                >
                    {loading ? 'Committing...' : 'Commit Changes'}
                </Button>
            </Box>

            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Card elevation={0} sx={{ borderRadius: 4, border: `1px solid ${theme.palette.divider}`, mb: 3 }}>
                        <CardHeader
                            title="Revenue & Commission"
                            titleTypographyProps={{ variant: 'subtitle1', fontWeight: 800 }}
                            avatar={<Avatar sx={{ bgcolor: 'primary.light', color: 'primary.main' }}><MonetizationOnIcon /></Avatar>}
                        />
                        <CardContent sx={{ pt: 0 }}>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 3 }}>
                                These parameters control the platform's profitability and tax compliance.
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                <TextField
                                    label="Platform Service Fee"
                                    value={platformSettings.commissionPercentage}
                                    onChange={(e) => handleUpdate('commissionPercentage', e.target.value)}
                                    fullWidth
                                    InputProps={{
                                        endAdornment: <InputAdornment position="end">%</InputAdornment>
                                    }}
                                />
                                <TextField
                                    label="Goods & Services Tax (GST)"
                                    value={platformSettings.gstPercentage}
                                    onChange={(e) => handleUpdate('gstPercentage', e.target.value)}
                                    fullWidth
                                    InputProps={{
                                        endAdornment: <InputAdornment position="end">%</InputAdornment>
                                    }}
                                />
                                <TextField
                                    label="Standard Payout Cycle"
                                    value={platformSettings.payoutInterval}
                                    onChange={(e) => handleUpdate('payoutInterval', e.target.value)}
                                    fullWidth
                                    InputProps={{
                                        endAdornment: <InputAdornment position="end">Days</InputAdornment>
                                    }}
                                />
                            </Box>
                        </CardContent>
                    </Card>

                    <Card elevation={0} sx={{ borderRadius: 4, border: `1px solid ${theme.palette.divider}` }}>
                        <CardHeader
                            title="Payment Infrastructure"
                            titleTypographyProps={{ variant: 'subtitle1', fontWeight: 800 }}
                            avatar={<Avatar sx={{ bgcolor: 'warning.light', color: 'warning.main' }}><VpnKey /></Avatar>}
                        />
                        <CardContent sx={{ pt: 0 }}>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 3 }}>
                                Current active gateway: Razorpay (Production Profile)
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                <TextField
                                    label="Gateway Public Key ID"
                                    value={platformSettings.razorpayId}
                                    fullWidth
                                    disabled
                                />
                                <TextField
                                    label="Gateway Secret Hash"
                                    value={platformSettings.razorpaySecret}
                                    fullWidth
                                    disabled
                                    type="password"
                                />
                            </Box>
                            <Typography variant="caption" sx={{ mt: 2, display: 'block', fontStyle: 'italic', opacity: 0.6 }}>
                                Keys are encrypted and only visible to Root Administrators.
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Card elevation={0} sx={{ borderRadius: 4, border: `1px solid ${theme.palette.divider}`, mb: 3 }}>
                        <CardHeader
                            title="Policy Automation"
                            titleTypographyProps={{ variant: 'subtitle1', fontWeight: 800 }}
                            avatar={<Avatar sx={{ bgcolor: 'secondary.light', color: 'secondary.dark' }}><CloudDone /></Avatar>}
                        />
                        <CardContent sx={{ pt: 0 }}>
                            <List>
                                <ListItem disablePadding sx={{ py: 1.5 }}>
                                    <FormControlLabel
                                        control={<Switch checked={platformSettings.autoApproveProviders} onChange={(e) => handleUpdate('autoApproveProviders', e.target.checked)} />}
                                        label={
                                            <Box>
                                                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Auto-Verify Providers</Typography>
                                                <Typography variant="caption" color="text.secondary">Automatically approve provider profiles upon KYC success</Typography>
                                            </Box>
                                        }
                                    />
                                </ListItem>
                                <Divider />
                                <ListItem disablePadding sx={{ py: 1.5 }}>
                                    <FormControlLabel
                                        control={<Switch checked={platformSettings.realtimeLogging} onChange={(e) => handleUpdate('realtimeLogging', e.target.checked)} />}
                                        label={
                                            <Box>
                                                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Verbose JSON Logging</Typography>
                                                <Typography variant="caption" color="text.secondary">Enable full-body logging for administrative transactions</Typography>
                                            </Box>
                                        }
                                    />
                                </ListItem>
                            </List>
                        </CardContent>
                    </Card>

                    <Card elevation={0} sx={{ borderRadius: 4, border: `1px solid ${theme.palette.divider}`, bgcolor: theme.palette.mode === 'dark' ? 'rgba(239,68,68,0.05)' : 'rgba(239,68,68,0.02)' }}>
                        <CardHeader
                            title="Administrative Security"
                            titleTypographyProps={{ variant: 'subtitle1', fontWeight: 800, color: 'error.main' }}
                            avatar={<Avatar sx={{ bgcolor: 'error.light', color: 'error.main' }}><Security /></Avatar>}
                        />
                        <CardContent sx={{ pt: 0 }}>
                            <List>
                                <ListItem disablePadding sx={{ py: 1.5 }}>
                                    <FormControlLabel
                                        control={<Switch checked={platformSettings.mfaEnabled} onChange={(e) => handleUpdate('mfaEnabled', e.target.checked)} />}
                                        label={
                                            <Box>
                                                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Mandatory Admin MFA</Typography>
                                                <Typography variant="caption" color="text.secondary">Require 2FA for all administrative dashboard access (Highly Recommended)</Typography>
                                            </Box>
                                        }
                                    />
                                </ListItem>
                                <Divider />
                                <ListItem disableGutters sx={{ mt: 2 }}>
                                    <Button color="error" fullWidth sx={{ fontWeight: 700, p: 1.5, border: '1px dashed' }} startIcon={<AdminPanelSettings />}>
                                        Purge Admin Session Cache
                                    </Button>
                                </ListItem>
                            </List>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Snackbar
                open={toast.open}
                autoHideDuration={4000}
                onClose={() => setToast({ ...toast, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert severity={toast.severity} variant="filled" sx={{ width: '100%', borderRadius: 3 }}>
                    {toast.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default Settings;
