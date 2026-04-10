import React from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Avatar,
    LinearProgress,
    Tooltip,
    useTheme
} from '@mui/material';
import {
    TrendingUp,
    TrendingDown,
    ArrowForwardIos
} from '@mui/icons-material';

const StatCard = ({ title, value, icon, trend, trendValue, color = 'primary.main', loading = false }) => {
    const theme = useTheme();

    return (
        <Card
            elevation={2}
            sx={{
                borderRadius: 4,
                overflow: 'visible',
                position: 'relative',
                transition: 'transform 0.2s',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[8]
                }
            }}
        >
            <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: 0 }}>
                            {title}
                        </Typography>
                        <Typography variant="h4" sx={{ mt: 0.5, fontWeight: 800 }}>
                            {loading ? '---' : value}
                        </Typography>
                    </Box>
                    <Avatar
                        sx={{
                            bgcolor: `${color}15`,
                            color: color,
                            width: 44,
                            height: 44,
                            borderRadius: 2.5
                        }}
                    >
                        {icon}
                    </Avatar>
                </Box>

                {loading ? (
                    <LinearProgress sx={{ mt: 3, borderRadius: 2 }} color="primary" />
                ) : (
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 2.5, gap: 1 }}>
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                px: 1,
                                py: 0.25,
                                borderRadius: 1.5,
                                bgcolor: trend === 'up' ? 'success.light' : 'error.light',
                                color: trend === 'up' ? 'success.dark' : 'error.dark',
                                fontSize: '0.75rem',
                                fontWeight: 700
                            }}
                        >
                            {trend === 'up' ? <TrendingUp sx={{ fontSize: 14, mr: 0.5 }} /> : <TrendingDown sx={{ fontSize: 14, mr: 0.5 }} />}
                            {trendValue}
                        </Box>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                            vs last period
                        </Typography>
                    </Box>
                )}
            </CardContent>
        </Card>
    );
};

export default StatCard;
