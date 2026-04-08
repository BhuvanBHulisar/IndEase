import api from '../services/api';
import React, { useState, useEffect } from 'react';
import { Skeleton, 
    Box, Typography, Paper, Chip, IconButton, Avatar, Tooltip,
    TextField, InputAdornment, useTheme, Button, Grid, Rating,
    Divider, Menu, MenuItem, CircularProgress, Snackbar, Alert,
    Dialog, DialogTitle, DialogContent, DialogActions
 } from '@mui/material';
import {
    Search, SearchOff, Verified, MoreVert, FilterList,
    PersonAdd, ContentCopy, History, Payments, TrendingUp, Star,
    Update, Timer, DoneAll, Cancel, AccountBalanceWallet,
    Engineering, Visibility, CheckCircle, PauseCircle, Block,
    Delete, WarningAmber, Info, ArrowForward, Close
} from '@mui/icons-material';

const EMPTY_FORM = {
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    specialization: '',
    machineTypes: '',
    serviceCity: '',
    yearsOfExperience: '',
    qualification: '',
    bankAccountNumber: '',
    ifscCode: '',
    accountHolderName: ''
};

const Providers = () => {
    const [loading, setLoading] = useState(true);
    const [providers, setProviders] = useState([]);
    const [search, setSearch] = useState('');
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedProvider, setSelectedProvider] = useState(null);
    const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });
    const theme = useTheme();

    // Create modal
    const [modalOpen, setModalOpen] = useState(false);
    const [form, setForm] = useState(EMPTY_FORM);
    const [formErrors, setFormErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    // Credentials summary modal
    const [credsModal, setCredsModal] = useState({ open: false, name: '', email: '', password: '', emailSent: true });

    // Detailed Profile View
    const [profileModalOpen, setProfileModalOpen] = useState(false);
    const [providerDetails, setProviderDetails] = useState(null);
    const [fetchingDetails, setFetchingDetails] = useState(false);

    // Removal flow
    const [removalModal, setRemovalModal] = useState({ 
        open: false, 
        step: 1, 
        reason: '', 
        otherReason: '',
        loading: false 
    });

    const removalReasons = [
        "Performance below acceptable level",
        "Violation of platform terms",
        "Fraudulent activity reported",
        "Expert requested account removal",
        "No longer serving in this region",
        "Other"
    ];

    const handleViewProfile = async (provider) => {
        setSelectedProvider(provider);
        setFetchingDetails(true);
        setProfileModalOpen(true);
        try {
            const res = await api.get(`/admin/providers/${provider.id}/stats`);
            setProviderDetails(res.data);
        } catch (err) {
            setProviderDetails({
                points: 0,
                level: 'Starter',
                salary: 0,
                jobsCompleted: 0,
                avgCompletionTime: '0 hrs',
                specialization: 'Expert',
                memberSince: provider.created_at || new Date().toISOString(),
                bankAccountStatus: 'NOT PROVIDED',
                acceptanceRate: '0%',
                lifetimeEarnings: 0
            });
        } finally {
            setFetchingDetails(false);
        }
    };

    const fetchProviders = async () => {
        setLoading(true);
        try {
            const response = await api.get('/admin/providers');
            setProviders(response.data);
        } catch (err) {
            console.error('Error fetching providers:', err);
            setProviders([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchProviders(); }, []);

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
            await api.patch(`/admin/users/${selectedProvider.id}/status`, { status });
            setProviders(prev => prev.map(p => p.id === selectedProvider.id ? { ...p, status, suspended_at: status === 'suspended' ? new Date().toISOString() : p.suspended_at } : p));
            setToast({ open: true, message: `Expert status updated to ${status}`, severity: 'success' });
        } catch (err) {
            setToast({ open: true, message: `Status update failed: ${err.message || err}`, severity: 'error' });
        }
        handleMenuClose();
    };

    const handleRemoveExpert = async () => {
        setRemovalModal(p => ({ ...p, loading: true }));
        try {
            const reason = removalModal.reason === 'Other' ? removalModal.otherReason : removalModal.reason;
            // Use DELETE method as per fixed API specs
            await api.delete(`/admin/providers/${selectedProvider.id}`, { data: { reason } });
            
            setProviders(prev => prev.filter(p => p.id !== selectedProvider.id));
            setToast({ open: true, message: `Expert ${selectedProvider.name} has been permanently removed from the platform.`, severity: 'success' });
            setRemovalModal({ open: false, step: 1, reason: '', otherReason: '', loading: false });
            handleMenuClose();
        } catch (err) {
            setToast({ open: true, message: err.response?.data?.error || 'Failed to remove expert', severity: 'error' });
            setRemovalModal(p => ({ ...p, loading: false }));
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'approved':
            case 'available': return 'success';
            case 'pending': return 'warning';
            case 'suspended':
            case 'blocked': return 'error';
            default: return 'default';
        }
    };

    // Form handlers
    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validateForm = () => {
        const errors = {};
        if (!form.fullName.trim()) errors.fullName = 'Full name is required';
        if (!form.email.trim()) errors.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Enter a valid email';
        if (!form.password) errors.password = 'Password is required';
        else if (form.password.length < 8) errors.password = 'Minimum 8 characters';
        if (!form.confirmPassword) errors.confirmPassword = 'Please confirm the password';
        else if (form.password !== form.confirmPassword) errors.confirmPassword = 'Passwords do not match';
        if (!form.serviceCity.trim()) errors.serviceCity = 'Service city is required';
        return errors;
    };

    const handleSubmit = async () => {
        const errors = validateForm();
        if (Object.keys(errors).length > 0) { setFormErrors(errors); return; }
        setSubmitting(true);
        try {
            const response = await api.post('/admin/providers', {
                fullName: form.fullName.trim(),
                email: form.email.trim(),
                password: form.password,
                phone: form.phone.trim() || undefined,
                specialization: form.specialization.trim() || undefined,
                machineTypes: form.machineTypes.trim() || undefined,
                serviceCity: form.serviceCity.trim(),
                yearsOfExperience: form.yearsOfExperience ? Number(form.yearsOfExperience) : undefined,
                qualification: form.qualification.trim() || undefined,
                bankAccountNumber: form.bankAccountNumber.trim() || undefined,
                ifscCode: form.ifscCode.trim() || undefined,
                accountHolderName: form.accountHolderName.trim() || undefined
            });

            setProviders(prev => [response.data, ...prev]);
            setModalOpen(false);

            // Show credentials summary modal
            setCredsModal({
                open: true,
                name: response.data.name,
                email: form.email.trim(),
                password: form.password,
                emailSent: response.data.emailSent !== false
            });

            setForm(EMPTY_FORM);
            setFormErrors({});
        } catch (err) {
            const msg = err.response?.data?.error || 'Failed to create expert account';
            if (err.response?.status === 409) {
                setFormErrors(prev => ({ ...prev, email: msg }));
            } else {
                setToast({ open: true, message: msg, severity: 'error' });
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleModalClose = () => {
        if (submitting) return;
        setModalOpen(false);
        setForm(EMPTY_FORM);
        setFormErrors({});
    };

    const handleCopyCredentials = () => {
        const text = `Email: ${credsModal.email}
Password: ${credsModal.password}`;
        navigator.clipboard.writeText(text).then(() => {
            setToast({ open: true, message: 'Credentials copied to clipboard', severity: 'success' });
        });
    };
    
    const [salaryModal, setSalaryModal] = useState({ open: false, loading: false });

    const handleReleaseSalary = (provider) => {
        setSelectedProvider(provider);
        setSalaryModal({ open: true, loading: false });
    };

    const confirmSalaryRelease = async () => {
        setSalaryModal(p => ({ ...p, loading: true }));
        try {
            await api.post('/admin/payments/release-salary', {
                expertId: selectedProvider.id,
                amount: selectedProvider.levelSalary
            });
            setToast({ open: true, message: `Salary of ₹${selectedProvider.levelSalary?.toLocaleString()} released to ${selectedProvider.name}`, severity: 'success' });
            setSalaryModal({ open: false, loading: false });
            fetchProviders();
        } catch (err) {
            setToast({ open: true, message: err.response?.data?.error || 'Failed to release salary', severity: 'error' });
            setSalaryModal(p => ({ ...p, loading: false }));
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
                    <Button variant="contained" startIcon={<Engineering />} sx={{ borderRadius: 2.5, px: 2 }}>
                        Verify All
                    </Button>
                    <Button
                        variant="contained"
                        color="success"
                        startIcon={<PersonAdd />}
                        sx={{ borderRadius: 2.5, px: 2 }}
                        onClick={() => setModalOpen(true)}
                    >
                        + Add Expert
                    </Button>
                </Box>
            </Box>

            <Paper elevation={0} sx={{ p: 2.5, borderRadius: 4, border: `1px solid ${theme.palette.divider}`, mb: 4, bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)' }}>
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
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>
            ) : (
                <Grid container spacing={3}>
                    {filteredProviders.map((provider) => (
                        <Grid item xs={12} sm={6} lg={4} key={provider.id}>
                            <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: `1px solid ${theme.palette.divider}`, transition: 'all 0.2s', '&:hover': { borderColor: 'primary.main', boxShadow: theme.shadows[4], transform: 'translateY(-2px)' } }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                    <Avatar variant="rounded" sx={{ width: 56, height: 56, bgcolor: 'primary.light', border: `1px solid ${theme.palette.primary.main}40` }}>
                                        {provider.name?.charAt(0) || <Engineering />}
                                    </Avatar>
                                    <IconButton size="small" onClick={(e) => handleMenuOpen(e, provider)}>
                                        <MoreVert />
                                    </IconButton>
                                </Box>
                                <Box sx={{ mb: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>{provider.name || 'Incognito Provider'}</Typography>
                                        {provider.status === 'approved' && <Verified color="primary" sx={{ fontSize: 18 }} />}
                                        
                                        {provider.status === 'suspended' && provider.suspended_at && 
                                          (new Date() - new Date(provider.suspended_at)) > (30 * 24 * 60 * 60 * 1000) && (
                                            <Tooltip title="Suspended for over 30 days — Actions recommended">
                                                <Chip 
                                                    icon={<WarningAmber style={{ fontSize: 12 }} />}
                                                    label="Pending Review" 
                                                    size="small" 
                                                    color="error"
                                                    variant="outlined"
                                                    sx={{ height: 20, fontSize: '0.6rem', fontWeight: 800 }}
                                                />
                                            </Tooltip>
                                        )}
                                    </Box>
                                    <Typography variant="caption" color="text.secondary">{provider.category || 'General Service'}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                                    <Rating value={Number(provider.rating) || 0} readOnly precision={0.5} size="small" sx={{ color: '#f59e0b' }} />
                                    <Typography variant="caption" sx={{ fontWeight: 700 }}>{provider.rating || 'N/A'}</Typography>
                                    <Typography variant="caption" color="text.secondary">({provider.jobsCount || 0} Jobs)</Typography>
                                </Box>

                                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mb: 2 }}>
                                    <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'action.hover' }}>
                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>Level / Points</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{provider.level || 'Starter'} — {provider.points || 0} pts</Typography>
                                    </Box>
                                    <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'action.hover' }}>
                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>Monthly Salary</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 700 }}>₹{provider.levelSalary?.toLocaleString() || 0}</Typography>
                                    </Box>
                                </Box>

                                <Divider sx={{ mb: 2, borderStyle: 'dashed' }} />
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                                        <Chip label={provider.status?.toUpperCase() || 'UNKNOWN'} size="small" color={getStatusColor(provider.status)} variant="soft" sx={{ fontWeight: 700, borderRadius: 1.5, fontSize: '0.65rem', px: 1 }} />
                                        {provider.bankAccountNumber && (
                                            <Tooltip title="Bank Details Verified">
                                                <CheckCircle sx={{ fontSize: 16, color: 'success.main', mt: 0.5 }} />
                                            </Tooltip>
                                        )}
                                    </Box>
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        <Button 
                                            variant="contained" 
                                            size="small" 
                                            color="primary" 
                                            sx={{ borderRadius: 1.5, fontSize: '0.7rem' }}
                                            onClick={() => handleReleaseSalary(provider)}
                                            disabled={!provider.bankAccountNumber}
                                        >
                                            Release Salary
                                        </Button>
                                        <Button 
                                            variant="text" 
                                            size="small" 
                                            startIcon={<Visibility />}
                                            onClick={() => handleViewProfile(provider)}
                                        >
                                            Profile
                                        </Button>
                                    </Box>
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
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose} PaperProps={{ elevation: 8, sx: { minWidth: 200, borderRadius: 3, py: 1 } }}>
                <MenuItem onClick={() => updateStatus('approved')} sx={{ py: 1.2 }}>
                    <CheckCircle sx={{ fontSize: 18, mr: 1.5, color: 'success.main' }} /> Approve Expert
                </MenuItem>
                <MenuItem onClick={() => updateStatus('pending')} sx={{ py: 1.2 }}>
                    <PauseCircle sx={{ fontSize: 18, mr: 1.5, color: 'warning.main' }} /> Suspend Temporarily
                </MenuItem>
                <MenuItem onClick={() => updateStatus('suspended')} sx={{ py: 1.2 }}>
                    <Block sx={{ fontSize: 18, mr: 1.5, color: 'error.main' }} /> Suspend Account
                </MenuItem>
                <Divider />
                <MenuItem onClick={() => setRemovalModal(p => ({ ...p, open: true, step: 1 }))} sx={{ py: 1.2, color: 'error.main' }}>
                    <Delete sx={{ fontSize: 18, mr: 1.5 }} /> Remove Expert
                </MenuItem>
            </Menu>

            {/* ── Remove Expert Flow (Multi-step) ── */}
            <Dialog 
                open={removalModal.open} 
                onClose={() => !removalModal.loading && setRemovalModal(p => ({ ...p, open: false }))} 
                maxWidth={removalModal.step === 1 ? "xs" : "sm"} 
                fullWidth 
                PaperProps={{ sx: { borderRadius: 4 } }}
            >
                {removalModal.step === 1 ? (
                    <>
                        <DialogTitle sx={{ fontWeight: 800 }}>
                            Remove Expert Account
                            <Typography variant="body2" color="text.secondary" fontWeight={400}>Please select a reason for removal.</Typography>
                        </DialogTitle>
                        <DialogContent>
                            <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                                {removalReasons.map(reason => (
                                    <Button
                                        key={reason}
                                        variant={removalModal.reason === reason ? "contained" : "outlined"}
                                        color={removalModal.reason === reason ? "primary" : "inherit"}
                                        onClick={() => setRemovalModal(p => ({ ...p, reason }))}
                                        sx={{ justifyContent: 'flex-start', textAlign: 'left', py: 1.5, px: 2, borderRadius: 2, textTransform: 'none' }}
                                    >
                                        {reason}
                                    </Button>
                                ))}
                                {removalModal.reason === 'Other' && (
                                    <TextField
                                        autoFocus
                                        margin="dense"
                                        label="Please specify"
                                        fullWidth
                                        variant="outlined"
                                        size="small"
                                        value={removalModal.otherReason}
                                        onChange={(e) => setRemovalModal(p => ({ ...p, otherReason: e.target.value }))}
                                        sx={{ mt: 1 }}
                                    />
                                )}
                            </Box>
                        </DialogContent>
                        <DialogActions sx={{ px: 3, pb: 3 }}>
                            <Button onClick={() => setRemovalModal(p => ({ ...p, open: false }))}>Cancel</Button>
                            <Button 
                                variant="contained" 
                                disabled={!removalModal.reason || (removalModal.reason === 'Other' && !removalModal.otherReason)}
                                onClick={() => setRemovalModal(p => ({ ...p, step: 2 }))}
                                startIcon={<ArrowForward />}
                                sx={{ borderRadius: 2.5, px: 3 }}
                            >
                                Next
                            </Button>
                        </DialogActions>
                    </>
                ) : (
                    <>
                        <DialogTitle sx={{ fontWeight: 800 }}>Confirm Expert Removal</DialogTitle>
                        <DialogContent>
                            <Box sx={{ bgcolor: 'action.hover', p: 2, borderRadius: 3, mb: 3 }}>
                                <Grid container spacing={1}>
                                    <Grid item xs={4}><Typography variant="body2" color="text.secondary">Expert Name:</Typography></Grid>
                                    <Grid item xs={8}><Typography variant="body2" fontWeight={700}>{selectedProvider?.name}</Typography></Grid>
                                    <Grid item xs={4}><Typography variant="body2" color="text.secondary">Email:</Typography></Grid>
                                    <Grid item xs={8}><Typography variant="body2" fontWeight={700}>{selectedProvider?.email}</Typography></Grid>
                                    <Grid item xs={4}><Typography variant="body2" color="text.secondary">Reason:</Typography></Grid>
                                    <Grid item xs={8}>
                                        <Typography variant="body2" fontWeight={700}>
                                            {removalModal.reason === 'Other' ? removalModal.otherReason : removalModal.reason}
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </Box>

                            <Box sx={{ border: '1px solid #fee2e2', bgcolor: '#fef2f2', p: 2, borderRadius: 3 }}>
                                <Typography variant="subtitle2" color="error.main" fontWeight={800} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                                    <WarningAmber size="small" /> THIS ACTION WILL:
                                </Typography>
                                <Box component="ul" sx={{ m: 0, pl: 2, color: '#991b1b', fontSize: '0.85rem' }}>
                                    <li>Permanently deactivate this expert's account</li>
                                    <li>Cancel all pending service requests</li>
                                    <li>Stop all future salary payments</li>
                                    <li>Send a removal notification email to the expert</li>
                                </Box>
                            </Box>
                        </DialogContent>
                        <DialogActions sx={{ px: 3, pb: 3 }}>
                            <Button onClick={() => setRemovalModal(p => ({ ...p, step: 1 }))} disabled={removalModal.loading}>Cancel</Button>
                            <Button 
                                variant="contained" 
                                color="error" 
                                onClick={handleRemoveExpert}
                                disabled={removalModal.loading}
                                startIcon={removalModal.loading ? <CircularProgress size={16} color="inherit" /> : <Delete />}
                                sx={{ borderRadius: 2.5, px: 3 }}
                            >
                                {removalModal.loading ? 'Removing...' : 'Confirm Removal'}
                            </Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>

            {/* ── Create Expert Modal ── */}
            <Dialog open={modalOpen} onClose={handleModalClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
                <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>
                    Create Expert Account
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 400, mt: 0.5 }}>
                        Experts cannot self-register — only admins can create their accounts.
                    </Typography>
                </DialogTitle>
                <DialogContent sx={{ pt: 1 }}>
                    <Grid container spacing={2} sx={{ mt: 0 }}>
                        {/* Full Name */}
                        <Grid item xs={12}>
                            <TextField label="Full Name *" name="fullName" value={form.fullName} onChange={handleFormChange} error={!!formErrors.fullName} helperText={formErrors.fullName} fullWidth size="small" />
                        </Grid>
                        {/* Email */}
                        <Grid item xs={12}>
                            <TextField label="Email *" name="email" type="email" value={form.email} onChange={handleFormChange} error={!!formErrors.email} helperText={formErrors.email} fullWidth size="small" />
                        </Grid>
                        {/* Password + Confirm */}
                        <Grid item xs={12} sm={6}>
                            <TextField label="Password *" name="password" type="password" value={form.password} onChange={handleFormChange} error={!!formErrors.password} helperText={formErrors.password || 'Min. 8 characters'} fullWidth size="small" />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField label="Confirm Password *" name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleFormChange} error={!!formErrors.confirmPassword} helperText={formErrors.confirmPassword} fullWidth size="small" />
                        </Grid>
                        {/* Phone */}
                        <Grid item xs={12}>
                            <TextField label="Phone Number" name="phone" value={form.phone} onChange={handleFormChange} fullWidth size="small" />
                        </Grid>
                        {/* Specialization */}
                        <Grid item xs={12}>
                            <TextField label="Specialization" name="specialization" placeholder="e.g. Hydraulics, CNC, Motors" value={form.specialization} onChange={handleFormChange} fullWidth size="small" />
                        </Grid>
                        {/* Machine Types */}
                        <Grid item xs={12}>
                            <TextField label="Machine Types" name="machineTypes" placeholder="e.g. CNC, Hydraulic Press, Motors, Generators" value={form.machineTypes} onChange={handleFormChange} fullWidth size="small" helperText="Comma-separated list" />
                        </Grid>
                        {/* Service City */}
                        <Grid item xs={12} sm={6}>
                            <TextField label="Service City *" name="serviceCity" placeholder="e.g. Mumbai, Pune, Chennai" value={form.serviceCity} onChange={handleFormChange} error={!!formErrors.serviceCity} helperText={formErrors.serviceCity} fullWidth size="small" />
                        </Grid>
                        {/* Years of Experience */}
                        <Grid item xs={12} sm={6}>
                            <TextField label="Years of Experience" name="yearsOfExperience" type="number" inputProps={{ min: 0, max: 60 }} value={form.yearsOfExperience} onChange={handleFormChange} fullWidth size="small" />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField label="Qualification (optional)" name="qualification" placeholder="e.g. ITI, Diploma, B.Tech, OEM Certified" value={form.qualification} onChange={handleFormChange} fullWidth size="small" />
                        </Grid>

                        <Grid item xs={12}>
                            <Divider sx={{ my: 1 }}><Chip label="BANK DETAILS" size="small" sx={{ fontSize: '0.6rem', fontWeight: 900 }} /></Divider>
                        </Grid>

                        <Grid item xs={12}>
                            <TextField label="Account Holder Name" name="accountHolderName" value={form.accountHolderName} onChange={handleFormChange} fullWidth size="small" />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField label="Bank Account Number" name="bankAccountNumber" value={form.bankAccountNumber} onChange={handleFormChange} fullWidth size="small" />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField label="IFSC Code" name="ifscCode" value={form.ifscCode} onChange={handleFormChange} fullWidth size="small" />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
                    <Button onClick={handleModalClose} disabled={submitting}>Cancel</Button>
                    <Button
                        variant="contained"
                        color="success"
                        onClick={handleSubmit}
                        disabled={submitting}
                        startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : <PersonAdd />}
                        sx={{ borderRadius: 2.5, px: 3 }}
                    >
                        {submitting ? 'Creating…' : 'Create Expert'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ── Credentials Summary Modal ── */}
            <Dialog open={credsModal.open} onClose={() => setCredsModal(p => ({ ...p, open: false }))} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
                <DialogTitle sx={{ fontWeight: 800, pb: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CheckCircle color="success" />
                        Expert Account Created
                    </Box>
                </DialogTitle>
                <DialogContent sx={{ pt: 2 }}>
                    <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : '#f8fafc', border: `1px solid ${theme.palette.divider}`, mb: 2 }}>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                            <strong>Name:</strong> {credsModal.name}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                            <strong>Email:</strong> {credsModal.email}
                        </Typography>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                            <strong>Password:</strong> {credsModal.password}
                        </Typography>
                    </Paper>
                    <Alert severity={credsModal.emailSent ? 'success' : 'warning'} sx={{ borderRadius: 2, fontSize: '0.8rem' }}>
                        {credsModal.emailSent
                            ? `A welcome email has been sent to ${credsModal.email}`
                            : 'Account created but email could not be sent. Please share credentials manually.'}
                    </Alert>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
                    <Button startIcon={<ContentCopy />} onClick={handleCopyCredentials} variant="outlined" sx={{ borderRadius: 2.5 }}>
                        Copy Credentials
                    </Button>
                    <Button variant="contained" onClick={() => setCredsModal(p => ({ ...p, open: false }))} sx={{ borderRadius: 2.5 }}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={toast.open} autoHideDuration={4000} onClose={() => setToast({ ...toast, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                <Alert severity={toast.severity} variant="filled" sx={{ width: '100%', borderRadius: 3 }}>
                    {toast.message}
                </Alert>
            </Snackbar>

            {/* ── Detailed Performance Profile Modal ── */}
            <Dialog 
                open={profileModalOpen} 
                onClose={() => setProfileModalOpen(false)} 
                maxWidth="md" 
                fullWidth 
                PaperProps={{ sx: { borderRadius: 4, bgcolor: theme.palette.mode === 'dark' ? '#0f172a' : '#f8fafc' } }}
            >
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ width: 48, height: 48 }}>{selectedProvider?.name?.charAt(0)}</Avatar>
                        <Box>
                            <Typography variant="h6" sx={{ fontWeight: 800 }}>{selectedProvider?.name}</Typography>
                            <Typography variant="body2" color="text.secondary">{selectedProvider?.email}</Typography>
                        </Box>
                    </Box>
                    <Chip 
                        label={selectedProvider?.status?.toUpperCase()} 
                        color={getStatusColor(selectedProvider?.status)}
                        size="small"
                        sx={{ fontWeight: 900, borderRadius: 1.5 }}
                    />
                </DialogTitle>
                <DialogContent sx={{ p: 3 }}>
                    {fetchingDetails ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 10, gap: 2 }}>
                            <CircularProgress size={32} />
                            <Typography variant="body2" color="text.secondary">Fetching performance audit...</Typography>
                        </Box>
                    ) : providerDetails ? (
                        <Grid container spacing={3}>
                            {/* Stats Summary Row */}
                            <Grid item xs={12}>
                                <Paper elevation={0} sx={{ p: 3, borderRadius: 4, display: 'flex', justifyContent: 'space-around', bgcolor: 'background.paper', border: `1px solid ${theme.palette.divider}` }}>
                                    <Box sx={{ textAlign: 'center' }}>
                                        <Typography variant="caption" color="text.secondary" fontWeight={800} sx={{ textTransform: 'uppercase', mb: 1, display: 'block' }}>Current Level</Typography>
                                        <Typography variant="h5" color="primary" fontWeight={900}>{providerDetails.level}</Typography>
                                    </Box>
                                    <Divider orientation="vertical" flexItem />
                                    <Box sx={{ textAlign: 'center' }}>
                                        <Typography variant="caption" color="text.secondary" fontWeight={800} sx={{ textTransform: 'uppercase', mb: 1, display: 'block' }}>Performance Points</Typography>
                                        <Typography variant="h5" fontWeight={900}>{providerDetails.points} XP</Typography>
                                    </Box>
                                    <Divider orientation="vertical" flexItem />
                                    <Box sx={{ textAlign: 'center' }}>
                                        <Typography variant="caption" color="text.secondary" fontWeight={800} sx={{ textTransform: 'uppercase', mb: 1, display: 'block' }}>Success Rate</Typography>
                                        <Typography variant="h5" color="success.main" fontWeight={900}>{providerDetails.acceptanceRate}</Typography>
                                    </Box>
                                    <Divider orientation="vertical" flexItem />
                                    <Box sx={{ textAlign: 'center' }}>
                                        <Typography variant="caption" color="text.secondary" fontWeight={800} sx={{ textTransform: 'uppercase', mb: 1, display: 'block' }}>Expert Rating</Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                                            <Star sx={{ color: '#f59e0b', fontSize: 28 }} />
                                            <Typography variant="h5" fontWeight={900}>{providerDetails.rating}</Typography>
                                        </Box>
                                    </Box>
                                </Paper>
                            </Grid>

                            {/* Detailed Metrics */}
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <TrendingUp fontSize="small" color="primary" /> PERFORMANCE METRICS
                                </Typography>
                                <Paper elevation={0} sx={{ p: 0, borderRadius: 3, border: `1px solid ${theme.palette.divider}`, overflow: 'hidden' }}>
                                    <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${theme.palette.divider}` }}>
                                        <Typography variant="body2" color="text.secondary">Avg. Service Completion</Typography>
                                        <Typography variant="body2" fontWeight={700}>{providerDetails.avgCompletionTime || '0 hrs'}</Typography>
                                    </Box>
                                    <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="body2" color="text.secondary">Total Jobs Handled</Typography>
                                        <Typography variant="body2" fontWeight={700}>{providerDetails.jobsCompleted || 0}</Typography>
                                    </Box>
                                </Paper>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <AccountBalanceWallet fontSize="small" color="success" /> BANK ACCOUNT & FINANCIALS
                                </Typography>
                                <Paper elevation={0} sx={{ p: 0, borderRadius: 3, border: `1px solid ${theme.palette.divider}`, overflow: 'hidden' }}>
                                    <Box sx={{ p: 2, bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                            <Typography variant="caption" color="text.secondary" fontWeight={700}>BANK DETAILS</Typography>
                                            {providerDetails.bankAccountStatus === 'VERIFIED' ? (
                                                <Chip label="VERIFIED" size="small" color="success" variant="filled" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 900 }} />
                                            ) : (
                                                <Chip label="NOT PROVIDED" size="small" color="error" variant="filled" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 900 }} />
                                            )}
                                        </Box>
                                        {providerDetails.bankAccountStatus === 'VERIFIED' ? (
                                            <>
                                                <Typography variant="body2" fontWeight={600}>{selectedProvider?.accountHolderName || 'N/A'}</Typography>
                                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                                    {selectedProvider?.bankAccountNumber?.replace(/\d(?=\d{4})/g, "*")} • {selectedProvider?.ifscCode}
                                                </Typography>
                                                <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 700 }}>Verified Commercial Account</Typography>
                                            </>
                                        ) : (
                                            <Alert severity="warning" icon={false} sx={{ py: 0, px: 1, '& .MuiAlert-message': { p: 0.5, fontSize: '0.75rem', fontWeight: 700 } }}>
                                                Salary on Hold — Details Required
                                            </Alert>
                                        )}
                                    </Box>
                                    <Divider />
                                    <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${theme.palette.divider}` }}>
                                        <Typography variant="body2" color="text.secondary">Monthly Base Salary</Typography>
                                        <Typography variant="body2" fontWeight={700} color="primary">₹{providerDetails.salary?.toLocaleString()}</Typography>
                                    </Box>
                                    <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="body2" color="text.secondary">Lifetime Earnings</Typography>
                                        <Typography variant="body2" fontWeight={700}>₹{providerDetails.lifetimeEarnings?.toLocaleString() || 0}</Typography>
                                    </Box>
                                </Paper>
                            </Grid>

                            {/* Points Audit Trail */}
                            <Grid item xs={12}>
                                <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <History fontSize="small" /> RECENT PERFORMANCE EVENTS
                                </Typography>
                                <Paper elevation={0} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}`, overflow: 'hidden' }}>
                                    {providerDetails.recentPointEvents?.length > 0 ? (
                                        <Box>
                                            {providerDetails.recentPointEvents.map((event, i) => (
                                                <Box key={i} sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: i === providerDetails.recentPointEvents.length - 1 ? 'none' : `1px solid ${theme.palette.divider}` }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                        <Box sx={{ width: 32, height: 32, borderRadius: '50%', bgcolor: event.points_change > 0 ? 'success.light' : 'error.light', display: 'flex', alignItems: 'center', justifyContent: 'center', color: event.points_change > 0 ? 'success.main' : 'error.main' }}>
                                                            {event.points_change > 0 ? <DoneAll sx={{ fontSize: 18 }} /> : <Cancel sx={{ fontSize: 18 }} />}
                                                        </Box>
                                                        <Box>
                                                            <Typography variant="body2" fontWeight={700}>{event.reason}</Typography>
                                                            <Typography variant="caption" color="text.secondary">{new Date(event.created_at).toLocaleString()}</Typography>
                                                        </Box>
                                                    </Box>
                                                    <Typography variant="body2" fontWeight={900} color={event.points_change > 0 ? 'success.main' : 'error.main'}>
                                                        {event.points_change > 0 ? '+' : ''}{event.points_change} pts
                                                    </Typography>
                                                </Box>
                                            ))}
                                        </Box>
                                    ) : (
                                        <Box sx={{ p: 4, textAlign: 'center' }}>
                                            <Typography variant="body2" color="text.secondary">No recent performance events found.</Typography>
                                        </Box>
                                    )}
                                </Paper>
                            </Grid>
                        </Grid>
                    ) : (
                        <Box sx={{ py: 10, textAlign: 'center' }}>
                            <Typography variant="body2" color="text.secondary">Could not load details.</Typography>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setProfileModalOpen(false)} variant="outlined" sx={{ borderRadius: 2.5 }}>Close Profile</Button>
                    <Button 
                        variant="contained" 
                        color="primary" 
                        startIcon={<Payments />} 
                        sx={{ borderRadius: 2.5 }}
                        onClick={() => {
                            setProfileModalOpen(false);
                            handleReleaseSalary(selectedProvider);
                        }}
                    >
                        Release Salary
                    </Button>
                </DialogActions>
            </Dialog>
            {/* ── Release Salary Modal ── */}
            <Dialog open={salaryModal.open} onClose={() => !salaryModal.loading && setSalaryModal(p => ({ ...p, open: false }))} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
                <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>Release Monthly Salary</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Box sx={{ p: 2, borderRadius: 3, bgcolor: 'action.hover', border: `1px solid ${theme.palette.divider}` }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                <Avatar sx={{ width: 40, height: 40 }}>{selectedProvider?.name?.charAt(0)}</Avatar>
                                <Box>
                                    <Typography variant="subtitle2" fontWeight={800}>{selectedProvider?.name}</Typography>
                                    <Typography variant="caption" color="text.secondary">{selectedProvider?.email}</Typography>
                                </Box>
                            </Box>
                            <Divider sx={{ mb: 2 }} />
                            <Grid container spacing={1.5}>
                                <Grid item xs={6}>
                                    <Typography variant="caption" color="text.secondary" display="block">CURRENT LEVEL</Typography>
                                    <Typography variant="body2" fontWeight={700} color="primary">{selectedProvider?.level}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="caption" color="text.secondary" display="block">SALARY AMOUNT</Typography>
                                    <Typography variant="body2" fontWeight={700}>₹{selectedProvider?.levelSalary?.toLocaleString()}</Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="caption" color="text.secondary" display="block">BANK ACCOUNT</Typography>
                                    {selectedProvider?.bankAccountNumber ? (
                                        <Typography variant="body2" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            {selectedProvider.bankAccountNumber.replace(/\d(?=\d{4})/g, "*")}
                                            <CheckCircle color="success" sx={{ fontSize: 14 }} />
                                        </Typography>
                                    ) : (
                                        <Typography variant="body2" fontWeight={700} color="error">Not provided</Typography>
                                    )}
                                </Grid>
                            </Grid>
                        </Box>

                        {!selectedProvider?.bankAccountNumber ? (
                            <Alert severity="error" sx={{ borderRadius: 3 }}>
                                <Typography variant="body2" fontWeight={700}>This expert has not added bank details yet. Salary cannot be released.</Typography>
                            </Alert>
                        ) : selectedProvider?.status !== 'approved' ? (
                            <Alert severity="warning" sx={{ borderRadius: 3 }}>
                                <Typography variant="body2" fontWeight={700}>Expert status is {selectedProvider?.status?.toUpperCase()}. Salary can only be released for APPROVED experts.</Typography>
                            </Alert>
                        ) : selectedProvider?.levelSalary <= 0 ? (
                            <Alert severity="info" sx={{ borderRadius: 3 }}>
                                <Typography variant="body2" fontWeight={700}>Starter level experts do not receive a base salary. Encourage them to reach Bronze level.</Typography>
                            </Alert>
                        ) : (
                            <Typography variant="body2" sx={{ textAlign: 'center', color: 'text.secondary', px: 2 }}>
                                Confirm release of <strong>₹{selectedProvider?.levelSalary?.toLocaleString()}</strong> to the verified bank account above?
                            </Typography>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
                    <Button onClick={() => setSalaryModal(p => ({ ...p, open: false }))} disabled={salaryModal.loading}>Cancel</Button>
                    {!selectedProvider?.bankAccountNumber ? (
                        <Button 
                            variant="contained" 
                            color="primary" 
                            sx={{ borderRadius: 2.5 }}
                            onClick={() => {
                                // Logic to "remind" would go here
                                setSalaryModal(p => ({ ...p, open: false }));
                                setToast({ open: true, message: 'Expert will be notified to update bank details.', severity: 'info' });
                            }}
                        >
                            Ask Expert to Update Bank Details
                        </Button>
                    ) : (
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={confirmSalaryRelease}
                            disabled={salaryModal.loading || selectedProvider?.status !== 'approved' || selectedProvider?.levelSalary <= 0}
                            startIcon={salaryModal.loading ? <CircularProgress size={16} color="inherit" /> : <Payments />}
                            sx={{ borderRadius: 2.5, px: 3 }}
                        >
                            {salaryModal.loading ? 'Releasing...' : 'Release Salary'}
                        </Button>
                    )}
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Providers;
