import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Grid,
    useTheme,
    Button,
    Divider,
    List,
    ListItem,
    ListItemText,
    Avatar,
    Tab,
    Tabs,
    CircularProgress,
    Chip
} from '@mui/material';

import {
    TrendingUp,
    BarChart as BarChartIcon,
    PieChart as PieChartIcon,
    ShowChart,
    FilterList,
    GetApp,
    MonetizationOn,
    Group,
    VerifiedUser,
    Engineering,
    Search,
    Timer
} from '@mui/icons-material';

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
    PieChart,
    Pie,
    Cell,
    Legend
} from 'recharts';

import api from '../services/api';

const Analytics = () => {

    const theme = useTheme();

    const [tab, setTab] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [analyticsData, setAnalyticsData] = useState([]);

    const growthData = analyticsData?.growthData || [];
    const categoryData = analyticsData?.categoryData || [];
    const providerPerformance = analyticsData?.providerPerformance || [];

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const response = await api.get('/analytics/overview');
            console.log('Analytics API response:', response.data);
            setAnalyticsData(response.data || []);
        } catch (err) {
            setError('Failed to load analytics');
            setAnalyticsData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const handleTabChange = (event, newValue) => {
        setTab(newValue);
    };

    if (loading) {
        return <Box sx={{ p: 5 }}><CircularProgress /></Box>;
    }

    if (error) {
        return <Box sx={{ p: 5 }}><Typography color="error">{error}</Typography></Box>;
    }

    return (
        <Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 800 }}>
                        Deeper Insights
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 1.5 }}>
                    <Button variant="outlined" startIcon={<Timer />}>
                        Last 30 Days
                    </Button>

                    <Button variant="contained" startIcon={<GetApp />} sx={{ borderRadius: 2.5 }}>
                        Download Full Audit
                    </Button>
                </Box>
            </Box>

            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
                <Tabs value={tab} onChange={handleTabChange}>
                    <Tab label="Market Growth" sx={{ fontWeight: 700 }} />
                    <Tab label="Service Heatmap" sx={{ fontWeight: 700 }} />
                    <Tab label="Retention & Churn" sx={{ fontWeight: 700 }} />
                </Tabs>
            </Box>

            {tab === 0 && (
                <Grid container spacing={3}>

                    <Grid item xs={12} lg={8}>
                        <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: `1px solid ${theme.palette.divider}` }}>

                            <Box sx={{ mb: 4 }}>
                                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                    Revenue & User Progression
                                </Typography>
                            </Box>

                            <Box sx={{ height: 400 }}>
                                <ResponsiveContainer>

                                    <AreaChart data={growthData}>

                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />

                                        <XAxis dataKey="month" />

                                        <YAxis />

                                        <ChartTooltip />

                                        <Area
                                            type="monotone"
                                            dataKey="revenue"
                                            stroke="#3b82f6"
                                            fill="#3b82f6"
                                            fillOpacity={0.1}
                                        />

                                        <Area
                                            type="monotone"
                                            dataKey="consumers"
                                            stroke="#8b5cf6"
                                            fill="#8b5cf6"
                                            fillOpacity={0.1}
                                        />

                                    </AreaChart>

                                </ResponsiveContainer>
                            </Box>

                        </Paper>
                    </Grid>

                    <Grid item xs={12} lg={4}>
                        <Paper elevation={0} sx={{ p: 3, borderRadius: 4 }}>

                            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                                Category Penetration
                            </Typography>

                            <Box sx={{ height: 300 }}>
                                <ResponsiveContainer>

                                    <PieChart>

                                        <Pie
                                            data={categoryData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            dataKey="value"
                                        >
                                            {categoryData.map((entry, index) => (
                                                <Cell key={index} fill={entry.color} />
                                            ))}
                                        </Pie>

                                        <ChartTooltip />

                                        <Legend />

                                    </PieChart>

                                </ResponsiveContainer>
                            </Box>

                        </Paper>
                    </Grid>

                    <Grid item xs={12}>
                        <Paper elevation={0} sx={{ p: 3, borderRadius: 4 }}>

                            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                                Top Tier Professionals (By Output)
                            </Typography>

                            <Grid container spacing={3}>
                                {providerPerformance.map((p, i) => (
                                    <Grid item xs={12} sm={6} md={3} key={i}>
                                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                            <Avatar>{p.rating}</Avatar>
                                            <Box>
                                                <Typography variant="subtitle2">{p.name}</Typography>
                                                <Typography variant="caption">
                                                    ₹{p.revenue?.toLocaleString()}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Grid>
                                ))}
                            </Grid>

                        </Paper>
                    </Grid>

                </Grid>
            )}

            {tab === 1 && (
                <Box sx={{ py: 10, textAlign: 'center' }}>
                    <CircularProgress />
                    <Typography variant="h6">
                        Category Heatmap generation in progress...
                    </Typography>
                </Box>
            )}

        </Box>
    );
};

export default Analytics;