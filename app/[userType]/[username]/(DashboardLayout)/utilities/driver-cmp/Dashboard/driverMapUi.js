/** MUI light theme paints outlined buttons white — use these on dark map overlays. */

export const glassCard = {
  bgcolor: 'rgba(11, 11, 11, 0.92)',
  color: '#fff',
  border: '1px solid rgba(196,248,42,0.22)',
  borderRadius: 2,
  boxShadow: '0 12px 40px rgba(0, 0, 0, 0.45)',
  backdropFilter: 'blur(10px)',
}

export const driverMapActionBtn = {
  textTransform: 'none',
  fontWeight: 700,
  minHeight: 36,
}

export const driverMapPrimaryBtn = {
  ...driverMapActionBtn,
  bgcolor: '#c4f82a',
  color: '#111827',
  boxShadow: 'none',
  '&:hover': { bgcolor: '#d4ff4a', boxShadow: 'none' },
  '&.Mui-disabled': { bgcolor: 'rgba(196,248,42,0.35)', color: 'rgba(17,24,39,0.55)' },
}

export const driverMapOutlinedBtn = {
  ...driverMapActionBtn,
  color: '#F8FAFC',
  bgcolor: 'rgba(15, 23, 42, 0.6)',
  borderColor: 'rgba(255,255,255,0.45)',
  boxShadow: 'none',
  '&:hover': {
    bgcolor: 'rgba(15, 23, 42, 0.85)',
    borderColor: '#c4f82a',
    color: '#c4f82a',
    boxShadow: 'none',
  },
}

export const driverMapDangerOutlinedBtn = {
  ...driverMapActionBtn,
  color: '#FEE2E2',
  bgcolor: 'rgba(127, 29, 29, 0.45)',
  borderColor: 'rgba(248, 113, 113, 0.7)',
  boxShadow: 'none',
  '&:hover': {
    bgcolor: 'rgba(127, 29, 29, 0.65)',
    borderColor: '#FCA5A5',
    color: '#FFFFFF',
    boxShadow: 'none',
  },
}

export const driverMapGhostBtn = {
  ...driverMapActionBtn,
  color: '#CBD5E1',
  bgcolor: 'transparent',
  boxShadow: 'none',
  '&:hover': { bgcolor: 'rgba(255,255,255,0.08)', boxShadow: 'none' },
}

export const driverMapSosBtn = {
  ...driverMapActionBtn,
  bgcolor: '#EF4444',
  color: '#FFFFFF',
  boxShadow: 'none',
  '&:hover': { bgcolor: '#DC2626', boxShadow: 'none' },
}
