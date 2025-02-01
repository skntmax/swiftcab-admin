import React from 'react'
import UsersDashboard from './backpage'

function page(props:any) {
  const { params:{ userType  , username }} = props
  return (
     <>
     <UsersDashboard userType={userType} userName={username} />
     </>
  )
}

export default page
