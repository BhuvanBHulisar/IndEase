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
    Chip
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

const Dashboard = () => {

    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState(null);
    const theme = useTheme();

    const [jobDistribution, setJobDistribution] = useState([]);
    const [jobDistLoading, setJobDistLoading] = useState(true);
    const [jobDistError, setJobDistError] = useState('');

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
            console.log('Job distribution data:', response.data);
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
            const response = await api.get('/analytics/overview');
            console.log('Dashboard API response:', response.data);
            setSummary(response.data);
        } catch (err) {
            console.error('Error fetching dashboard summary:', err);
            setSummary(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        fetchJobDistribution();
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
                        value={`₹${summary?.totalRevenue?.toLocaleString() || '0'}`}
                        icon={<MonetizationOnIcon sx={{ fontSize: 26 }} />}
                        color={theme.palette.primary.main}
                        loading={loading}
                    />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Total Users"
                        value={summary?.totalUsers || '0'}
                        icon={<Group sx={{ fontSize: 26 }} />}
                        color="#8b5cf6"
                        loading={loading}
                    />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Professional Providers"
                        value={summary?.totalProviders || '0'}
                        icon={<VerifiedUser sx={{ fontSize: 26 }} />}
                        color="#10b981"
                        loading={loading}
                    />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Pending Payouts"
                        value={`₹${summary?.pendingPayouts?.toLocaleString() || '0'}`}
                        icon={<PendingActions sx={{ fontSize: 26 }} />}
                        color="#ef4444"
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

                                            {jobDistribution.map((entry, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={theme.palette.primary.main}
                                                />
                                            ))}

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

        </Box>
    );
};

export default Dashboard;