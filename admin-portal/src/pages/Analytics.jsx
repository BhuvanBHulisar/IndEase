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
import StatCard from '../components/StatCard';

const Analytics = () => {
    const theme = useTheme();
    const [tab, setTab] = useState(0);

    // Mock data for graphs
    const growthData = [
        { month: 'Jan', consumers: 400, providers: 80, revenue: 24000 },
        { month: 'Feb', consumers: 600, providers: 120, revenue: 38000 },
        { month: 'Mar', consumers: 900, providers: 190, revenue: 52000 },
        { month: 'Apr', consumers: 1200, providers: 240, revenue: 75000 },
        { month: 'May', consumers: 1800, providers: 320, revenue: 98000 },
        { month: 'Jun', consumers: 2400, providers: 410, revenue: 145000 },
    ];

    const categoryData = [
        { name: 'Electrical', value: 35, color: '#3b82f6' },
        { name: 'Plumbing', value: 25, color: '#8b5cf6' },
        { name: 'Cleaning', value: 20, color: '#10b981' },
        { name: 'Carpentry', value: 15, color: '#f59e0b' },
        { name: 'Other', value: 5, color: '#64748b' },
    ];

    const providerPerformance = [
        { name: 'Elite Plumbers', rating: 4.9, jobs: 142, revenue: 284000 },
        { name: 'Volt Masters', rating: 4.7, jobs: 98, revenue: 196000 },
        { name: 'Crystal Clean', rating: 4.4, jobs: 86, revenue: 172000 },
        { name: 'Rapid Repairs', rating: 4.2, jobs: 54, revenue: 108000 },
    ];

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 800 }}>Deeper Insights</Typography>
                    <Typography variant="body2" color="text.secondary">Cross-section analysis of marketplace growth and user retention metrics</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1.5 }}>
                    <Button variant="outlined" startIcon={<Timer />}>Last 30 Days</Button>
                    <Button variant="contained" startIcon={<GetApp />} sx={{ borderRadius: 2.5, px: 2 }}>Download Full Audit</Button>
                </Box>
            </Box>

            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
                <Tabs value={tab} onChange={(e, v) => setTab(v)} textColor="primary" indicatorColor="primary">
                    <Tab label="Market Growth" sx={{ fontWeight: 700 }} />
                    <Tab label="Service Heatmap" sx={{ fontWeight: 700 }} />
                    <Tab label="Retention & Churn" sx={{ fontWeight: 700 }} />
                </Tabs>
            </Box>

            {tab === 0 && (
                <Grid container spacing={3}>
                    <Grid item xs={12} lg={8}>
                        <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: `1px solid ${theme.palette.divider}` }}>
                            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box>
                                    <Typography variant="h6" sx={{ fontWeight: 700 }}>Revenue & User Progression</Typography>
                                    <Typography variant="caption" color="text.secondary">Correlation between user acquisition and net turnover</Typography>
                                </Box>
                                <Chip label="+42% YoY" color="success" size="small" sx={{ fontWeight: 800 }} />
                            </Box>

                            <Box sx={{ height: 400, width: '100%' }}>
                                <ResponsiveContainer>
                                    <AreaChart data={growthData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
                                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: theme.palette.text.secondary }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: theme.palette.text.secondary }} />
                                        <ChartTooltip contentStyle={{ borderRadius: 12, border: 'none', backgroundColor: theme.palette.background.paper }} />
                                        <Area type="monotone" dataKey="revenue" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} strokeWidth={2} />
                                        <Area type="monotone" dataKey="consumers" stackId="2" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.1} strokeWidth={2} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </Box>
                        </Paper>
                    </Grid>

                    <Grid item xs={12} lg={4}>
                        <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: `1px solid ${theme.palette.divider}`, height: '100%' }}>
                            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Category Penetration</Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 3 }}>Market share by service specialisation</Typography>

                            <Box sx={{ height: 300, width: '100%' }}>
                                <ResponsiveContainer>
                                    <PieChart>
                                        <Pie
                                            data={categoryData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {categoryData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <ChartTooltip />
                                        <Legend verticalAlign="bottom" height={36} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </Box>

                            <Divider sx={{ my: 3 }} />

                            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>Summary Performance</Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="body2" color="text.secondary">Net Commission Rate</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 700, color: 'success.main' }}>12.4%</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="body2" color="text.secondary">Avg Order Value</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 700 }}>₹4,520</Typography>
                                </Box>
                            </Box>
                        </Paper>
                    </Grid>

                    <Grid item xs={12}>
                        <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: `1px solid ${theme.palette.divider}` }}>
                            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>Top Tier Professionals (By Output)</Typography>
                            <Grid container spacing={3}>
                                {providerPerformance.map((p, i) => (
                                    <Grid item xs={12} sm={6} md={3} key={i}>
                                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                            <Avatar sx={{ bgcolor: theme.palette.primary.main + '20', color: 'primary.main', fontWeight: 700 }}>{p.rating}</Avatar>
                                            <Box>
                                                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{p.name}</Typography>
                                                <Typography variant="caption" color="text.secondary">₹{p.revenue.toLocaleString()} in turnover</Typography>
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
                <Box sx={{ py: 10, textAlign: 'center', opacity: 0.5 }}>
                    <CircularProgress size={40} sx={{ mb: 2 }} />
                    <Typography variant="h6">Category Heatmap generation in progress...</Typography>
                </Box>
            )}
        </Box>
    );
};

export default Analytics;
