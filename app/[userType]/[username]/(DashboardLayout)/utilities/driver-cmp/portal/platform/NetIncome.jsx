'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Button,
  Grid,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'
import { useDriverPlatformGetMutation, useDriverPlatformSaveMutation } from '@app/libs/apis/driver'
import { useGetDriverLedgerQuery } from '@app/libs/apis/wallet'
import { getUserInfo } from '@utils'
import { EstimateNote, PlatformChrome, StatTile } from './PlatformChrome'

function sessionDriverId() {
  try {
    const user = getUserInfo()
    const id = user?.id ?? user?.userId
    return id != null ? String(id) : ''
  } catch {
    return ''
  }
}

function csvCell(value) {
  const text = String(value ?? '')
  if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`
  return text
}

function downloadCsv(filename, rows) {
  const body = rows.map((row) => row.map(csvCell).join(',')).join('\n')
  const blob = new Blob([body], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

function NetIncome() {
  const pathname = usePathname()
  const driverId = sessionDriverId()
  const ledgerQ = useGetDriverLedgerQuery(driverId, { skip: !driverId })
  const [load] = useDriverPlatformGetMutation()
  const [save, { isLoading: saving }] = useDriverPlatformSaveMutation()
  const [net, setNet] = useState(null)
  const [expenses, setExpenses] = useState([])
  const [savings, setSavings] = useState(null)
  const [form, setForm] = useState({ category: 'fuel', amountRupees: '', note: '' })
  const [payout, setPayout] = useState('500')
  const ledger = Array.isArray(ledgerQ.data?.entries)
    ? ledgerQ.data.entries
    : Array.isArray(ledgerQ.data?.data?.entries)
      ? ledgerQ.data.data.entries
      : []

  const refresh = async () => {
    const [n, e, s] = await Promise.all([
      load({ path: 'net-income' }).unwrap(),
      load({ path: 'expenses' }).unwrap(),
      load({ path: 'savings' }).unwrap(),
    ])
    setNet(n?.data || n)
    setExpenses(Array.isArray(e?.data) ? e.data : Array.isArray(e) ? e : [])
    setSavings(s?.data || s)
  }

  useEffect(() => {
    refresh().catch(() => {})
  }, [])

  return (
    <PlatformChrome
      title="Net income"
      body="Gross trip fare minus the expenses you log and the active commission plan. Illustrative — not a tax statement."
    >
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}><StatTile label="Gross today" value={`₹${net?.grossRupees ?? 0}`} /></Grid>
        <Grid item xs={12} sm={6} md={3}><StatTile label="Expenses" value={`₹${net?.expensesRupees ?? 0}`} /></Grid>
        <Grid item xs={12} sm={6} md={3}><StatTile label="Platform fee" value={`₹${net?.platformFeeRupees ?? 0}`} hint={`${net?.planName || 'Flex'} · ${net?.feeModel || 'commission'}`} /></Grid>
        <Grid item xs={12} sm={6} md={3}><StatTile label="Estimated net" value={`₹${net?.estimatedNetRupees ?? 0}`} /></Grid>
      </Grid>
      <Stack direction="row" spacing={1} sx={{ mt: 2 }} useFlexGap flexWrap="wrap">
        <Button
          variant="outlined"
          onClick={() => {
            const rows = [
              ['section', 'when', 'category', 'amount_rupees', 'note'],
              ['summary', 'today', 'gross', net?.grossRupees ?? 0, 'trip fare'],
              ['summary', 'today', 'expenses', net?.expensesRupees ?? 0, 'logged costs'],
              ['summary', 'today', 'platform_fee', net?.platformFeeRupees ?? 0, net?.planName],
              ['summary', 'today', 'estimated_net', net?.estimatedNetRupees ?? 0, 'illustrative'],
              ...expenses.map((row) => ['expense', String(row.occurred_on).slice(0, 10), row.category, row.amount_rupees, row.note || '']),
              ...ledger.slice(0, 50).map((row) => [
                'ledger',
                row.createdAt ? new Date(row.createdAt).toISOString() : '',
                row.refType || row.type || '',
                Number(row.amountPaise || 0) / 100,
                row.note || row.refId || '',
              ]),
            ]
            downloadCsv(`swc-driver-statement-${new Date().toISOString().slice(0, 10)}.csv`, rows)
          }}
        >
          Download statement
        </Button>
        <Button component={Link} href={`${pathname}?tabs=driver/earnings/daily`} variant="text">
          Wallet ledger & recharge
        </Button>
      </Stack>

      <Paper elevation={3} sx={{ p: 2.5, borderRadius: 2, mt: 2 }}>
        <Typography fontWeight={700}>Log an operating cost</Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 1.5 }}>
          <TextField select label="Category" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} sx={{ minWidth: 160 }}>
            <MenuItem value="fuel">Fuel</MenuItem>
            <MenuItem value="maintenance">Maintenance</MenuItem>
            <MenuItem value="toll">Toll</MenuItem>
            <MenuItem value="parking">Parking</MenuItem>
            <MenuItem value="other">Other</MenuItem>
          </TextField>
          <TextField label="Amount ₹" type="number" value={form.amountRupees} onChange={(e) => setForm((f) => ({ ...f, amountRupees: e.target.value }))} />
          <TextField label="Note" value={form.note} onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))} />
          <Button
            variant="contained"
            disabled={saving}
            onClick={async () => {
              await save({ path: 'expenses', body: { ...form, amountRupees: Number(form.amountRupees) } }).unwrap()
              setForm((f) => ({ ...f, amountRupees: '', note: '' }))
              refresh()
            }}
          >
            Add
          </Button>
        </Stack>
        <Table size="small" sx={{ mt: 2 }}>
          <TableHead>
            <TableRow>
              <TableCell>When</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Note</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {expenses.slice(0, 12).map((row) => (
              <TableRow key={row.id}>
                <TableCell>{String(row.occurred_on).slice(0, 10)}</TableCell>
                <TableCell>{row.category}</TableCell>
                <TableCell>₹{row.amount_rupees}</TableCell>
                <TableCell>{row.note || '—'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <Paper elevation={3} sx={{ p: 2.5, borderRadius: 2, mt: 2 }}>
        <Typography fontWeight={700}>Savings targets</Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 1.5 }}>
          <TextField label="Daily ₹" type="number" value={savings?.dailyTargetRupees ?? 2000} onChange={(e) => setSavings((s) => ({ ...s, dailyTargetRupees: Number(e.target.value) }))} />
          <TextField label="Weekly ₹" type="number" value={savings?.weeklyTargetRupees ?? 12000} onChange={(e) => setSavings((s) => ({ ...s, weeklyTargetRupees: Number(e.target.value) }))} />
          <TextField label="Emergency fund ₹" type="number" value={savings?.emergencyFundRupees ?? 0} onChange={(e) => setSavings((s) => ({ ...s, emergencyFundRupees: Number(e.target.value) }))} />
          <Button variant="contained" disabled={saving} onClick={() => save({ path: 'savings', method: 'PUT', body: savings })}>Save goals</Button>
        </Stack>
        <Typography variant="body2" sx={{ mt: 1 }}>
          Today ₹{savings?.todayFare ?? 0} / ₹{savings?.dailyTargetRupees ?? 0} · Week ₹{savings?.weekFare ?? 0} / ₹{savings?.weeklyTargetRupees ?? 0}
        </Typography>
      </Paper>

      <Paper elevation={3} sx={{ p: 2.5, borderRadius: 2, mt: 2, overflow: 'auto' }}>
        <Typography fontWeight={700}>Wallet ledger</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Credits and debits from swc-wallet. Ride refs appear in the note when the trip service posted them.
        </Typography>
        <Table size="small" sx={{ mt: 1.5 }}>
          <TableHead>
            <TableRow>
              <TableCell>When</TableCell>
              <TableCell>Reason</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Note</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {ledger.slice(0, 12).map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.createdAt ? new Date(row.createdAt).toLocaleString('en-IN') : '—'}</TableCell>
                <TableCell>{row.refType || row.type || '—'}</TableCell>
                <TableCell>₹{(Number(row.amountPaise || 0) / 100).toFixed(2)}</TableCell>
                <TableCell>{row.note || row.refId || '—'}</TableCell>
              </TableRow>
            ))}
            {ledger.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4}>No wallet movements yet.</TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </Paper>

      <Paper elevation={3} sx={{ p: 2.5, borderRadius: 2, mt: 2 }}>
        <Typography fontWeight={700}>Flexible payout</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Queue a settlement to the verified bank account. Minimum ₹100. This is not instant UPI unless operations pays the settlement.
        </Typography>
        <Stack direction="row" spacing={1.5} sx={{ mt: 1.5 }} alignItems="center">
          <TextField label="Amount ₹" type="number" value={payout} onChange={(e) => setPayout(e.target.value)} sx={{ width: 160 }} />
          <Button
            variant="contained"
            disabled={saving}
            onClick={async () => {
              try {
                const res = await save({
                  path: 'payout',
                  body: { amountPaise: Math.round(Number(payout) * 100) },
                }).unwrap()
                const payload = res?.data || res
                window.alert(payload?.message || 'Payout queued for the next settlement cycle.')
              } catch (err) {
                window.alert(err?.data?.message || err?.data?.data || 'Payout could not be queued.')
              }
            }}
          >
            Request payout
          </Button>
        </Stack>
      </Paper>
      <EstimateNote text={net?.disclaimer} />
    </PlatformChrome>
  )
}

export default NetIncome
