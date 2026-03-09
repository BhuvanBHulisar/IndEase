import api from '../services/api';
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
    Divider,
    Menu,
    MenuItem,
    CircularProgress,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination
} from '@mui/material';
import {
    Search,
    FilterAlt,
    GetApp,
    MonetizationOn,
    AccountBalance,
    History,
    CheckCircle,
    Error,
    Schedule,
    Payments as PaymentsIcon,
    ReceiptLong,
    ArrowUpward,
    ArrowDownward
} from '@mui/icons-material';
import adminApi from '../api/adminApi';

const Payments = () => {
    const [loading, setLoading] = useState(true);
    const [payments, setPayments] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [search, setSearch] = useState('');
    const theme = useTheme();

    const fetchPayments = async () => {
        setLoading(true);
        try {
            const response = await api.get('/payments');
            console.log('Payments API response:', response.data);
            setPayments(response.data);
        } catch (err) {
            console.error('Error fetching payments:', err);
            setPayments([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayments();
    }, []);

    const handleChangePage = (event, newPage) => setPage(newPage);
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const getStatusChip = (status) => {
        switch (status) {
            case 'paid': return <Chip label="SUCCESS" size="small" color="success" sx={{ fontWeight: 800, px: 0.5, borderRadius: 1.5, fontSize: '0.65rem' }} />;
            case 'pending': return <Chip label="PENDING" size="small" color="warning" sx={{ fontWeight: 800, px: 0.5, borderRadius: 1.5, fontSize: '0.65rem' }} />;
            case 'failed': return <Chip label="FAILED" size="small" color="error" sx={{ fontWeight: 800, px: 0.5, borderRadius: 1.5, fontSize: '0.65rem' }} />;
            default: return <Chip label={status.toUpperCase()} size="small" sx={{ fontWeight: 800, px: 0.5, borderRadius: 1.5, fontSize: '0.65rem' }} />;
        }
    };

    const filteredPayments = payments.filter(p =>
        (p.id || '').toLowerCase().includes(search.toLowerCase()) ||
        (p.consumer || '').toLowerCase().includes(search.toLowerCase())
    );

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 800 }}>Financial Ledger</Typography>
                    <Typography variant="body2" color="text.secondary">Detailed audit trail of all marketplace transactions and tax liabilities</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1.5 }}>
                    <Button variant="outlined" startIcon={<FilterAlt />}>Advanced Filter</Button>
                    <Button variant="contained" startIcon={<GetApp />} sx={{ borderRadius: 2.5, px: 2 }}>Export CSV</Button>
                </Box>
            </Box>

            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={4}>
                    <Paper elevation={0} sx={{ p: 2.5, borderRadius: 4, display: 'flex', alignItems: 'center', gap: 2, border: `1px solid ${theme.palette.divider}` }}>
                        <Avatar sx={{ bgcolor: 'success.light', color: 'success.dark' }}><ArrowUpward /></Avatar>
                        <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>LIVE INFLOW</Typography>
                            <Typography variant="h5" sx={{ fontWeight: 800 }}>₹{payments.filter(p => p.status === 'paid').reduce((a, b) => a + b.amount, 0).toLocaleString()}</Typography>
                        </Box>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={4}>
                    <Paper elevation={0} sx={{ p: 2.5, borderRadius: 4, display: 'flex', alignItems: 'center', gap: 2, border: `1px solid ${theme.palette.divider}` }}>
                        <Avatar sx={{ bgcolor: 'secondary.light', color: 'secondary.dark' }}><ReceiptLong /></Avatar>
                        <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>NET COMMISSION</Typography>
                            <Typography variant="h5" sx={{ fontWeight: 800 }}>₹{payments.filter(p => p.status === 'paid').reduce((a, b) => a + (b.commission || 0), 0).toLocaleString()}</Typography>
                        </Box>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={4}>
                    <Paper elevation={0} sx={{ p: 2.5, borderRadius: 4, display: 'flex', alignItems: 'center', gap: 2, border: `1px solid ${theme.palette.divider}` }}>
                        <Avatar sx={{ bgcolor: 'warning.light', color: 'warning.dark' }}><Schedule /></Avatar>
                        <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>PENDING ESCROW</Typography>
                            <Typography variant="h5" sx={{ fontWeight: 800 }}>₹{payments.filter(p => p.status === 'pending').reduce((a, b) => a + b.amount, 0).toLocaleString()}</Typography>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>

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
                        placeholder="Search by Transaction ID or Email..."
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
                </Box>

                <TableContainer sx={{ minHeight: 400 }}>
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 800, bgcolor: theme.palette.mode === 'dark' ? '#1e293b' : '#f8fafc' }}>TXN ID</TableCell>
                                <TableCell sx={{ fontWeight: 800, bgcolor: theme.palette.mode === 'dark' ? '#1e293b' : '#f8fafc' }}>Consumer / Provider</TableCell>
                                <TableCell sx={{ fontWeight: 800, bgcolor: theme.palette.mode === 'dark' ? '#1e293b' : '#f8fafc' }}>Base Amount</TableCell>
                                <TableCell sx={{ fontWeight: 800, bgcolor: theme.palette.mode === 'dark' ? '#1e293b' : '#f8fafc' }}>Platform Fee</TableCell>
                                <TableCell sx={{ fontWeight: 800, bgcolor: theme.palette.mode === 'dark' ? '#1e293b' : '#f8fafc' }}>Tax (%)</TableCell>
                                <TableCell sx={{ fontWeight: 800, bgcolor: theme.palette.mode === 'dark' ? '#1e293b' : '#f8fafc' }}>Status</TableCell>
                                <TableCell sx={{ fontWeight: 800, bgcolor: theme.palette.mode === 'dark' ? '#1e293b' : '#f8fafc' }}>Date</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={7} align="center" sx={{ py: 5 }}><CircularProgress /></TableCell></TableRow>
                            ) : filteredPayments.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((txn) => (
                                <TableRow key={txn.id} hover>
                                    <TableCell><Typography variant="body2" sx={{ fontWeight: 700, opacity: 0.6 }}>{txn.id}</Typography></TableCell>
                                    <TableCell>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{txn.consumer?.split('@')[0]}</Typography>
                                        <Typography variant="caption" color="text.secondary">→ {txn.producer?.split('@')[0] || 'Unassigned'}</Typography>
                                    </TableCell>
                                    <TableCell><Typography variant="body2" sx={{ fontWeight: 700 }}>₹{txn.amount?.toLocaleString()}</Typography></TableCell>
                                    <TableCell><Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 600 }}>+₹{txn.commission || 0}</Typography></TableCell>
                                    <TableCell><Typography variant="body2" color="text.secondary">GST (₹{txn.gst || 0})</Typography></TableCell>
                                    <TableCell>{getStatusChip(txn.status)}</TableCell>
                                    <TableCell><Typography variant="caption">{new Date(txn.created_at).toLocaleString()}</Typography></TableCell>
                                </TableRow>
                            ))}
                            {filteredPayments.length === 0 && !loading && (
                                <TableRow><TableCell colSpan={7} align="center" sx={{ py: 5, color: 'text.secondary' }}>No transactions found for the current filter.</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                <TablePagination
                    rowsPerPageOptions={[10, 25, 50]}
                    component="div"
                    count={filteredPayments.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    sx={{ borderTop: `1px solid ${theme.palette.divider}` }}
                />
            </Paper>
        </Box>
    );
};

export default Payments;
