'use client'
import React, { useContext, useEffect } from 'react'
import { Box, Button, Paper, Stack, TextField, Typography } from '@mui/material'
import { useDriverDetailsMutation, useUpdateDriverAccountMutation } from '@app/libs/apis/driver'
import { contextProvider } from '@components/AppProvider'

function EditDriverProfile() {
  const { successMessage, errorMessage } = useContext(contextProvider)
  const [getDriverDetails, { data }] = useDriverDetailsMutation()
  const [updateAccount, { data: updateData, isLoading }] = useUpdateDriverAccountMutation()
  const [form, setForm] = React.useState({ first_name: '', last_name: '', phone_no: '', email: '' })

  useEffect(() => {
    getDriverDetails()
  }, [])

  useEffect(() => {
    const user = data?.data?.driver_profile_id
    if (user) {
      setForm({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone_no: user.phone_no || '',
        email: user.email || '',
      })
    }
  }, [data])

  useEffect(() => {
    if (updateData?.status === 500) errorMessage(updateData?.message)
    if (updateData?.status === 200 && !updateData?.error) {
      successMessage(updateData?.message || 'Profile updated')
      getDriverDetails()
    }
  }, [updateData])

  const onChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <>
      <Typography variant="h5" sx={{ mb: 1 }}>Edit profile</Typography>
      <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
        Update the name, phone, and email on this driver login. Documents stay under the Documents tab.
      </Typography>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3, maxWidth: 720 }}>
        <Stack spacing={2}>
          <TextField name="first_name" label="First name" value={form.first_name} onChange={onChange} fullWidth />
          <TextField name="last_name" label="Last name" value={form.last_name} onChange={onChange} fullWidth />
          <TextField name="phone_no" label="Phone" value={form.phone_no} onChange={onChange} fullWidth />
          <TextField name="email" label="Email" value={form.email} onChange={onChange} fullWidth />
          <Box>
            <Button variant="contained" disabled={isLoading} onClick={() => updateAccount(form)}>
              {isLoading ? 'Saving…' : 'Save profile'}
            </Button>
          </Box>
        </Stack>
      </Paper>
    </>
  )
}

export default EditDriverProfile
