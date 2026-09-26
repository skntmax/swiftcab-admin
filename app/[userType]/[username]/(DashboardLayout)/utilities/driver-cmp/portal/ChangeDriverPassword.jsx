'use client'
import React, { useContext, useState } from 'react'
import { Button, Paper, Stack, TextField, Typography } from '@mui/material'
import { useChangeDriverPasswordMutation } from '@app/libs/apis/driver'
import { contextProvider } from '@components/AppProvider'

function ChangeDriverPassword() {
  const { successMessage, errorMessage } = useContext(contextProvider)
  const [changePassword, { isLoading }] = useChangeDriverPasswordMutation()
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })

  const onChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const onSubmit = async () => {
    if (!form.currentPassword || !form.newPassword) {
      errorMessage('Enter current and new password')
      return
    }
    if (form.newPassword !== form.confirmPassword) {
      errorMessage('New password and confirm password do not match')
      return
    }
    const response = await changePassword({
      currentPassword: form.currentPassword,
      newPassword: form.newPassword,
    }).unwrap()
    if (response?.error || response?.status === 500) {
      errorMessage(response?.message || 'Could not change password')
      return
    }
    successMessage(response?.message || 'Password updated')
    setForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
  }

  return (
    <>
      <Typography variant="h5" sx={{ mb: 1 }}>Change password</Typography>
      <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
        You stay logged in after a successful change. Use at least 4 characters.
      </Typography>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3, maxWidth: 520 }}>
        <Stack spacing={2}>
          <TextField name="currentPassword" type="password" label="Current password" value={form.currentPassword} onChange={onChange} fullWidth />
          <TextField name="newPassword" type="password" label="New password" value={form.newPassword} onChange={onChange} fullWidth />
          <TextField name="confirmPassword" type="password" label="Confirm new password" value={form.confirmPassword} onChange={onChange} fullWidth />
          <Button variant="contained" disabled={isLoading} onClick={onSubmit}>
            {isLoading ? 'Updating…' : 'Update password'}
          </Button>
        </Stack>
      </Paper>
    </>
  )
}

export default ChangeDriverPassword
