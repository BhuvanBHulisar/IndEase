import React from 'react';
import { Box, Paper, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

export default function LegalPage({ title, effectiveDate, sections }) {
    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc', px: 2, py: { xs: 4, md: 6 } }}>
            <Box sx={{ maxWidth: 960, mx: 'auto' }}>
                <Typography
                    component={RouterLink}
                    to="/login"
                    sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 1,
                        mb: 4,
                        color: 'primary.main',
                        fontWeight: 700,
                        textDecoration: 'none'
                    }}
                >
                    <span aria-hidden="true">←</span>
                    <span>Back to Home</span>
                </Typography>

                <Stack spacing={3} alignItems="center">
                    <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: '-0.03em' }}>
                        origiNode
                    </Typography>

                    <Paper
                        elevation={0}
                        sx={{
                            width: '100%',
                            maxWidth: 800,
                            p: { xs: 3, sm: 5 },
                            borderRadius: 4,
                            border: '1px solid',
                            borderColor: 'divider'
                        }}
                    >
                        <Box sx={{ borderBottom: '1px solid', borderColor: 'divider', pb: 3, mb: 4 }}>
                            <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
                                {title}
                            </Typography>
                            {effectiveDate ? (
                                <Typography color="text.secondary">Effective date: {effectiveDate}</Typography>
                            ) : null}
                        </Box>

                        <Stack spacing={4}>
                            {sections.map((section) => (
                                <Box key={section.heading}>
                                    <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 800, mb: 1.5 }}>
                                        {section.heading}
                                    </Typography>
                                    <Stack spacing={1.5}>
                                        {section.body.map((item) => (
                                            <Typography key={item} sx={{ fontSize: '1rem', lineHeight: 1.8, color: 'text.secondary' }}>
                                                {item}
                                            </Typography>
                                        ))}
                                    </Stack>
                                </Box>
                            ))}
                        </Stack>
                    </Paper>
                </Stack>
            </Box>
        </Box>
    );
}
