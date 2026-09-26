'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { usePathname, useRouter } from 'next/navigation';
import { defaultDashboardDateRange } from '@utils/dashboardDateRange';
import DashboardOverviewFilter from './DashboardOverviewFilter';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import {
  Activity,
  AlertTriangle,
  BadgeIndianRupee,
  Car,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  FileCheck2,
  Headphones,
  KeyRound,
  MapPinned,
  RefreshCw,
  Route,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  Users,
  WalletCards,
} from 'lucide-react';
import { useTheme } from '@mui/material/styles';
import { useGetDashboardOverviewQuery } from '@app/libs/apis/admin';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

const formatNumber = new Intl.NumberFormat('en-IN');
const formatCurrency = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

const summaryDefinitions = [
  { key: 'activeRides', label: 'Active rides', Icon: Route, tone: 'primary' },
  { key: 'completedToday', label: 'Completed today', Icon: CheckCircle2, tone: 'success' },
  { key: 'onlineDrivers', label: 'Drivers online', Icon: MapPinned, tone: 'success' },
  { key: 'totalDrivers', label: 'Total drivers', Icon: UserCheck, tone: 'info' },
  { key: 'activeCustomers', label: 'Active customers', Icon: Users, tone: 'secondary' },
  { key: 'availableVehicles', label: 'Available vehicles', Icon: Car, tone: 'warning' },
];

const attentionDefinitions = [
  { key: 'pendingDriverKyc', label: 'Driver KYC reviews', Icon: FileCheck2, tab: 'driver-onboard-ams' },
  { key: 'pendingVehicleKyc', label: 'Vehicle KYC reviews', Icon: Car, tab: 'kyc-request-approval' },
  { key: 'unassignedDrivers', label: 'Unassigned drivers', Icon: UserCheck, tab: 'assign-driver-to-owner' },
  { key: 'unpaidRides', label: 'Completed rides unpaid', Icon: WalletCards },
  { key: 'openSupportTickets', label: 'Open support tickets', Icon: Headphones },
  { key: 'openSosEvents', label: 'Open safety incidents', Icon: ShieldAlert },
];

const quickActions = [
  { label: 'Review driver onboarding', tab: 'driver-onboard-ams', Icon: FileCheck2 },
  { label: 'Assign driver to owner', tab: 'assign-driver-to-owner', Icon: UserCheck },
  { label: 'Manage users', tab: 'user-management', Icon: Users },
  { label: 'Assign roles', tab: 'assing-roles', Icon: ShieldCheck },
  { label: 'Review permissions', tab: 'user-permission-matrix', Icon: KeyRound },
  { label: 'Manage vehicle types', tab: 'vhicle-types', Icon: Car },
];

function SectionTitle({ title, subtitle }) {
  return (
    <Box>
      <Typography variant="h5" fontWeight={750}>{title}</Typography>
      {subtitle && <Typography variant="body2" color="text.secondary">{subtitle}</Typography>}
    </Box>
  );
}

function DashboardSkeleton() {
  return (
    <Stack spacing={3}>
      <Skeleton variant="rounded" height={88} />
      <Grid container spacing={2}>
        {Array.from({ length: 6 }, (_, index) => (
          <Grid item xs={12} sm={6} lg={2} key={index}>
            <Skeleton variant="rounded" height={126} />
          </Grid>
        ))}
      </Grid>
      <Skeleton variant="rounded" height={360} />
    </Stack>
  );
}

