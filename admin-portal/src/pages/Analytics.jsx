import React, { useState, useEffect, useCallback } from 'react';
import {
    Box, Typography, Paper, Grid, useTheme,
    Button, CircularProgress, Avatar, Chip,
    Table, TableBody, TableCell, TableHead, TableRow
} from '@mui/material';
import {
    Group, Engineering, Work, MonetizationOn,
    GetApp, Timer, TrendingUp
} from '@mui/icons-material';
import {
    AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip,
    ResponsiveContainer, Legend
} from 'recharts';
import api from '../services/api';

const STATUS_COLORS = {
    completed: '#22c55e',
    in_progress: '#f59e0b',
    pending: '#3b82f6',
    broadcast: '#8b5cf6',
    accepted: '#06b6d4',
    cancelled: '#ef4444',
    payment_pending: '#f97316'
};

const StatCard = ({ icon, label, value, color, loading, error, onRetry }) => {
    const theme = useTheme();
    return (
        <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: `1px solid ${theme.palette.divider}`, display: 'flex', alignItems: 'center', gap: 2, height: 96, boxSizing: 'border-box' }}>
            <Avatar sx={{ bgcolor: color + '22', color, width: 48, height: 48 }}>{icon}</Avatar>
            <Box sx={{ flex: 1 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.65rem' }}>{label}</Typography>
                {loading ? (
                    <CircularProgress size={20} sx={{ mt: 0.5, display: 'block' }} />
                ) : error ? (
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 0.5 }}>
                        <Typography color="error" variant="caption">Failed</Typography>
                        <Button size="small" variant="outlined" color="error" onClick={onRetry} sx={{ py: 0, px: 1, minWidth: 0, fontSize: '0.65rem' }}>Retry</Button>
                    </Box>
                ) : (
                    <Typography variant="h5" sx={{ fontWeight: 800, lineHeight: 1.2 }}>{value}</Typography>
                )}
            </Box>
        </Paper>
    );
};

