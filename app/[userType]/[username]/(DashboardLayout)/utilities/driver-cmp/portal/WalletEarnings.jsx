'use client'

import React, { useContext, useMemo, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Chip,
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
import { contextProvider } from '@components/AppProvider'
import { getUserInfo } from '@utils'
import { getCookie } from '@node_modules/cookies-next/lib'
import { SWC_KEYS } from '@constants'
import {
  useBuyDriverPackMutation,
  useConfirmRechargeMutation,
  useCreateRechargeIntentMutation,
  useGetDriverEntitlementQuery,
  useGetDriverLedgerQuery,
  useGetDriverSubscriptionsQuery,
  useGetDriverWalletQuery,
  useGetWalletPlansQuery,
} from '@app/libs/apis/wallet'

const QUICK_RUPEES = [100, 200, 500, 1000]

function paiseToRupees(value) {
  const n = Number(value)
  if (!Number.isFinite(n)) return 0
  return n / 100
}

function formatInr(paise) {
  return paiseToRupees(paise).toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  })
}

function idFromJwt() {
  try {
    const token = String(getCookie(SWC_KEYS.SWC_TOKEN) || '')
    const part = token.split('.')[1]
    if (!part) return ''
    const padded = part.replace(/-/g, '+').replace(/_/g, '/')
    const payload = JSON.parse(atob(padded))
    const id = payload?.id ?? payload?.userId
    return id != null ? String(id) : ''
  } catch {
    return ''
  }
}

function driverIdFromSession() {
  try {
    const user = getUserInfo()
    const id = user?.id ?? user?.userId
    if (id != null) return String(id)
  } catch {
    /* cookie missing */
  }
  return idFromJwt()
}

function planFeeLabel(plan) {
  const model = plan?.feeModel
  if (model === 'fixed_per_ride') {
    return `${formatInr(plan.perRideFeePaise)} per ride`
  }
  if (model === 'subscription') {
    const days = Number(plan.durationDays) || 0
    const window = days === 1 ? 'day' : days === 7 ? 'week' : days === 30 ? 'month' : `${days} days`
    return `${formatInr(plan.pricePaise)} / ${window} · 0% commission`
  }
  const bps = Number(plan?.commissionBps) || 0
  return `${bps / 100}% per ride · no upfront fee`
}

function entitlementLabel(entitlement) {
  if (!entitlement) return 'Flex · 16% per ride'
  if (entitlement.feeModel === 'fixed_per_ride') {
    return `${entitlement.planName || 'Saver'} · ${formatInr(entitlement.perRideFeePaise)} / ride`
  }
  if (entitlement.feeModel === 'subscription' && entitlement.planActive) {
    return `${entitlement.planName} · 0% commission`
  }
  return `${entitlement.planName || 'Flex'} · ${(Number(entitlement.commissionBps) || 1600) / 100}% per ride`
}

function inPeriod(iso, period) {
  if (!iso) return false
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return false
  const now = new Date()
  if (period === 'day') {
    return d.toDateString() === now.toDateString()
  }
  if (period === 'month') {
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }
  return true
}

function loadRazorpay() {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && window.Razorpay) {
      resolve(true)
      return
    }
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

function openRazorpayCheckout({ order, key, onPaid, onDismiss }) {
  const Razorpay = window.Razorpay
  if (!Razorpay || !order?.id) {
    onDismiss()
    return
  }
  const checkout = new Razorpay({
    key,
    amount: order.amount,
    currency: order.currency || 'INR',
    order_id: order.id,
    name: 'SwiftCab wallet',
    description: 'Driver recharge',
    handler: (response) => onPaid(response),
    modal: { ondismiss: onDismiss },
  })
  checkout.open()
}

