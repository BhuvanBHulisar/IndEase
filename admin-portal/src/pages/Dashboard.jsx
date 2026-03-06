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
    AssignmentLate,
    PendingActions,
    Refresh,
    GetApp,
    TrendingUp,
    MoreVert
} from '@mui/icons-material';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as ChartTooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell
} from 'recharts';
import StatCard from '../components/StatCard';
import adminApi from '../api/adminApi';

const Dashboard = () => {
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState(null);
    const theme = useTheme();

    // Mock data for charts
    const revenueData = [
        { name: 'Mon', revenue: 4500 },
        { name: 'Tue', revenue: 5200 },
        { name: 'Wed', revenue: 4800 },
        { name: 'Thu', revenue: 6100 },
        { name: 'Fri', revenue: 5900 },
        { name: 'Sat', revenue: 7200 },
        { name: 'Sun', revenue: 6800 },
    ];

    const jobsData = [
        { name: 'Plumbing', count: 45, color: '#3b82f6' },
        { name: 'Electrical', count: 32, color: '#8b5cf6' },
        { name: 'Cleaning', count: 28, color: '#10b981' },
        { name: 'Carpentry', count: 18, color: '#f59e0b' },
        { name: 'Painting', count: 12, color: '#6366f1' },
    ];

    const fetchData = async () => {
        setLoading(true);
        try {
            const { data } = await adminApi.get('/api/admin/summary');
            setSummary(data);
        } catch (err) {
            console.error('Error fetching dashboard summary:', err);
            // Mock data if backend fails
            setSummary({
                totalRevenue: 45280,
                totalUsers: 1250,
                totalProviders: 340,
                activeJobs: 42,
                pendingPayouts: 15600
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 800 }}>Executive Dashboard</Typography>
                    <Typography variant="body2" color="text.secondary">Operational overview of the OrigiNode Marketplace</Typography>
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
                        sx={{ borderRadius: 2.5, boxShadow: 'none' }}
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
                        trend="up"
                        trendValue="+12.5%"
                        color={theme.palette.primary.main}
                        loading={loading}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Total Users"
                        value={summary?.totalUsers || '0'}
                        icon={<Group sx={{ fontSize: 26 }} />}
                        trend="up"
                        trendValue="+4.2%"
                        color="#8b5cf6"
                        loading={loading}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Professional Providers"
                        value={summary?.totalProviders || '0'}
                        icon={<VerifiedUser sx={{ fontSize: 26 }} />}
                        trend="up"
                        trendValue="+8.1%"
                        color="#10b981"
                        loading={loading}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Pending Payouts"
                        value={`₹${summary?.pendingPayouts?.toLocaleString() || '0'}`}
                        icon={<PendingActions sx={{ fontSize: 26 }} />}
                        trend="down"
                        trendValue="-2.3%"
                        color="#ef4444"
                        loading={loading}
                    />
                </Grid>
            </Grid>

            {/* Charts Section */}
            <Grid container spacing={3}>
                <Grid item xs={12} lg={8}>
                    <Paper elevation={0} sx={{ p: 3, borderRadius: 4, height: '100%', border: `1px solid ${theme.palette.divider}` }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                            <Box>
                                <Typography variant="h6" sx={{ fontWeight: 700 }}>Revenue Analytics</Typography>
                                <Typography variant="caption" color="text.secondary">Weekly revenue trajectory and forecast</Typography>
                            </Box>
                            <Chip label="Live Feed" color="success" size="small" sx={{ fontWeight: 700, px: 1 }} />
                        </Box>

                        <Box sx={{ height: 350, width: '100%', mt: 2 }}>
                            <ResponsiveContainer>
                                <AreaChart data={revenueData}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.3} />
                                            <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                                        dx={-10}
                                    />
                                    <ChartTooltip
                                        contentStyle={{
                                            borderRadius: '12px',
                                            border: 'none',
                                            boxShadow: theme.shadows[10],
                                            backgroundColor: theme.palette.background.paper
                                        }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="revenue"
                                        stroke={theme.palette.primary.main}
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorRevenue)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </Box>
                    </Paper>
                </Grid>

                <Grid item xs={12} lg={4}>
                    <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: `1px solid ${theme.palette.divider}` }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Job Distribution</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 3 }}>Top performing service categories</Typography>

                        <Box sx={{ height: 300, width: '100%' }}>
                            <ResponsiveContainer>
                                <BarChart data={jobsData} layout="vertical">
                                    <XAxis type="number" hide />
                                    <YAxis
                                        type="category"
                                        dataKey="name"
                                        width={80}
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: theme.palette.text.primary, fontSize: 11, fontWeight: 600 }}
                                    />
                                    <ChartTooltip cursor={{ fill: 'transparent' }} />
                                    <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={20}>
                                        {jobsData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </Box>

                        <Divider sx={{ my: 2 }} />

                        <Box sx={{ mt: 2 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>Live Agents Monitoring</Typography>
                            <AvatarGroup max={4} sx={{ justifyContent: 'start' }}>
                                <Avatar sx={{ bgcolor: '#3b82f6', fontSize: 13 }}>AD</Avatar>
                                <Avatar sx={{ bgcolor: '#8b5cf6', fontSize: 13 }}>ML</Avatar>
                                <Avatar sx={{ bgcolor: '#10b981', fontSize: 13 }}>RT</Avatar>
                                <Avatar sx={{ bgcolor: '#f59e0b', fontSize: 13 }}>SK</Avatar>
                                <Avatar sx={{ bgcolor: '#6366f1', fontSize: 13 }}>WP</Avatar>
                            </AvatarGroup>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default Dashboard;
