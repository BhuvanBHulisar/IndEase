import api from '../services/api';
import React, { useState, useEffect, useCallback } from 'react';
import { socket } from '../utils/socket';
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
    Divider,
    CircularProgress,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Snackbar,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Tabs,
    Tab
} from '@mui/material';
import {
    Search,
    FilterAlt,
    GetApp,
    CheckCircle,
    Schedule,
    ReceiptLong,
    ArrowUpward,
    LockOpen,
    AccountBalanceWallet
} from '@mui/icons-material';

const Payments = () => {
    const [loading, setLoading] = useState(true);
    const [payments, setPayments] = useState([]);
    const [metrics, setMetrics] = useState(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [search, setSearch] = useState('');
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
    const [releaseDialog, setReleaseDialog] = useState({ open: false, txnId: null });
    const [releasing, setReleasing] = useState(false);
    const [activeTab, setActiveTab] = useState(0);
    const [salaryPayments, setSalaryPayments] = useState([]);
    const theme = useTheme();

    const fetchPayments = useCallback(async () => {
        setLoading(true);
        try {
            const [paymentsRes, salaryRes] = await Promise.all([
                api.get('/admin/payments'),
                api.get('/admin/payments/salary')
            ]);
            setPayments(paymentsRes.data);
            setSalaryPayments(salaryRes.data || []);
        } catch (err) {
            setPayments([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchMetrics = useCallback(async () => {
        try {
            const response = await api.get('/admin/dashboard/metrics');
            setMetrics(response.data);
        } catch (err) {
            // silently fail — cards will show 0
        }
    }, []);

    useEffect(() => {
        fetchPayments();
        fetchMetrics();

        // Real-time socket listener for payment updates
        const handlePaymentUpdate = () => {
            fetchPayments();
            fetchMetrics();
        };

        socket.on('payment_update', handlePaymentUpdate);

        return () => {
            socket.off('payment_update', handlePaymentUpdate);
        };
    }, [fetchPayments, fetchMetrics]);

    const handleRelease = async () => {
        if (!releaseDialog.txnId) return;
        setReleasing(true);
        try {
            await api.patch(`/admin/payments/release/${releaseDialog.txnId}`);
            setSnackbar({ open: true, message: 'Escrow released — funds dispatched to expert', severity: 'success' });
            fetchPayments();
            fetchMetrics();
        } catch (err) {
            setSnackbar({ open: true, message: err.response?.data?.error || 'Failed to release escrow', severity: 'error' });
        } finally {
            setReleasing(false);
            setReleaseDialog({ open: false, txnId: null });
        }
    };

    const handleChangePage = (event, newPage) => setPage(newPage);
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const getStatusChip = (status) => {
        switch (status) {
            case 'escrow':
                return <Chip label="Pending" size="small" sx={{ fontWeight: 800, px: 0.5, borderRadius: 1.5, fontSize: '0.65rem', bgcolor: '#fef3c7', color: '#92400e' }} />;
            case 'completed':
                return <Chip label="Completed" size="small" color="success" sx={{ fontWeight: 800, px: 0.5, borderRadius: 1.5, fontSize: '0.65rem' }} />;
            case 'paid':
                return <Chip label="Paid" size="small" color="success" sx={{ fontWeight: 800, px: 0.5, borderRadius: 1.5, fontSize: '0.65rem' }} />;
            case 'pending':
                return <Chip label="Pending" size="small" color="warning" sx={{ fontWeight: 800, px: 0.5, borderRadius: 1.5, fontSize: '0.65rem' }} />;
            case 'failed':
                return <Chip label="Failed" size="small" color="error" sx={{ fontWeight: 800, px: 0.5, borderRadius: 1.5, fontSize: '0.65rem' }} />;
            default:
                return <Chip label={(status || 'Unknown').charAt(0).toUpperCase() + (status || 'unknown').slice(1)} size="small" sx={{ fontWeight: 800, px: 0.5, borderRadius: 1.5, fontSize: '0.65rem' }} />;
        }
    };

    const filteredPayments = payments.filter(p =>
        `TXN-${String(p.id).padStart(3, '0')}`.toLowerCase().includes(search.toLowerCase()) ||
        (p.consumer_name || p.consumer || '').toLowerCase().includes(search.toLowerCase()) ||
        (p.expert_name || p.provider || '').toLowerCase().includes(search.toLowerCase())
    );

    // Compute stat card values from server metrics or fallback to local computation
    const liveInflow = metrics?.total_revenue ?? payments.reduce((a, b) => a + (b.base_amount || b.total_amount || 0), 0);
    const netCommission = metrics?.platform_earnings ?? payments.reduce((a, b) => a + (b.platform_fee || 0), 0);
    const pendingEscrow = metrics?.pending_escrow ?? payments.filter(p => p.status === 'escrow').reduce((a, b) => a + (b.expert_amount || 0), 0);

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 800 }}>Payments</Typography>
                    <Typography variant="body2" color="text.secondary">Escrow payment audit trail — commission, GST, and expert payouts</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1.5 }}>
                    <Button variant="outlined" startIcon={<FilterAlt />}>Advanced Filter</Button>
                    <Button variant="contained" startIcon={<GetApp />} sx={{ borderRadius: 2.5, px: 2 }}>Export CSV</Button>
                </Box>
            </Box>

            {/* ─── Stat Cards ─── */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={4}>
                    <Paper elevation={0} sx={{ p: 2.5, borderRadius: 4, display: 'flex', alignItems: 'center', gap: 2, border: `1px solid ${theme.palette.divider}` }}>
                        <Avatar sx={{ bgcolor: 'success.light', color: 'success.dark' }}><ArrowUpward /></Avatar>
                        <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>LIVE INFLOW</Typography>
                            <Typography variant="h5" sx={{ fontWeight: 800 }}>₹{Number(liveInflow).toLocaleString()}</Typography>
                        </Box>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={4}>
                    <Paper elevation={0} sx={{ p: 2.5, borderRadius: 4, display: 'flex', alignItems: 'center', gap: 2, border: `1px solid ${theme.palette.divider}` }}>
                        <Avatar sx={{ bgcolor: 'secondary.light', color: 'secondary.dark' }}><ReceiptLong /></Avatar>
                        <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>NET COMMISSION</Typography>
                            <Typography variant="h5" sx={{ fontWeight: 800 }}>₹{Number(netCommission).toLocaleString()}</Typography>
                        </Box>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={4}>
                    <Paper elevation={0} sx={{ p: 2.5, borderRadius: 4, display: 'flex', alignItems: 'center', gap: 2, border: `1px solid ${theme.palette.divider}` }}>
                        <Avatar sx={{ bgcolor: 'warning.light', color: 'warning.dark' }}><Schedule /></Avatar>
                        <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>PENDING ESCROW</Typography>
                            <Typography variant="h5" sx={{ fontWeight: 800 }}>₹{Number(pendingEscrow).toLocaleString()}</Typography>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>

            {/* ─── Transaction Table ─── */}
            <Paper
                elevation={0}
                sx={{
                    borderRadius: 4,
                    border: `1px solid ${theme.palette.divider}`,
                    overflow: 'hidden'
                }}
            >
                <Box sx={{ p: 2.5, bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)' }}>
                    <TextField
                        size="small"
                        placeholder="Search by Transaction ID, Consumer, or Expert..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        sx={{ width: 420 }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Search sx={{ fontSize: 20, color: 'text.secondary' }} />
                                </InputAdornment>
                            ),
                            sx: { borderRadius: 2.5, bgcolor: 'background.paper' }
                        }}
                    />
                </Box>

                <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ px: 2.5, borderBottom: `1px solid ${theme.palette.divider}`, bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)' }}>
                    <Tab label="Job Payments" sx={{ fontWeight: 700 }} />
                    <Tab label="Salary Payments" sx={{ fontWeight: 700 }} />
                </Tabs>

                <TableContainer sx={{ minHeight: 400 }}>
                    <Table stickyHeader>
                        {activeTab === 0 ? (
                            <>
                                <TableHead>
                                    <TableRow>
                                        {['TXN ID', 'Consumer / Expert', 'Base Amount', 'Platform Fee', 'GST', 'Expert Payout', 'Status', 'Date', 'Action'].map((col) => (
                                            <TableCell key={col} sx={{ fontWeight: 800, bgcolor: theme.palette.mode === 'dark' ? '#1e293b' : '#f8fafc' }}>
                                                {col}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={9} align="center" sx={{ py: 5 }}>
                                                <CircularProgress />
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        <>
                                            {filteredPayments.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((txn) => (
                                                <TableRow key={txn.id} hover>
                                                    <TableCell>
                                                        <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main', opacity: 0.9, fontFamily: 'monospace', fontSize: '0.75rem' }}>
                                                            TXN-{String(txn.id).padStart(3, '0')}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                            {txn.consumer_name || txn.consumer || 'Deleted User'} → {txn.expert_name || txn.provider || 'Not Assigned'}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="body2" sx={{ fontWeight: 700 }}>₹{(txn.base_amount || txn.total_amount || 0).toLocaleString()}</Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 600 }}>+₹{(txn.platform_fee || 0).toLocaleString()}</Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="body2" color="text.secondary">₹{(txn.tax || txn.gst_amount || 0).toLocaleString()}</Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>₹{(txn.expert_amount || 0).toLocaleString()}</Typography>
                                                    </TableCell>
                                                    <TableCell>{getStatusChip(txn.status)}</TableCell>
                                                    <TableCell>
                                                        <Typography variant="caption">{txn.created_at ? new Date(txn.created_at).toLocaleString() : '—'}</Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        {txn.status === 'escrow' && (
                                                            <Tooltip title="Release escrow to expert">
                                                                <IconButton
                                                                    size="small"
                                                                    color="success"
                                                                    onClick={() => setReleaseDialog({ open: true, txnId: txn.id })}
                                                                    sx={{
                                                                        bgcolor: 'success.light',
                                                                        '&:hover': { bgcolor: 'success.main', color: '#fff' }
                                                                    }}
                                                                >
                                                                    <LockOpen fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>
                                                        )}
                                                        {txn.status === 'completed' && (
                                                            <Tooltip title="Funds released">
                                                                <CheckCircle fontSize="small" sx={{ color: 'success.main', opacity: 0.6 }} />
                                                            </Tooltip>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </>
                                    )}
                                </TableBody>
                            </>
                        ) : (
                            <>
                                <TableHead>
                                    <TableRow>
                                        {['TXN ID', 'Expert Name', 'Level', 'Amount', 'Date', 'Status'].map((col) => (
                                            <TableCell key={col} sx={{ fontWeight: 800, bgcolor: theme.palette.mode === 'dark' ? '#1e293b' : '#f8fafc' }}>
                                                {col}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={6} align="center" sx={{ py: 5 }}><CircularProgress /></TableCell>
                                        </TableRow>
                                    ) : (
                                        <>
                                            {salaryPayments.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((txn) => (
                                                <TableRow key={txn.id} hover>
                                                    <TableCell>
                                                        <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main', fontFamily: 'monospace', fontSize: '0.75rem' }}>
                                                            SAL-{String(txn.id).padStart(3, '0')}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{txn.expert_name}</Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip label={txn.level} size="small" variant="outlined" sx={{ fontWeight: 800, fontSize: '0.65rem' }} />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="body2" sx={{ fontWeight: 700, color: 'success.main' }}>₹{Number(txn.amount).toLocaleString()}</Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="caption">{new Date(txn.date).toLocaleString()}</Typography>
                                                    </TableCell>
                                                    <TableCell>{getStatusChip(txn.status)}</TableCell>
                                                </TableRow>
                                            ))}
                                            {salaryPayments.length === 0 && (
                                                <TableRow>
                                                    <TableCell colSpan={6} align="center" sx={{ py: 5, color: 'text.secondary' }}>No salary releases recorded yet.</TableCell>
                                                </TableRow>
                                            )}
                                        </>
                                    )}
                                </TableBody>
                            </>
                        )}
                    </Table>
                </TableContainer>

                <TablePagination
                    rowsPerPageOptions={[10, 25, 50]}
                    component="div"
                    count={activeTab === 0 ? filteredPayments.length : salaryPayments.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    sx={{ borderTop: `1px solid ${theme.palette.divider}` }}
                />
            </Paper>

            {/* ─── Release Confirmation Dialog ─── */}
            <Dialog open={releaseDialog.open} onClose={() => setReleaseDialog({ open: false, txnId: null })}>
                <DialogTitle sx={{ fontWeight: 700 }}>Release Escrow Funds</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        This action will release the held funds to the expert's account and mark the transaction as <strong>completed</strong>. This cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setReleaseDialog({ open: false, txnId: null })} disabled={releasing}>
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        color="success"
                        onClick={handleRelease}
                        disabled={releasing}
                        startIcon={releasing ? <CircularProgress size={16} color="inherit" /> : <AccountBalanceWallet />}
                    >
                        {releasing ? 'Releasing…' : 'Confirm Release'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ─── Snackbar ─── */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert severity={snackbar.severity} variant="filled" sx={{ width: '100%', borderRadius: 3 }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default Payments;
