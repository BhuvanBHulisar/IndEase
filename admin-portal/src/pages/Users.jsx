import api from '../services/api';
import React, { useState, useEffect } from 'react';
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
    CircularProgress,
    Snackbar,
    Alert
 } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import {
    Search,
    Block,
    CheckCircle,
    FilterList,
    Visibility,
    Refresh,
    PersonOff
} from '@mui/icons-material';

import { useNavigate } from 'react-router-dom';

const Users = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState('');
    const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });
    const theme = useTheme();
    const navigate = useNavigate();

    const fetchUsers = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await api.get('/admin/users');
            setUsers(response.data);
        } catch (err) {
            console.error('Error fetching users:', err);
            setError('Failed to load users. Please try again.');
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleToggleSuspend = async (user) => {
        const newSuspended = !user.is_suspended;
        try {
            await api.patch(`/admin/users/${user.id}/suspend`, { suspended: newSuspended });
            setUsers(prev =>
                prev.map(u => u.id === user.id ? { ...u, is_suspended: newSuspended } : u)
            );
            setToast({
                open: true,
                message: `User ${newSuspended ? 'suspended' : 'activated'} successfully`,
                severity: 'success'
            });
        } catch (err) {
            setToast({ open: true, message: 'Failed to update user status', severity: 'error' });
        }
    };

    const columns = [
        {
            field: 'id',
            headerName: 'ID',
            width: 100,
            renderCell: (params) => (
                <Typography variant="caption" sx={{ fontWeight: 700, opacity: 0.5, fontFamily: 'monospace' }}>
                    USR-{String(params.value).substring(0, 6).toUpperCase()}
                </Typography>
            )
        },
        {
            field: 'name',
            headerName: 'Name / Email',
            flex: 1,
            minWidth: 240,
            renderCell: (params) => {
                const row = params.row;
                const displayName = [row.first_name, row.last_name].filter(Boolean).join(' ') || row.email?.split('@')[0] || '—';
                const initial = displayName.charAt(0).toUpperCase();
                return (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 32, height: 32, fontSize: 13, fontWeight: 700 }}>
                            {initial}
                        </Avatar>
                        <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.3 }}>{displayName}</Typography>
                            <Typography variant="caption" color="text.secondary">{row.email}</Typography>
                        </Box>
                    </Box>
                );
            }
        },
        {
            field: 'role',
            headerName: 'Role',
            width: 150,
            renderCell: (params) => (
                <Chip
                    label="Fleet Operator"
                    size="small"
                    color="primary"
                    sx={{ fontWeight: 700, borderRadius: 1.5, fontSize: '0.65rem' }}
                />
            )
        },
        {
            field: 'created_at',
            headerName: 'Joined Date',
            width: 140,
            renderCell: (params) => {
                if (!params.value) return <Typography variant="caption">—</Typography>;
                const d = new Date(params.value);
                const formatted = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
                return <Typography variant="body2">{formatted}</Typography>;
            }
        },
        {
            field: 'is_suspended',
            headerName: 'Status',
            width: 120,
            renderCell: (params) => (
                <Chip
                    label={params.value ? 'Suspended' : 'Active'}
                    size="small"
                    color={params.value ? 'error' : 'success'}
                    sx={{ fontWeight: 700, borderRadius: 1.5, fontSize: '0.65rem' }}
                />
            )
        },
        {
            field: 'actions',
            headerName: 'Operations',
            width: 140,
            sortable: false,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Tooltip title="View Details">
                        <IconButton size="small" onClick={(e) => { e.stopPropagation(); navigate(`/users/${params.row.id}`); }}>
                            <Visibility sx={{ fontSize: 18 }} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={params.row.is_suspended ? 'Activate User' : 'Suspend User'}>
                        <IconButton
                            size="small"
                            color={params.row.is_suspended ? 'success' : 'error'}
                            onClick={() => handleToggleSuspend(params.row)}
                        >
                            {params.row.is_suspended
                                ? <CheckCircle sx={{ fontSize: 18 }} />
                                : <Block sx={{ fontSize: 18 }} />
                            }
                        </IconButton>
                    </Tooltip>
                </Box>
            )
        }
    ];

    const filteredUsers = users.filter(user => {
        const name = [user.first_name, user.last_name].filter(Boolean).join(' ').toLowerCase();
        const q = search.toLowerCase();
        return name.includes(q) || (user.email || '').toLowerCase().includes(q);
    });

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 800 }}>User Management</Typography>
                    <Typography variant="body2" color="text.secondary">View and manage all registered consumers</Typography>
                </Box>
            </Box>

            <Paper
                elevation={0}
                sx={{ p: 0, borderRadius: 4, border: `1px solid ${theme.palette.divider}`, overflow: 'hidden' }}
            >
                <Box sx={{ p: 2.5, display: 'flex', gap: 2, bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)' }}>
                    <TextField
                        size="small"
                        placeholder="Search by name or email..."
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
                    <Button startIcon={<FilterList />} sx={{ color: 'text.secondary' }}>Filter</Button>
                </Box>

                <Box sx={{ height: 600, width: '100%' }}>
                    {error ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 2 }}>
                            <PersonOff sx={{ fontSize: 48, color: 'text.disabled' }} />
                            <Typography color="error" sx={{ fontWeight: 600 }}>{error}</Typography>
                            <Button variant="outlined" startIcon={<Refresh />} onClick={fetchUsers}>
                                Retry
                            </Button>
                        </Box>
                    ) : (
                        <DataGrid
                            rows={filteredUsers}
                            columns={columns}
                            loading={loading}
                            pageSizeOptions={[10, 20, 50]}
                            initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                            disableRowSelectionOnClick
                            getRowId={(row) => row.id}
                            slots={{
                                noRowsOverlay: () => (
                                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 1.5, opacity: 0.5 }}>
                                        <PersonOff sx={{ fontSize: 48 }} />
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                            {search ? 'No users match your search.' : 'No consumers registered yet.'}
                                        </Typography>
                                    </Box>
                                )
                            }}
                            sx={{
                                border: 'none',
                                '& .MuiDataGrid-cell:focus': { outline: 'none' },
                                '& .MuiDataGrid-row:hover': { bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.01)' },
                                '& .MuiDataGrid-columnHeaders': {
                                    bgcolor: theme.palette.mode === 'dark' ? '#1e293b' : '#f8fafc',
                                    borderBottom: `1px solid ${theme.palette.divider}`,
                                    fontWeight: 700
                                }
                            }}
                        />
                    )}
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

export default Users;
