import api from '../services/api';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Skeleton, 
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
    Select,
    MenuItem,
    FormControl,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Snackbar,
    Alert,
    Divider,
    Stepper,
    Step,
    StepLabel
 } from '@mui/material';
import {
    DataGrid,
    GridActionsCellItem
} from '@mui/x-data-grid';
import {
    Search,
    Work,
    Person,
    Engineering,
    History,
    Timeline,
    CheckCircle,
    Cancel,
    Pending,
    Autorenew,
    Visibility,
    FlashOn
} from '@mui/icons-material';
import { socket } from '../utils/socket';

const Jobs = () => {
    const [loading, setLoading] = useState(true);
    const [jobs, setJobs] = useState([]);
    const [search, setSearch] = useState('');
    const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });
    const theme = useTheme();
    const navigate = useNavigate();

    const fetchJobs = async () => {
        setLoading(true);
        try {
            const response = await api.get('/admin/jobs');
            setJobs(response.data);
        } catch (err) {
            console.error('Error fetching jobs:', err);
            setJobs([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJobs();

        // Listen for real-time job status updates
        socket.on('status_update', (data) => {
            setJobs(prev => prev.map(job =>
                job.id === data.requestId ? { ...job, status: data.status } : job
            ));
            setToast({
                open: true,
                message: `Real-time: Job ${data.requestId} status updated to ${data.status}`,
                severity: 'info'
            });
        });

        return () => socket.off('status_update');
    }, []);

    const handleStatusChange = async (id, newStatus) => {
        try {
            await api.patch(`/admin/jobs/${id}/status`, { status: newStatus });
            setToast({ open: true, message: `Job ${id} status pushed to ${newStatus}`, severity: 'success' });
            fetchJobs();
        } catch (err) {
            setToast({ open: true, message: 'Administrative override failed', severity: 'error' });
        }
    };

    const getStatusConfig = (status) => {
        switch (status) {
            case 'completed': return { color: 'success', icon: <CheckCircle sx={{ fontSize: 16 }} /> };
            case 'in_progress':
            case 'accepted': return { color: 'info', icon: <Autorenew sx={{ fontSize: 16 }} /> };
            case 'pending':
            case 'broadcast': return { color: 'warning', icon: <Pending sx={{ fontSize: 16 }} /> };
            case 'declined':
            case 'cancelled': return { color: 'error', icon: <Cancel sx={{ fontSize: 16 }} /> };
            default: return { color: 'default', icon: null };
        }
    };

    const columns = [
        {
            field: 'id',
            headerName: 'JOB ID',
            width: 120,
            renderCell: (params) => (
                <Typography variant="caption" sx={{ fontWeight: 800, color: 'primary.main' }}>
                    JOB-{String(params.value).padStart(3, '0')}
                </Typography>
            )
        },
        {
            field: 'consumer',
            headerName: 'Consumer',
            flex: 1,
            minWidth: 200,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ width: 24, height: 24, fontSize: 10, bgcolor: 'secondary.main' }}>
                        {params.value?.charAt(0).toUpperCase()}
                    </Avatar>
                    <Typography variant="body2">{params.value || 'Anonymous'}</Typography>
                </Box>
            )
        },
        {
            field: 'producer',
            headerName: 'Expert',
            flex: 1,
            minWidth: 200,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {params.value ? (
                        <>
                            <Avatar sx={{ width: 24, height: 24, fontSize: 10, bgcolor: 'success.main' }}>
                                {params.value.charAt(0).toUpperCase()}
                            </Avatar>
                            <Typography variant="body2">{params.value}</Typography>
                        </>
                    ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', fontSize: '0.85rem' }}>
                            Pending
                        </Typography>
                    )}
                </Box>
            )
        },
        {
            field: 'machine_name',
            headerName: 'Machine',
            flex: 1,
            minWidth: 150,
            renderCell: (params) => (
                <Typography variant="body2">{params.value || 'N/A'}</Typography>
            )
        },
        {
            field: 'status',
            headerName: 'Status',
            width: 160,
            renderCell: (params) => {
                const config = getStatusConfig(params.value);
                const displayLabel = params.value === 'broadcast' ? 'PENDING' : params.value.replace('_', ' ').toUpperCase();
                return (
                    <Chip
                        icon={config.icon}
                        label={displayLabel}
                        size="small"
                        color={config.color}
                        sx={{ fontWeight: 800, borderRadius: 1.5, fontSize: '0.6rem', px: 0.5 }}
                    />
                );
            }
        },
        {
            field: 'quoted_cost',
            headerName: 'Amount',
            width: 120,
            renderCell: (params) => (
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {params.value ? `₹${Number(params.value).toLocaleString()}` : '-'}
                </Typography>
            )
        },
        {
            field: 'created_at',
            headerName: 'Date',
            width: 120,
            renderCell: (params) => (
                <Typography variant="body2">
                    {params.value ? new Date(params.value).toLocaleDateString('en-GB') : '-'}
                </Typography>
            )
        },
        {
            field: 'actions',
            headerName: 'Management',
            width: 140,
            renderCell: (params) => (
                <Button 
                    size="small" 
                    variant="outlined" 
                    startIcon={<Visibility />} 
                    onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/jobs/${params.row.id}`);
                    }}
                >
                    View
                </Button>
            )
        }
    ];

    const filteredJobs = jobs.filter(job => {
        const jobIdStr = `JOB-${String(job.id).padStart(3, '0')}`.toLowerCase();
        const consumerStr = (job.consumer || '').toLowerCase();
        const searchLower = search.toLowerCase();
        return jobIdStr.includes(searchLower) || consumerStr.includes(searchLower);
    });

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 800 }}>All Jobs</Typography>
                    <Typography variant="body2" color="text.secondary">Monitor all service requests and assignments</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button startIcon={<FlashOn sx={{ color: 'warning.main' }} />}>Live Flow</Button>
                    <Button variant="outlined" startIcon={<Timeline />}>Analytics</Button>
                </Box>
            </Box>

            <Paper
                elevation={0}
                sx={{
                    p: 0,
                    borderRadius: 4,
                    border: `1px solid ${theme.palette.divider}`,
                    overflow: 'hidden'
                }}
            >
                <Box sx={{ p: 2.5, display: 'flex', gap: 2, bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)' }}>
                    <TextField
                        size="small"
                        placeholder="Search by Job ID or User..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        sx={{ width: 320 }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Search sx={{ fontSize: 20, color: 'text.secondary' }} />
                                </InputAdornment>
                            ),
                            sx: { borderRadius: 2.5, bgcolor: 'background.paper' }
                        }}
                    />
                    <Divider orientation="vertical" flexItem />
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Chip label={`All: ${jobs.length}`} color="primary" size="small" sx={{ fontWeight: 700 }} />
                        <Chip label={`Live: ${jobs.filter(j => ['in_progress', 'accepted'].includes(j.status)).length}`} color="info" size="small" variant="outlined" sx={{ fontWeight: 700 }} />
                        <Chip label={`Pending: ${jobs.filter(j => ['pending', 'broadcast'].includes(j.status)).length}`} color="warning" size="small" variant="outlined" sx={{ fontWeight: 700 }} />
                    </Box>
                </Box>

                <Box sx={{ height: 650, width: '100%' }}>
                    <DataGrid
                        rows={filteredJobs}
                        columns={columns}
                        pageSize={10}
                        rowsPerPageOptions={[10, 20, 50]}
                        loading={loading}
                        disableSelectionOnClick
                        getRowId={(row) => row.id}
                        sx={{
                            border: 'none',
                            '& .MuiDataGrid-columnHeaders': {
                                bgcolor: theme.palette.mode === 'dark' ? '#1e293b' : '#f8fafc',
                                borderBottom: `1px solid ${theme.palette.divider}`
                            }
                        }}
                        slots={{
                            noRowsOverlay: () => (
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                                    <Typography variant="body1" color="text.secondary">No service requests yet.</Typography>
                                </Box>
                            )
                        }}
                    />
                </Box>
            </Paper>

            <Snackbar
                open={toast.open}
                autoHideDuration={4000}
                onClose={() => setToast({ ...toast, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert severity={toast.severity} variant="filled" sx={{ width: '100%', borderRadius: 3 }}>
                    {toast.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default Jobs;
