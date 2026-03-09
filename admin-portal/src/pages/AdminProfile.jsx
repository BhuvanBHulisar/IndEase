import React from 'react';
import { Box, Paper, Typography, Avatar, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function AdminProfile() {
    const navigate = useNavigate();
    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: 'background.default' }}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 3, minWidth: 320, textAlign: 'center' }}>
                <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.main', mx: 'auto', mb: 2, fontWeight: 700, fontSize: '2rem' }}>AR</Avatar>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>Admin Root</Typography>
                <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 1 }}>Software Engineer</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Email: <a href="mailto:admin@originode.com" style={{ color: 'inherit', textDecoration: 'underline' }}>admin@originode.com</a>
                </Typography>
                <Button variant="contained" color="primary" onClick={() => navigate('/')} sx={{ mt: 2, borderRadius: 2 }}>
                    Back to Dashboard
                </Button>
            </Paper>
        </Box>
    );
}
