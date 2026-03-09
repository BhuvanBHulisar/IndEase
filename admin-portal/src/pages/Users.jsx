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
    Select,
    MenuItem,
    FormControl,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Snackbar,
    Alert
} from '@mui/material';
import {
    DataGrid,
    GridActionsCellItem
} from '@mui/x-data-grid';
import {
    Search,
    Edit,
    Delete,
    Email,
    Shield,
    Block,
    PersonAdd,
    FilterList,
    MoreHoriz
} from '@mui/icons-material';
import adminApi from '../api/adminApi';

const Users = () => {
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState('');
    const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });
    const theme = useTheme();

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await api.get('/users');
            console.log('Users API response:', response.data);
            setUsers(response.data);
        } catch (err) {
            console.error('Error fetching users:', err);
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleRoleChange = async (id, newRole) => {
        try {
            await adminApi.patch(`/api/admin/users/${id}/role`, { role: newRole });
            setToast({ open: true, message: `User role updated to ${newRole}`, severity: 'success' });
            fetchUsers();
        } catch (err) {
            setToast({ open: true, message: 'Failed to update user role', severity: 'error' });
        }
    };

    const columns = [
        {
            field: 'id',
            headerName: 'ID',
            width: 90,
            renderCell: (params) => (
                <Typography variant="caption" sx={{ fontWeight: 700, opacity: 0.5 }}>#{params.value}</Typography>
            )
        },
        {
            field: 'email',
            headerName: 'User / Email',
            flex: 1,
            minWidth: 250,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 32, height: 32, fontSize: 13, fontWeight: 700 }}>
                        {params.value.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{params.value.split('@')[0]}</Typography>
                        <Typography variant="caption" color="text.secondary">{params.value}</Typography>
                    </Box>
                </Box>
            )
        },
        {
            field: 'role',
            headerName: 'Role',
            width: 150,
            renderCell: (params) => {
                const color = params.value === 'admin' ? 'error' : params.value === 'producer' ? 'success' : 'primary';
                return (
                    <Chip
                        label={params.value.toUpperCase()}
                        size="small"
                        color={color}
                        sx={{ fontWeight: 700, borderRadius: 1.5, fontSize: '0.65rem' }}
                    />
                );
            }
        },
        {
            field: 'created_at',
            headerName: 'Joined Date',
            width: 200,
            valueGetter: (params) => new Date(params.value).toLocaleDateString()
        },
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Operations',
            width: 150,
            getActions: (params) => [
                <GridActionsCellItem
                    icon={<Edit sx={{ fontSize: 18 }} />}
                    label="Edit Role"
                    onClick={() => { }}
                    showInMenu
                />,
                <GridActionsCellItem
                    icon={<Email sx={{ fontSize: 18 }} />}
                    label="Send Notification"
                    onClick={() => { }}
                    showInMenu
                />,
                <GridActionsCellItem
                    icon={<Block sx={{ fontSize: 18 }} />}
                    label="Deactivate"
                    onClick={() => { }}
                    showInMenu
                />,
            ],
            renderCell: (params) => (
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Tooltip title="Promote to Admin">
                        <IconButton size="small" onClick={() => handleRoleChange(params.id, 'admin')} disabled={params.row.role === 'admin'}>
                            <Shield sx={{ fontSize: 18 }} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="View Details">
                        <IconButton size="small">
                            <MoreHoriz sx={{ fontSize: 18 }} />
                        </IconButton>
                    </Tooltip>
                </Box>
            )
        }
    ];

    const filteredUsers = users.filter(user =>
        user.email.toLowerCase().includes(search.toLowerCase()) ||
        user.role.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 800 }}>User Management</Typography>
                    <Typography variant="body2" color="text.secondary">Oversee and adjust access permissions for all participants</Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<PersonAdd />}
                    sx={{ borderRadius: 2.5, px: 2 }}
                >
                    Add Internal User
                </Button>
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
                        placeholder="Search by email or role..."
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
                    <DataGrid
                        rows={filteredUsers}
                        columns={columns}
                        pageSize={10}
                        rowsPerPageOptions={[10, 20, 50]}
                        loading={loading}
                        disableSelectionOnClick
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