export default function AdminOperationsDashboard() {
  const theme = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const initialRange = defaultDashboardDateRange();
  const [appliedRange, setAppliedRange] = useState(initialRange);
  const [draftFrom, setDraftFrom] = useState(initialRange.fromDate);
  const [draftTo, setDraftTo] = useState(initialRange.toDate);

  const { data: response, isLoading, isFetching, isError, refetch } = useGetDashboardOverviewQuery(
    appliedRange,
  );
  const dashboard = response?.data;

  const applyDateFilter = () => {
    setAppliedRange({ fromDate: draftFrom, toDate: draftTo });
  };

  const navigateTo = (tab) => {
    if (tab) router.push(`${pathname}?tabs=${tab}`);
  };

  if (isLoading) return <DashboardSkeleton />;

  if (isError || !dashboard) {
    return (
      <Alert
        severity="error"
        action={<Button color="inherit" onClick={refetch}>Retry</Button>}
      >
        The operational dashboard could not be loaded.
      </Alert>
    );
  }

  const trend = Array.isArray(dashboard.trend) ? dashboard.trend : [];
  const trendChartOptions = {
    chart: { toolbar: { show: false }, zoom: { enabled: false } },
    colors: [theme.palette.primary.main, theme.palette.success.main],
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: [3, 2] },
    fill: {
      type: ['gradient', 'solid'],
      gradient: { opacityFrom: 0.35, opacityTo: 0.04 },
    },
    grid: { borderColor: theme.palette.divider, strokeDashArray: 4 },
    xaxis: {
      categories: trend.map((item) => item.label),
      labels: { style: { colors: theme.palette.text.secondary } },
    },
    yaxis: { min: 0, forceNiceScale: true },
    legend: { position: 'top', horizontalAlign: 'right' },
    tooltip: { theme: theme.palette.mode },
  };
  const trendSeries = [
    { name: 'Rides', type: 'area', data: trend.map((item) => item.rides) },
    { name: 'Completed', type: 'line', data: trend.map((item) => item.completed) },
  ];

  const rideStatus = dashboard.rideStatus || {};
  const rideStatusLabels = ['Active', 'Completed', 'Scheduled', 'Cancelled'];
  const rideStatusSeries = [
    rideStatus.active || 0,
    rideStatus.completed || 0,
    rideStatus.scheduled || 0,
    rideStatus.cancelled || 0,
  ];
  const rideStatusOptions = {
    labels: rideStatusLabels,
    colors: [
      theme.palette.primary.main,
      theme.palette.success.main,
      theme.palette.info.main,
      theme.palette.error.main,
    ],
    legend: { position: 'bottom' },
    dataLabels: { enabled: false },
    stroke: { colors: [theme.palette.background.paper], width: 3 },
    tooltip: { theme: theme.palette.mode },
  };

  return (
    <Stack spacing={3.5}>
      <Paper
        variant="outlined"
        sx={{
          p: { xs: 2, md: 3 },
          borderRadius: 3,
          background: `linear-gradient(135deg, ${theme.palette.background.paper}, ${theme.palette.action.hover})`,
        }}
      >
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={2}>
          <Box>
            <Typography variant="overline" color="primary.main" fontWeight={800}>
              Operations control centre
            </Typography>
            <Typography variant="h3" fontWeight={800} sx={{ mt: 0.25 }}>
              Welcome, {dashboard.viewer?.username || 'Administrator'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
              Live business snapshot generated {new Date(dashboard.generatedAt).toLocaleString()}.
            </Typography>
          </Box>
          <Stack spacing={1.5} alignItems={{ xs: 'stretch', sm: 'flex-end' }}>
            <DashboardOverviewFilter
              fromDate={draftFrom}
              toDate={draftTo}
              onFromDateChange={setDraftFrom}
              onToDateChange={setDraftTo}
              onApply={applyDateFilter}
              isApplying={isFetching}
            />
            <Button
              variant="outlined"
              startIcon={<RefreshCw size={17} />}
              onClick={refetch}
              disabled={isFetching}
              sx={{ alignSelf: { xs: 'stretch', sm: 'flex-end' }, minHeight: 44 }}
            >
              {isFetching ? 'Refreshing…' : 'Refresh'}
            </Button>
          </Stack>
        </Stack>
      </Paper>

      <Box component="section" aria-labelledby="operations-summary">
        <SectionTitle title="Operations summary" subtitle="Current activity across rides, drivers, customers and vehicles." />
        <Grid container spacing={2} sx={{ mt: 0.25 }}>
          {summaryDefinitions.map(({ key, label, Icon, tone }) => (
            <Grid item xs={12} sm={6} md={4} lg={2} key={key}>
              <Card variant="outlined" sx={{ height: '100%', borderRadius: 3 }}>
                <CardContent>
                  <Box
                    sx={{
                      display: 'inline-flex',
                      p: 1,
                      borderRadius: 2,
                      color: `${tone}.main`,
                      bgcolor: `${tone}.light`,
                    }}
                  >
                    <Icon size={20} aria-hidden="true" />
                  </Box>
                  <Typography variant="h4" fontWeight={800} sx={{ mt: 1.5 }}>
                    {formatNumber.format(dashboard.summary?.[key] || 0)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">{label}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Card variant="outlined" sx={{ height: '100%', borderRadius: 3 }}>
            <CardContent>
              <SectionTitle
                title="Ride activity"
                subtitle={
                  dashboard.range
                    ? `Bookings vs completed rides (${dashboard.range.fromDate} → ${dashboard.range.toDate}).`
                    : 'Bookings compared with completed rides.'
                }
              />
              <Box sx={{ minHeight: 310, mt: 1 }}>
                <Chart options={trendChartOptions} series={trendSeries} type="line" height={310} width="100%" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} lg={4}>
          <Card variant="outlined" sx={{ height: '100%', borderRadius: 3 }}>
            <CardContent>
              <SectionTitle title="Ride status mix" subtitle="For the selected period." />
              <Box sx={{ minHeight: 310, mt: 1 }}>
                <Chart options={rideStatusOptions} series={rideStatusSeries} type="donut" height={310} width="100%" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box component="section" aria-labelledby="attention-required">
        <Stack direction="row" alignItems="center" spacing={1}>
          <AlertTriangle size={21} color={theme.palette.warning.main} aria-hidden="true" />
          <SectionTitle title="Attention required" subtitle="Items that may need an administrator decision." />
        </Stack>
        <Grid container spacing={2} sx={{ mt: 0.25 }}>
          {attentionDefinitions.map(({ key, label, Icon, tab }) => {
            const count = dashboard.attention?.[key] || 0;
            return (
              <Grid item xs={12} sm={6} md={4} key={key}>
                <Paper
                  variant="outlined"
                  component={tab ? 'button' : 'div'}
                  onClick={() => navigateTo(tab)}
                  sx={{
                    width: '100%',
                    p: 2,
                    borderRadius: 3,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    textAlign: 'left',
                    font: 'inherit',
                    color: 'text.primary',
                    cursor: tab ? 'pointer' : 'default',
                    bgcolor: count > 0 ? 'warning.light' : 'background.paper',
                    '&:hover': tab ? { borderColor: 'primary.main' } : undefined,
                  }}
                >
                  <Icon size={21} aria-hidden="true" />
                  <Box sx={{ flex: 1 }}>
                    <Typography fontWeight={700}>{label}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {count > 0 ? 'Review recommended' : 'Nothing pending'}
                    </Typography>
                  </Box>
                  <Chip label={formatNumber.format(count)} color={count > 0 ? 'warning' : 'default'} />
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={5}>
          <Card variant="outlined" sx={{ height: '100%', borderRadius: 3 }}>
            <CardContent>
              <SectionTitle title="Revenue and payments" subtitle="Fare totals for rides booked in the selected period." />
              <Stack spacing={2.25} sx={{ mt: 2.5 }}>
                <Stack direction="row" justifyContent="space-between">
                  <Stack direction="row" spacing={1} alignItems="center">
                    <CircleDollarSign size={19} aria-hidden="true" />
                    <Typography color="text.secondary">Gross bookings</Typography>
                  </Stack>
                  <Typography fontWeight={800}>{formatCurrency.format(dashboard.finance?.grossBookingsToday || 0)}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Stack direction="row" spacing={1} alignItems="center">
                    <BadgeIndianRupee size={19} aria-hidden="true" />
                    <Typography color="text.secondary">Paid revenue</Typography>
                  </Stack>
                  <Typography fontWeight={800} color="success.main">
                    {formatCurrency.format(dashboard.finance?.paidRevenueToday || 0)}
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Clock3 size={19} aria-hidden="true" />
                    <Typography color="text.secondary">Outstanding</Typography>
                  </Stack>
                  <Typography fontWeight={800} color="warning.main">
                    {formatCurrency.format(dashboard.finance?.outstandingToday || 0)}
                  </Typography>
                </Stack>
                <Divider />
                <Box>
                  <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                    <Typography variant="body2">Payment collection rate</Typography>
                    <Typography variant="body2" fontWeight={800}>
                      {dashboard.finance?.paymentSuccessRate || 0}%
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(100, dashboard.finance?.paymentSuccessRate || 0)}
                    sx={{ height: 9, borderRadius: 8 }}
                  />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={7}>
          <Card variant="outlined" sx={{ height: '100%', borderRadius: 3 }}>
            <CardContent>
              <SectionTitle title="Recent activity" subtitle="Latest rides and newly registered users." />
              <List disablePadding sx={{ mt: 1.5 }}>
                {(dashboard.recentActivity || []).map((item, index) => (
                  <Box key={item.id}>
                    <ListItem disableGutters>
                      <ListItemIcon sx={{ minWidth: 38 }}>
                        {item.type === 'ride'
                          ? <Route size={19} aria-hidden="true" />
                          : <Users size={19} aria-hidden="true" />}
                      </ListItemIcon>
                      <ListItemText
                        primary={item.title}
                        secondary={`${item.detail} · ${new Date(item.occurredAt).toLocaleString()}`}
                        primaryTypographyProps={{ fontWeight: 700 }}
                        secondaryTypographyProps={{ noWrap: true }}
                      />
                      <Stack alignItems="flex-end" spacing={0.5} sx={{ ml: 1 }}>
                        <Chip label={item.status} size="small" variant="outlined" />
                        {item.amount != null && (
                          <Typography variant="caption" fontWeight={700}>
                            {formatCurrency.format(item.amount)}
                          </Typography>
                        )}
                      </Stack>
                    </ListItem>
                    {index < dashboard.recentActivity.length - 1 && <Divider />}
                  </Box>
                ))}
                {!dashboard.recentActivity?.length && (
                  <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                    No recent activity.
                  </Typography>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {dashboard.viewer?.isSuperAdmin && dashboard.governance && (
        <Card variant="outlined" sx={{ borderRadius: 3 }}>
          <CardContent>
            <Stack direction="row" spacing={1} alignItems="center">
              <ShieldCheck size={22} aria-hidden="true" />
              <SectionTitle title="Superadmin governance" subtitle="Current access-control configuration." />
            </Stack>
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              {[
                ['Active roles', dashboard.governance.activeRoles],
                ['Capabilities', dashboard.governance.capabilities],
                ['Permissions', dashboard.governance.permissions],
              ].map(([label, value]) => (
                <Grid item xs={12} sm={4} key={label}>
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 2.5 }}>
                    <Typography variant="h4" fontWeight={800}>{formatNumber.format(value || 0)}</Typography>
                    <Typography variant="body2" color="text.secondary">{label}</Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}

      <Card variant="outlined" sx={{ borderRadius: 3 }}>
        <CardContent>
          <Stack direction="row" spacing={1} alignItems="center">
            <Activity size={22} aria-hidden="true" />
            <SectionTitle title="Quick actions" subtitle="Common operational and access-management tasks." />
          </Stack>
          <Grid container spacing={1.5} sx={{ mt: 0.75 }}>
            {quickActions.map(({ label, tab, Icon }) => (
              <Grid item xs={12} sm={6} md={4} key={tab}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<Icon size={18} aria-hidden="true" />}
                  onClick={() => navigateTo(tab)}
                  sx={{ justifyContent: 'flex-start', minHeight: 48 }}
                >
                  {label}
                </Button>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    </Stack>
  );
}
