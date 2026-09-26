'use client'

import React, { useContext, useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  InputAdornment,
  MenuItem,
  Pagination,
  Skeleton,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material'
import { Add, DirectionsCar, EditOutlined, Search, UploadFile } from '@mui/icons-material'
import { useCreateVehicleTypeMutation, useListVehicleTypesQuery, useUpdateVehicleTypeMutation } from '@app/libs/apis/admin'
import { useFileUploader } from '@app/libs/apis/FileUploaderHook'
import { contextProvider } from '@components/AppProvider'
import { vehicleTypeImageSrc, vehicleTypeLabel } from '@utils/vehicleTypeIcon'

function useDebouncedValue(value, delay = 350) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay)
    return () => window.clearTimeout(timer)
  }, [value, delay])
  return debounced
}

const EMPTY_FORM = { id: null, vhicleType: '', description: '', isActive: true, currentImage: '', file: null }

export default function VhicleTypes() {
  const { successMessage, errorMessage } = useContext(contextProvider)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const [page, setPage] = useState(1)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const debouncedQuery = useDebouncedValue(query)
  const params = useMemo(() => ({ q: debouncedQuery, status, page, limit: 12 }), [debouncedQuery, status, page])
  const { data, error, isFetching } = useListVehicleTypesQuery(params)
  const [createType, { isLoading: creating }] = useCreateVehicleTypeMutation()
  const [updateType, { isLoading: updating }] = useUpdateVehicleTypeMutation()
  const { uploadFile, loading: uploading, error: uploadError } = useFileUploader()
  const payload = data?.data || {}
  const items = Array.isArray(payload.items) ? payload.items : []
  const summary = payload.summary || {}
  const isSaving = creating || updating || uploading

  useEffect(() => setPage(1), [debouncedQuery, status])

  function openCreate() {
    setForm(EMPTY_FORM)
    setDialogOpen(true)
  }

  function openEdit(item) {
    setForm({
      id: item.id,
      vhicleType: item.vhicle_type || '',
      description: item.disc || '',
      isActive: Boolean(item.is_active),
      currentImage: vehicleTypeImageSrc(item),
      file: null,
    })
    setDialogOpen(true)
  }

  async function save() {
    if (!form.vhicleType.trim() || !form.description.trim()) {
      errorMessage('Vehicle code and display name are required')
      return
    }
    try {
      let imageUrl = form.currentImage
      if (form.file) {
        imageUrl = await uploadFile({ file: form.file, fileName: `vehicle-type-${form.vhicleType}-${Date.now()}-${form.file.name}` })
        if (!imageUrl) throw new Error(uploadError || 'Image upload failed')
      }
      const body = {
        vhicleType: form.vhicleType.trim(),
        description: form.description.trim(),
        isActive: form.isActive,
        ...(imageUrl ? { avatar: imageUrl, mapIcon: imageUrl } : {}),
      }
      const response = form.id
        ? await updateType({ id: form.id, ...body }).unwrap()
        : await createType(body).unwrap()
      if (response?.error) throw new Error(response.message || 'Unable to save vehicle type')
      successMessage(form.id ? 'Vehicle type updated' : 'Vehicle type created')
      setDialogOpen(false)
    } catch (saveError) {
      errorMessage(saveError?.data?.message || saveError?.message || 'Unable to save vehicle type')
    }
  }

  async function toggleStatus(item) {
    try {
      const response = await updateType({ id: item.id, isActive: !item.is_active }).unwrap()
      if (response?.error) throw new Error(response.message || 'Unable to change status')
      successMessage(`${item.disc || item.vhicle_type} ${item.is_active ? 'deactivated' : 'activated'}`)
    } catch (toggleError) {
      errorMessage(toggleError?.data?.message || toggleError?.message || 'Unable to change status')
    }
  }

  const localPreview = useMemo(() => form.file ? URL.createObjectURL(form.file) : '', [form.file])
  useEffect(() => () => {
    if (localPreview) URL.revokeObjectURL(localPreview)
  }, [localPreview])
  const preview = localPreview || form.currentImage

  return (
    <Box sx={{ p: { xs: 1.5, md: 3 }, maxWidth: 1500, mx: 'auto' }}>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" gap={2} mb={3}>
        <Box><Typography variant="h4" fontWeight={850}>Vehicle types</Typography><Typography color="text.secondary">Manage rider-facing categories, icons and availability.</Typography></Box>
        <Button variant="contained" startIcon={<Add />} onClick={openCreate} sx={{ minHeight: 44 }}>Add vehicle type</Button>
      </Stack>

      <Stack direction="row" spacing={1} mb={2} flexWrap="wrap">
        <Chip icon={<DirectionsCar />} label={`${summary.total || 0} matching`} variant="outlined" />
        <Chip label={`${summary.active || 0} active`} color="success" variant="outlined" />
        <Chip label={`${summary.inactive || 0} inactive`} variant="outlined" />
      </Stack>

      <Stack component={Card} variant="outlined" direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ p: 2, mb: 2.5, borderRadius: 3 }}>
        <TextField fullWidth size="small" label="Search vehicle types" value={query} onChange={(event) => setQuery(event.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><Search /></InputAdornment> }} />
        <TextField select size="small" label="Availability" value={status} onChange={(event) => setStatus(event.target.value)} sx={{ minWidth: 180 }}>
          <MenuItem value="all">All</MenuItem><MenuItem value="active">Active</MenuItem><MenuItem value="inactive">Inactive</MenuItem>
        </TextField>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>Unable to load vehicle types.</Alert>}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 2 }}>
        {isFetching && !items.length && Array.from({ length: 8 }).map((_, index) => <Skeleton key={index} variant="rounded" height={280} sx={{ borderRadius: 3 }} />)}
        {!isFetching && !items.length && <Alert severity="info" sx={{ gridColumn: '1 / -1' }}>No vehicle types match these filters.</Alert>}
        {items.map((item) => (
          <Card key={item.id} variant="outlined" sx={{ borderRadius: 3, display: 'flex', flexDirection: 'column', minHeight: 280, transition: 'box-shadow 180ms', '&:hover': { boxShadow: 3 } }}>
            <CardContent sx={{ flex: 1 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
                <Avatar variant="rounded" src={vehicleTypeImageSrc(item)} sx={{ width: 72, height: 72, bgcolor: '#f8fafc', border: '1px solid', borderColor: 'divider' }}><DirectionsCar /></Avatar>
                <Chip size="small" label={item.is_active ? 'Active' : 'Inactive'} color={item.is_active ? 'success' : 'default'} />
              </Stack>
              <Typography variant="h6" fontWeight={800}>{item.disc || vehicleTypeLabel(item.vhicle_type)}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace' }}>{item.vhicle_type}</Typography>
              <Typography variant="body2" mt={1.5}>{item._count?.v_type || 0} registered vehicles</Typography>
            </CardContent>
            <Divider />
            <CardActions sx={{ justifyContent: 'space-between', px: 2, py: 1.5 }}>
              <FormControlLabel control={<Switch size="small" checked={Boolean(item.is_active)} onChange={() => toggleStatus(item)} disabled={updating} />} label={item.is_active ? 'Enabled' : 'Disabled'} />
              <Button size="small" startIcon={<EditOutlined />} onClick={() => openEdit(item)}>Edit</Button>
            </CardActions>
          </Card>
        ))}
      </Box>
      {(payload.metadata?.total || 0) > 12 && <Stack alignItems="center" mt={3}><Pagination page={page} count={Math.ceil(payload.metadata.total / 12)} onChange={(_, next) => setPage(next)} color="primary" /></Stack>}

      <Dialog open={dialogOpen} onClose={() => !isSaving && setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{form.id ? 'Edit vehicle type' : 'Add vehicle type'}</DialogTitle><Divider />
        <DialogContent sx={{ pt: 2.5 }}><Stack spacing={2}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar variant="rounded" src={preview} sx={{ width: 88, height: 88, bgcolor: '#f8fafc', border: '1px solid', borderColor: 'divider' }}><DirectionsCar /></Avatar>
            <Button component="label" variant="outlined" startIcon={<UploadFile />} disabled={uploading}>Choose icon<input hidden type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => setForm((current) => ({ ...current, file: event.target.files?.[0] || null }))} /></Button>
          </Stack>
          {uploadError && <Alert severity="error">{uploadError}</Alert>}
          <TextField required label="Vehicle code" helperText="Stable API value, for example BIKE_ECONOMY" value={form.vhicleType} onChange={(event) => setForm((current) => ({ ...current, vhicleType: event.target.value.toUpperCase().replace(/\s+/g, '_') }))} />
          <TextField required label="Display name" helperText="Shown to riders and drivers" value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} />
          <FormControlLabel control={<Switch checked={form.isActive} onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.checked }))} />} label="Available for new vehicle registration" />
        </Stack></DialogContent>
        <DialogActions sx={{ p: 2 }}><Button onClick={() => setDialogOpen(false)} disabled={isSaving}>Cancel</Button><Button variant="contained" onClick={save} disabled={isSaving}>{isSaving ? 'Saving…' : 'Save vehicle type'}</Button></DialogActions>
      </Dialog>
    </Box>
  )
}