const SectionBox = ({ loading, error, onRetry, children, height = 280 }) => {
    if (loading) return <Box sx={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CircularProgress /></Box>;
    if (error) return (
        <Box sx={{ height, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <Typography color="error" variant="body2" sx={{ mb: 1 }}>Failed to load data</Typography>
            <Button size="small" variant="outlined" onClick={onRetry} color="error">Retry</Button>
        </Box>
    );
    return children;
};

const Analytics = () => {
    const theme = useTheme();

    const [users, setUsers] = useState({ data: [], loading: true, error: null });
    const [providers, setProviders] = useState({ data: [], loading: true, error: null });
    const [jobs, setJobs] = useState({ data: [], loading: true, error: null });
    const [payments, setPayments] = useState({ data: [], loading: true, error: null });

    const fetchEndpoint = async (endpoint, setState) => {
        setState(prev => ({ ...prev, loading: true, error: null }));
        try {
            const res = await api.get(endpoint);
            setState({ data: res.data, loading: false, error: null });
        } catch (err) {
            setState({ data: [], loading: false, error: 'Failed' });
        }
    };

    const loadUsers = useCallback(() => fetchEndpoint('/admin/users', setUsers), []);
    const loadProviders = useCallback(() => fetchEndpoint('/admin/providers', setProviders), []);
    const loadJobs = useCallback(() => fetchEndpoint('/admin/jobs', setJobs), []);
    const loadPayments = useCallback(() => fetchEndpoint('/admin/payments', setPayments), []);

    useEffect(() => {
        loadUsers();
        loadProviders();
        loadJobs();
        loadPayments();
    }, [loadUsers, loadProviders, loadJobs, loadPayments]);

    // Top Stats Derived
    const totalUsers = users.data.length;
    const totalExperts = providers.data.length;
    const totalJobs = jobs.data.length;
    const totalRevenue = payments.data
        .filter(p => ['completed', 'paid'].includes(p.status))
        .reduce((sum, p) => sum + Number(p.total_amount), 0);

    // Jobs By Status (Needs Jobs data)
    const tempStatusCount = { pending: 0, in_progress: 0, completed: 0 };
    jobs.data.forEach(j => {
        if (['pending', 'broadcast'].includes(j.status)) tempStatusCount.pending++;
        else if (['in_progress', 'accepted'].includes(j.status)) tempStatusCount.in_progress++;
        else if (j.status === 'completed') tempStatusCount.completed++;
    });
    const jobsByStatus = [
        { status: 'pending', count: tempStatusCount.pending },
        { status: 'in_progress', count: tempStatusCount.in_progress },
        { status: 'completed', count: tempStatusCount.completed }
    ].filter(j => j.count > 0);

    const pieData = jobsByStatus.map(j => ({
        name: j.status.replace('_', ' ').toUpperCase(),
        value: j.count,
        color: STATUS_COLORS[j.status] || '#94a3b8'
    }));

    // Revenue Over Time (Needs Payments data)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return {
            dateStr: d.toISOString().split('T')[0],
            day: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            revenue: 0
        };
    });
    payments.data.forEach(p => {
        if (!['completed', 'paid', 'escrow'].includes(p.status)) return;
        const dStr = new Date(p.created_at).toISOString().split('T')[0];
        const dayMatch = last7Days.find(d => d.dateStr === dStr);
        if (dayMatch) {
            dayMatch.revenue += Number(p.total_amount);
        }
    });

    // Top Experts Table (Needs Providers + Jobs + Payments data)
    const expertsArray = providers.data.map(p => {
        let expEarnings = 0;
        let expJobs = 0;
        
        expJobs = jobs.data.filter(j => j.status === 'completed' && j.producer === p.name).length;
        
        payments.data.forEach(pay => {
            if (['completed', 'paid'].includes(pay.status) && pay.provider === p.name) {
                expEarnings += Number(pay.expert_amount) || 0;
            }
        });
        
        return {
            id: p.id,
            name: p.name,
            specialization: p.category || 'General',
            jobsCompleted: p.jobsCount || expJobs,
            rating: p.rating,
            totalEarnings: expEarnings
        };
    });
    const topExperts = expertsArray.sort((a, b) => b.jobsCompleted - a.jobsCompleted).slice(0, 5);
    const topExpertsLoading = providers.loading || jobs.loading || payments.loading;
    const topExpertsError = providers.error || jobs.error || payments.error;

    return (
        <Box>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 800 }}>Analytics</Typography>
                    <Typography variant="body2" color="text.secondary">Platform performance overview</Typography>
                </Box>
                <Button variant="contained" startIcon={<GetApp />} sx={{ borderRadius: 2.5 }}>
                    Export Report
                </Button>
            </Box>

            {/* ── Stat Cards ── */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} lg={3}>
                    <StatCard 
                        icon={<Group />} label="Total Consumers" value={totalUsers.toLocaleString()} color="#3b82f6" 
                        loading={users.loading} error={users.error} onRetry={loadUsers} 
                    />
                </Grid>
                <Grid item xs={12} sm={6} lg={3}>
                    <StatCard 
                        icon={<Engineering />} label="Total Experts" value={totalExperts.toLocaleString()} color="#8b5cf6" 
                        loading={providers.loading} error={providers.error} onRetry={loadProviders} 
                    />
                </Grid>
                <Grid item xs={12} sm={6} lg={3}>
                    <StatCard 
                        icon={<Work />} label="Total Jobs" value={totalJobs.toLocaleString()} color="#f59e0b" 
                        loading={jobs.loading} error={jobs.error} onRetry={loadJobs} 
                    />
                </Grid>
                <Grid item xs={12} sm={6} lg={3}>
                    <StatCard 
                        icon={<MonetizationOn />} label="Total Revenue" value={`₹${Number(totalRevenue).toLocaleString()}`} color="#22c55e" 
                        loading={payments.loading} error={payments.error} onRetry={loadPayments} 
                    />
                </Grid>
            </Grid>

            {/* ── Charts Row ── */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {/* Revenue over time */}
                <Grid item xs={12} lg={8}>
                    <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: `1px solid ${theme.palette.divider}` }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>Revenue — Last 7 Days</Typography>
                        <SectionBox loading={payments.loading} error={payments.error} onRetry={loadPayments} height={280}>
                            {payments.data.length === 0 ? (
                                <Box sx={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.4 }}>
                                    <Typography>No transactions in the last 7 days</Typography>
                                </Box>
                            ) : (
                                <Box sx={{ height: 280 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={last7Days}>
                                            <defs>
                                                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
                                            <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                                            <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `₹${v.toLocaleString()}`} />
                                            <ChartTooltip formatter={(v) => [`₹${Number(v).toLocaleString()}`, 'Revenue']} />
                                            <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} fill="url(#revenueGrad)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </Box>
                            )}
                        </SectionBox>
                    </Paper>
                </Grid>

                {/* Jobs by status pie */}
                <Grid item xs={12} lg={4}>
                    <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: `1px solid ${theme.palette.divider}` }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>Jobs by Status</Typography>
                        <SectionBox loading={jobs.loading} error={jobs.error} onRetry={loadJobs} height={280}>
                            {pieData.length === 0 ? (
                                <Box sx={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.4 }}>
                                    <Typography>No jobs yet</Typography>
                                </Box>
                            ) : (
                                <Box sx={{ height: 280 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie data={pieData} cx="50%" cy="45%" innerRadius={55} outerRadius={85} dataKey="value" paddingAngle={3}>
                                                {pieData.map((entry, i) => (
                                                    <Cell key={i} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <ChartTooltip formatter={(v, n) => [v, n]} />
                                            <Legend iconType="circle" iconSize={8} formatter={(v) => <span style={{ fontSize: 11 }}>{v}</span>} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </Box>
                            )}
                        </SectionBox>
                    </Paper>
                </Grid>
            </Grid>

            {/* ── Jobs by Status bar ── */}
            <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: `1px solid ${theme.palette.divider}`, mb: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>Jobs Distribution</Typography>
                <SectionBox loading={jobs.loading} error={jobs.error} onRetry={loadJobs} height={220}>
                    {jobsByStatus.length === 0 ? (
                        <Box sx={{ py: 4, textAlign: 'center', opacity: 0.4 }}><Typography>No data</Typography></Box>
                    ) : (
                        <Box sx={{ height: 220 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={jobsByStatus} barSize={36}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
                                    <XAxis dataKey="status" tick={{ fontSize: 12 }} tickFormatter={v => v.replace('_', ' ').toUpperCase()} />
                                    <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                                    <ChartTooltip formatter={(v) => [v, 'Jobs']} labelFormatter={l => l.replace('_', ' ').toUpperCase()} />
                                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                                        {jobsByStatus.map((entry, i) => (
                                            <Cell key={i} fill={STATUS_COLORS[entry.status] || '#94a3b8'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </Box>
                    )}
                </SectionBox>
            </Paper>

            {/* ── Top Experts table ── */}
            <Paper elevation={0} sx={{ borderRadius: 4, border: `1px solid ${theme.palette.divider}`, overflow: 'hidden' }}>
                <Box sx={{ p: 3, borderBottom: `1px solid ${theme.palette.divider}` }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>Top Experts</Typography>
                </Box>
                <SectionBox loading={topExpertsLoading} error={topExpertsError} onRetry={() => { loadProviders(); loadJobs(); loadPayments(); }} height={200}>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: theme.palette.mode === 'dark' ? '#1e293b' : '#f8fafc' }}>
                                {['Name', 'Specialization', 'Jobs Completed', 'Rating', 'Earnings'].map(col => (
                                    <TableCell key={col} sx={{ fontWeight: 800, fontSize: '0.75rem' }}>{col}</TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {topExperts.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} align="center" sx={{ py: 5, color: 'text.secondary' }}>
                                        No expert data available
                                    </TableCell>
                                </TableRow>
                            ) : topExperts.map((expert) => (
                                <TableRow key={expert.id} hover>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <Avatar sx={{ width: 32, height: 32, fontSize: 13, bgcolor: 'primary.main' }}>
                                                {(expert.name || '?').charAt(0).toUpperCase()}
                                            </Avatar>
                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{expert.name || '—'}</Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" color="text.secondary">{expert.specialization}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip label={expert.jobsCompleted} size="small" color="success" sx={{ fontWeight: 700, borderRadius: 1.5 }} />
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                            {expert.rating > 0 ? `⭐ ${Number(expert.rating).toFixed(1)}` : '—'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" sx={{ fontWeight: 700, color: 'success.main' }}>
                                            ₹{Number(expert.totalEarnings).toLocaleString()}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </SectionBox>
            </Paper>
        </Box>
    );
};

export default Analytics;