function WalletEarnings({ title, body, period = 'all' }) {
  const { successMessage, errorMessage } = useContext(contextProvider)
  const driverId = driverIdFromSession()
  const [rupees, setRupees] = useState('200')
  const [busy, setBusy] = useState(false)

  const walletQ = useGetDriverWalletQuery(driverId, { skip: !driverId })
  const ledgerQ = useGetDriverLedgerQuery(driverId, { skip: !driverId })
  const plansQ = useGetWalletPlansQuery(undefined, { skip: !driverId })
  const entitlementQ = useGetDriverEntitlementQuery(driverId, { skip: !driverId })
  const subsQ = useGetDriverSubscriptionsQuery(driverId, { skip: !driverId })
  const [createIntent] = useCreateRechargeIntentMutation()
  const [confirmRecharge] = useConfirmRechargeMutation()
  const [buyPack, { isLoading: buying }] = useBuyDriverPackMutation()

  const wallet = walletQ.data
  const entitlement = entitlementQ.data
  const plans = Array.isArray(plansQ.data) ? plansQ.data : []
  const subscriptions = Array.isArray(subsQ.data) ? subsQ.data : []
  const entries = useMemo(() => {
    const list = ledgerQ.data?.entries
    if (!Array.isArray(list)) return []
    return list.filter((row) => inPeriod(row.createdAt, period))
  }, [ledgerQ.data, period])

  const periodTotal = entries
    .filter((row) => row.refType === 'earning')
    .reduce((sum, row) => sum + Number(row.amountPaise || 0), 0)

  const recharge = async (amountRupees) => {
    const amountPaise = Math.round(Number(amountRupees) * 100)
    if (!driverId || !Number.isFinite(amountPaise) || amountPaise < 100) {
      errorMessage('Enter at least ₹1')
      return
    }
    setBusy(true)
    try {
      const intent = await createIntent({ id: driverId, amountPaise }).unwrap()
      const order = intent?.order
      const orderId = order?.id
      if (!orderId) throw new Error('Payment order missing')

      const finish = async (razorpay) => {
        await confirmRecharge({ id: driverId, orderId, razorpay }).unwrap()
        successMessage('Wallet credited')
      }

      const key = intent.razorpayKeyId || process.env.NEXT_PUBLIC_API_RAZOR_KEY_ID
      const useGateway = intent.provider === 'razorpay' && key
      if (useGateway) {
        const ok = await loadRazorpay()
        if (!ok) {
          await finish(undefined)
          return
        }
        await new Promise((resolve, reject) => {
          openRazorpayCheckout({
            order,
            key,
            onPaid: async (response) => {
              try {
                await finish({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                })
                resolve()
              } catch (err) {
                reject(err)
              }
            },
            onDismiss: () => resolve(),
          })
        })
      } else {
        await finish(undefined)
      }
    } catch (err) {
      const msg = err?.data?.message || err?.message || 'Recharge failed'
      errorMessage(typeof msg === 'string' ? msg : 'Recharge failed')
    } finally {
      setBusy(false)
    }
  }

  const onBuyPack = async (planId) => {
    if (!driverId) return
    try {
      await buyPack({ id: driverId, planId }).unwrap()
      successMessage('Plan updated')
    } catch (err) {
      const msg = err?.data?.message || err?.message || 'Could not update plan'
      errorMessage(typeof msg === 'string' ? msg : 'Could not update plan')
    }
  }

  if (!driverId) {
    return (
      <Alert severity="warning">Sign in again to load this driver wallet.</Alert>
    )
  }

  return (
    <>
      <Typography variant="h5" sx={{ mb: 1 }}>{title}</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 640 }}>
        {body}
      </Typography>

      <Stack spacing={2.5}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 3, flex: 1 }}>
            <Typography variant="overline" color="text.secondary">Available</Typography>
            <Typography variant="h4">{formatInr(wallet?.availablePaise)}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Dues {formatInr(wallet?.pendingPaise)}
            </Typography>
          </Paper>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 3, flex: 1 }}>
            <Typography variant="overline" color="text.secondary">Active plan</Typography>
            <Typography variant="h5">
              {entitlementLabel(entitlement)}
            </Typography>
            {entitlement?.expiresAt && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Pack ends {new Date(entitlement.expiresAt).toLocaleString('en-IN')}
              </Typography>
            )}
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              This view {formatInr(periodTotal)}
            </Typography>
          </Paper>
        </Stack>

        <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>Recharge wallet</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Pay in with UPI / Razorpay. Credit lands in this wallet, not the old BO balance.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'center' }}>
            <TextField
              label="Amount (₹)"
              type="number"
              value={rupees}
              onChange={(event) => setRupees(event.target.value)}
              sx={{ maxWidth: 180 }}
              inputProps={{ min: 1, step: 1 }}
            />
            <Button variant="contained" disabled={busy} onClick={() => recharge(rupees)}>
              {busy ? 'Processing…' : 'Recharge'}
            </Button>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {QUICK_RUPEES.map((amt) => (
                <Chip
                  key={amt}
                  label={`₹${amt}`}
                  onClick={() => setRupees(String(amt))}
                  variant="outlined"
                />
              ))}
            </Stack>
          </Stack>
        </Paper>

        <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>Driver plans</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Flex is the default. Paid passes debit this wallet and replace any current plan (no refund, no auto-renew).
          </Typography>
          <Stack spacing={1.5}>
            {plans.length === 0 && (
              <Typography color="text.secondary">No plans are on sale yet.</Typography>
            )}
            {plans.map((plan) => {
              const current = entitlement?.planCode === plan.code
              const paid = Number(plan.pricePaise) > 0
              return (
                <Box
                  key={plan.id}
                  sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 1.5,
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    border: '1px solid',
                    borderColor: current ? 'secondary.main' : 'divider',
                    borderRadius: 2,
                    px: 2,
                    py: 1.5,
                    bgcolor: current ? 'rgba(196,248,42,0.18)' : '#fff',
                  }}
                >
                  <Box sx={{ maxWidth: 520 }}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.25 }}>
                      <Typography fontWeight={700}>{plan.name}</Typography>
                      {current && <Chip size="small" label="Current" color="success" />}
                      {plan.isDefault && !current && <Chip size="small" label="Default" variant="outlined" />}
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                      {planFeeLabel(plan)}
                    </Typography>
                    {plan.blurb && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        {plan.blurb}
                      </Typography>
                    )}
                    {plan.suitedFor && (
                      <Typography variant="caption" color="text.secondary">
                        Best for: {plan.suitedFor}
                      </Typography>
                    )}
                  </Box>
                  <Button
                    variant={paid ? 'contained' : 'outlined'}
                    disabled={buying || current}
                    onClick={() => onBuyPack(plan.id)}
                  >
                    {current ? 'Selected' : paid ? `Buy ${formatInr(plan.pricePaise)}` : 'Select'}
                  </Button>
                </Box>
              )
            })}
          </Stack>
          {subscriptions.filter((row) => row.status === 'active').length > 0 && (
            <Alert severity="success" sx={{ mt: 2 }}>
              {subscriptions[0].plan?.name || 'Plan'} active
              {subscriptions[0].expiresAt
                ? ` until ${new Date(subscriptions[0].expiresAt).toLocaleString('en-IN')}`
                : ''}
            </Alert>
          )}
        </Paper>

        <Paper elevation={3} sx={{ p: 3, borderRadius: 3, overflow: 'auto' }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Ledger</Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>When</TableCell>
                <TableCell>Type</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell>Note</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {entries.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4}>
                    <Typography color="text.secondary">No movements in this period.</Typography>
                  </TableCell>
                </TableRow>
              )}
              {entries.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{new Date(row.createdAt).toLocaleString('en-IN')}</TableCell>
                  <TableCell>{row.refType || row.type}</TableCell>
                  <TableCell align="right">{formatInr(row.amountPaise)}</TableCell>
                  <TableCell>{row.note || '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </Stack>
    </>
  )
}

export default WalletEarnings
