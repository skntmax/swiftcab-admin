import React from 'react'
import UsersDashboard from './backpage'
import { USER_ROLES } from '@constants'

function page(props:any) {
  const { params:{ userType  , username }} = props
  return (
     <>
      
      {userType===USER_ROLES.owner?.toLocaleLowerCase() && <UsersDashboard userType={userType} userName={username} />  } 
      
      {userType===USER_ROLES.admin?.toLocaleLowerCase() && <UsersDashboard userType={userType} userName={username} />  } 
   
     </>
  )
}

export default page
