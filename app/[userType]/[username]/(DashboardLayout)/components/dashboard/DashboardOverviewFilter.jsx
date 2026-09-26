'use client';

import { Button, Stack, TextField, Typography } from '@mui/material';
import { Filter } from 'lucide-react';
import { toDateInputValue } from '@utils/dashboardDateRange';

export { defaultDashboardDateRange as defaultDashboardFilterDates } from '@utils/dashboardDateRange';

/**
 * Date range for admin operations dashboard.
 * No reset control — reopening the page uses the default 1-month window.
 */
export default function DashboardOverviewFilter({
  fromDate,
  toDate,
  onFromDateChange,
  onToDateChange,
  onApply,
  isApplying,
}) {
  const todayMax = toDateInputValue(new Date());

  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={1.5}
      alignItems={{ xs: 'stretch', sm: 'flex-end' }}
      useFlexGap
      flexWrap="wrap"
    >
      <Stack direction="row" spacing={0.75} alignItems="center" sx={{ minWidth: 0 }}>
        <Filter size={18} aria-hidden="true" />
        <Typography variant="body2" fontWeight={700} color="text.secondary">
          Period
        </Typography>
      </Stack>
      <TextField
        label="From"
        type="date"
        size="small"
        value={fromDate}
        onChange={(e) => onFromDateChange(e.target.value)}
        InputLabelProps={{ shrink: true }}
        inputProps={{ max: toDate }}
        sx={{ width: { xs: '100%', sm: 168 } }}
      />
      <TextField
        label="To"
        type="date"
        size="small"
        value={toDate}
        onChange={(e) => onToDateChange(e.target.value)}
        InputLabelProps={{ shrink: true }}
        inputProps={{ min: fromDate, max: todayMax }}
        sx={{ width: { xs: '100%', sm: 168 } }}
      />
      <Button
        variant="contained"
        onClick={onApply}
        disabled={isApplying}
        sx={{ minHeight: 40 }}
      >
        {isApplying ? 'Applying…' : 'Apply'}
      </Button>
    </Stack>
  );
}
