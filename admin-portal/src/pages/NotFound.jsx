import React from 'react';
import {
    Box,
    Typography,
    Button,
    useTheme
} from '@mui/material';
import {
    Home as HomeIcon,
    ErrorOutline as ErrorIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
    const navigate = useNavigate();
    const theme = useTheme();

    return (
        <Box
            sx={{
                height: '80vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center'
            }}
        >
            <Box
                sx={{
                    fontSize: '8rem',
                    fontWeight: 800,
                    color: 'primary.main',
                    lineHeight: 1,
                    mb: 2,
                    opacity: 0.1
                }}
            >
                404
            </Box>
            <ErrorIcon sx={{ fontSize: 80, color: 'error.main', mb: 3 }} />
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>Directive Not Found</Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 450 }}>
                The administrative sector you are attempting to access is either decommissioned or requires high-level clearance.
            </Typography>
            <Button
                variant="contained"
                size="large"
                startIcon={<HomeIcon />}
                onClick={() => navigate('/')}
                sx={{ borderRadius: 2.5, px: 4, py: 1.5, boxShadow: 'none' }}
            >
                Return to Core Dashboard
            </Button>
        </Box>
    );
};

export default NotFound;
