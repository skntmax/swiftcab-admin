'use client'
import React from 'react'
import { Typography } from '@mui/material'
import { useDriverDetailsMutation } from '@app/libs/apis/driver'
import { getUserInfo } from '@utils'
import EditProfileDetail from '../../common-cmp/driver/EditProfileDetail'

function UploadDocuments() {
  const [getDriverDetails, { data, isLoading }] = useDriverDetailsMutation()
  const userDetails = getUserInfo()

  React.useEffect(() => {
    getDriverDetails()
  }, [])

  return (
    <>
      <Typography variant="h5" sx={{ mb: 1 }}>Upload documents</Typography>
      <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
        Licence, RC, insurance, Aadhaar, PAN, passbook, and profile photo. KYC review starts after you save.
      </Typography>
      {isLoading ? (
        <Typography>Loading current documents…</Typography>
      ) : (
        <EditProfileDetail data={data?.data} userDetails={userDetails} />
      )}
    </>
  )
}

export default UploadDocuments
