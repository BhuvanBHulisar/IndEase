import api from '../services/api';
import React, { useState, useEffect } from 'react';
import {
    Grid,
    Box,
    Typography,
    useTheme,
    Paper,
    Button,
    CircularProgress,
    Tooltip,
    IconButton,
    AvatarGroup,
    Avatar,
    Divider,
    Chip,
    Snackbar,
    Alert
} from '@mui/material';

import {
    Group,
    VerifiedUser,
    PendingActions,
    Refresh,
    GetApp
} from '@mui/icons-material';

import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';

import {
    CartesianGrid,
    Tooltip as ChartTooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Cell
} from 'recharts';

import StatCard from '../components/StatCard';

import socket from '../services/socket';

const Dashboard = () => {

    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState(null);
    const theme = useTheme();

    const [jobDistribution, setJobDistribution] = useState([]);
    const [jobDistLoading, setJobDistLoading] = useState(true);
    const [jobDistError, setJobDistError] = useState('');
    const [snackbar, setSnackbar] = useState({ open: false, message: '' });

    const revenueData = [
        { name: 'Mon', revenue: 4500 },
        { name: 'Tue', revenue: 5200 },
        { name: 'Wed', revenue: 4800 },
        { name: 'Thu', revenue: 6100 },
        { name: 'Fri', revenue: 5900 },
        { name: 'Sat', revenue: 7200 },
        { name: 'Sun', revenue: 6800 },
    ];

    const fetchJobDistribution = async () => {
        setJobDistLoading(true);
        try {
            const response = await api.get('/analytics/job-distribution');
            setJobDistribution(response.data.categories || []);
        } catch (err) {
            setJobDistError('Failed to load job distribution');
            setJobDistribution([]);
        } finally {
            setJobDistLoading(false);
        }
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await api.get('/admin/dashboard/metrics');
            setSummary(response.data);
        } catch (err) {
            setSummary(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        fetchJobDistribution();

        // Real-time: new job created
        socket.on('new_job_created', (data) => {
            const message = (data && data.message) ? data.message : 'New job created';
            setSnackbar({ open: true, message });
            fetchData();
            fetchJobDistribution();
        });

        // Real-time: payment/escrow updates (new escrow, release, etc.)
        socket.on('payment_update', (data) => {
            const event = data?.event || 'payment_update';
            const messages = {
                'new_escrow': '💰 New payment received — held in escrow',
                'escrow_released': '✅ Escrow released — funds dispatched to expert',
                'payment_verified': '🔐 Payment verified and secured in escrow'
            };
            setSnackbar({ open: true, message: messages[event] || 'Payment ledger updated' });
            fetchData();
        });

        return () => {
            socket.off('new_job_created');
            socket.off('payment_update');
        };
    }, []);

    return (
        <Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 800 }}>
                        Executive Dashboard
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Operational overview of the OrigiNode Marketplace
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 1.5 }}>
                    <Button
                        variant="outlined"
                        startIcon={<Refresh />}
                        onClick={fetchData}
                        sx={{ borderRadius: 2.5 }}
                    >
                        Sync Data
                    </Button>

                    <Button
                        variant="contained"
                        startIcon={<GetApp />}
                        sx={{ borderRadius: 2.5 }}
                    >
                        Export Report
                    </Button>
                </Box>
            </Box>

            {/* KPI Cards */}

            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Total Revenue"
                        value={`₹${summary?.total_revenue?.toLocaleString() || '0'}`}
                        icon={<MonetizationOnIcon sx={{ fontSize: 26 }} />}
                        color={theme.palette.primary.main}
                        loading={loading}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Platform Earnings"
                        value={`₹${summary?.platform_earnings?.toLocaleString() || '0'}`}
                        icon={<VerifiedUser sx={{ fontSize: 26 }} />}
                        color="#10b981"
                        loading={loading}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="GST Collected"
                        value={`₹${summary?.gst_collected?.toLocaleString() || '0'}`}
                        icon={<Group sx={{ fontSize: 26 }} />}
                        color="#8b5cf6"
                        loading={loading}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Pending Escrow"
                        value={`₹${summary?.pending_escrow?.toLocaleString() || '0'}`}
                        icon={<PendingActions sx={{ fontSize: 26 }} />}
                        color={theme.palette.warning.main}
                        loading={loading}
                    />
                </Grid>
            </Grid>

            {/* Charts */}

            <Grid container spacing={3}>

                {/* Revenue Chart */}

                <Grid item xs={12} lg={8}>
                    <Paper sx={{ p: 3, borderRadius: 4 }}>

                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                            Revenue Analytics
                        </Typography>

                        <Box sx={{ height: 350 }}>

                            <ResponsiveContainer>

                                <AreaChart data={revenueData}>

                                    <CartesianGrid strokeDasharray="3 3" />

                                    <XAxis dataKey="name" />

                                    <YAxis />

                                    <ChartTooltip />

                                    <Area
                                        type="monotone"
                                        dataKey="revenue"
                                        stroke={theme.palette.primary.main}
                                        fillOpacity={1}
                                        fill={theme.palette.primary.light}
                                    />

                                </AreaChart>

                            </ResponsiveContainer>

                        </Box>

                    </Paper>
                </Grid>

                {/* Job Distribution */}

                <Grid item xs={12} lg={4}>

                    <Paper sx={{ p: 3, borderRadius: 4 }}>

                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            Job Distribution
                        </Typography>

                        <Box sx={{ height: 300, mt: 2 }}>

                            {jobDistLoading ? (
                                <CircularProgress />
                            ) : jobDistError ? (
                                <Typography color="error">{jobDistError}</Typography>
                            ) : (

                                <ResponsiveContainer>

                                    <BarChart data={jobDistribution} layout="vertical">

                                        <XAxis type="number" hide />

                                        <YAxis
                                            type="category"
                                            dataKey="name"
                                            width={100}
                                        />

                                        <ChartTooltip cursor={{ fill: 'transparent' }} />

                                        <Bar dataKey="jobs" radius={[0, 4, 4, 0]} barSize={20}>

                                            {jobDistribution.map((entry, index) => {
                                                return (
                                                    <Cell
                                                        key={`cell-${index}`}
                                                        fill={theme.palette.primary.main}
                                                    />
                                                );
                                            })}

                                        </Bar>

                                    </BarChart>

                                </ResponsiveContainer>
                            )}

                        </Box>

                        <Divider sx={{ my: 2 }} />

                        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>
                            Live Agents Monitoring
                        </Typography>

                        <AvatarGroup max={4}>
                            <Avatar>AD</Avatar>
                            <Avatar>ML</Avatar>
                            <Avatar>RT</Avatar>
                            <Avatar>SK</Avatar>
                            <Avatar>WP</Avatar>
                        </AvatarGroup>

                    </Paper>

                </Grid>

            </Grid>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert severity="info" variant="filled" sx={{ width: '100%', borderRadius: 3 }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>

        </Box>
    );
};

export default Dashboard;