'use client';

import React from 'react';
import { Box, Chip, Paper, Stack, Typography } from '@mui/material';

export const ACCENT = '#c4f82a';
export const INK = '#0b0b0b';

export default function AdminMatrixShell({
  icon: Icon,
  title,
  subtitle,
  step,
  totalSteps,
  action,
  children,
}) {
  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1200, mx: 'auto' }}>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 3,
          border: '1px solid rgba(255,255,255,0.08)',
          background: `linear-gradient(135deg, ${INK} 0%, #151515 100%)`,
          color: '#f4f4f5',
        }}
      >
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }} justifyContent="space-between">
          <Stack spacing={0.75}>
            <Stack direction="row" spacing={1} alignItems="center">
              {Icon ? <Icon size={22} color={ACCENT} aria-hidden="true" /> : null}
              <Typography variant="h5" fontWeight={700}>
                {title}
              </Typography>
              {step && totalSteps ? (
                <Chip
                  size="small"
                  label={`Step ${step}/${totalSteps}`}
                  sx={{ bgcolor: 'rgba(196,248,42,0.12)', color: ACCENT, border: `1px solid rgba(196,248,42,0.35)` }}
                />
              ) : null}
            </Stack>
            {subtitle ? (
              <Typography variant="body2" sx={{ color: 'rgba(244,244,245,0.72)', maxWidth: 720 }}>
                {subtitle}
              </Typography>
            ) : null}
          </Stack>
          {action || null}
        </Stack>
      </Paper>

      <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
        {children}
      </Paper>
    </Box>
  );
}
