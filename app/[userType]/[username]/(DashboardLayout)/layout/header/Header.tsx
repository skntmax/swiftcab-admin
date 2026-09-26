import React from 'react'
import { Box, AppBar, Toolbar, Stack, IconButton, Badge, Typography } from '@mui/material'
import Profile from './Profile'
import { BellRing, Menu } from 'lucide-react'
import { getUserInfo } from '@utils'
import DriverSocketMarker from '@components/Socket/DriverSocketMarker'
import { useSearchParams } from 'next/navigation'

type HeaderProps = {
  toggleMobileSidebar: (event: React.MouseEvent<HTMLElement>) => void
  showSocketMarker: boolean
  roleSlug?: string
}

const TAB_LABELS: Record<string, string> = {
  'driver/dashboard/summary': 'Dashboard',
  'driver/dashboard/notifications': 'Notifications',
  'driver/my-rides/upcoming': 'Upcoming rides',
  'driver/my-rides/completed': 'Completed rides',
  'driver/my-rides/cancelled': 'Cancelled rides',
  'driver/earnings/daily': 'Daily earnings',
  'driver/earnings/monthly': 'Monthly earnings',
  'driver/earnings/history': 'Payment history',
  'driver/ride-history/all': 'Ride history',
  'driver/ride-history/filter': 'Filter rides',
  'driver/profile/view': 'Profile',
  'driver/profile/edit': 'Edit profile',
  'driver/profile/password': 'Change password',
  'driver/documents/upload': 'Upload documents',
  'driver/documents/view': 'View documents',
  'driver/documents/status': 'Document status',
  'driver/support/contact': 'Contact support',
  'driver/support/faqs': 'FAQs',
  'add-vhicles': 'Add vehicle',
  'registered-vhicles': 'Registered vehicles',
  'add-vhicles-services': 'Vehicle services',
  'vhicles-services': 'Occupied services',
  'kyc-update': 'KYC',
  'today-rides': 'Today rides',
  'all-rides': 'All rides',
  'occupied-drivers': 'Occupied drivers',
  'assign-self-driver': 'Assign driver',
  'assign-driver-to-owner': 'Assign driver to owner',
}

const ROLE_LABELS: Record<string, string> = {
  'driver-partner': 'Driver',
  owner: 'Owner',
  admin: 'Admin',
  customer: 'Customer',
}

function titleFromTabs(tabs: string | null, roleSlug: string): string {
  if (!tabs) {
    return roleSlug === 'driver-partner' ? 'On duty' : 'Home'
  }
  if (TAB_LABELS[tabs]) return TAB_LABELS[tabs]
  const last = tabs.split('/').filter(Boolean).slice(-1)[0] || tabs
  return last.replace(/-/g, ' ')
}

function roleLabel(roleSlug: string): string {
  return ROLE_LABELS[roleSlug] || roleSlug.replace(/-/g, ' ')
}

const Header = ({ toggleMobileSidebar, showSocketMarker, roleSlug = '' }: HeaderProps) => {
  const { username } = getUserInfo()
  const params = useSearchParams()
  const title = titleFromTabs(params.get('tabs')?.trim() || null, roleSlug)

  return (
    <AppBar
      position="sticky"
      color="default"
      elevation={0}
      sx={{
        boxShadow: 'none',
        background: '#0b0b0b',
        justifyContent: 'center',
        backdropFilter: 'blur(4px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        minHeight: { lg: '70px' },
      }}
    >
      <Toolbar sx={{ width: '100%', color: '#F8FAFC' }}>
        <IconButton
          color="inherit"
          aria-label="Open navigation"
          onClick={toggleMobileSidebar}
          sx={{ display: { lg: 'none', xs: 'inline-flex' } }}
        >
          <Menu size={20} />
        </IconButton>
        <Box sx={{ mr: 2, minWidth: 0 }}>
          <Typography
            component="p"
            sx={{ fontSize: 11, letterSpacing: 0.4, color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase' }}
          >
            {roleLabel(roleSlug)}
          </Typography>
          <Typography component="p" sx={{ fontSize: 16, fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>
            {title}
          </Typography>
        </Box>
        <IconButton size="large" aria-label="Notifications" color="inherit">
          <Badge
            variant="dot"
            color="primary"
            sx={{ '& .MuiBadge-badge': { backgroundColor: '#c4f82a' } }}
          >
            <BellRing size={21} strokeWidth={1.5} />
          </Badge>
        </IconButton>
        <Box flexGrow={1} />
        <Stack spacing={1} direction="row" alignItems="center">
          {showSocketMarker ? <DriverSocketMarker /> : null}
          <Profile username={username} />
        </Stack>
      </Toolbar>
    </AppBar>
  )
}

export default Header
