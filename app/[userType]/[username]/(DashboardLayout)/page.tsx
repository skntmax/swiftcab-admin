import React from 'react'
import dynamic from 'next/dynamic'
import { USER_ROLES } from '@constants'

const UsersDashboard = dynamic(() => import('./backpage'))
const AdminBackPage = dynamic(() => import('./AdminBackpage'))
const CustomerBackPage = dynamic(() => import('./CustomerBackpage'))
const DriverPage = dynamic(() => import('./utilities/driver-cmp/Index'))

function page(props:any) {
    const { params:{ userType  , username }} = props
    return (
     <>
      
       {/* OWNER */}
      {userType===USER_ROLES.owner?.toLocaleLowerCase() && <UsersDashboard userType={userType} userName={username} />  } 
      
       {/* ADMIN */}
      {userType===USER_ROLES.admin?.toLocaleLowerCase() && <AdminBackPage userType={userType} userName={username} />  } 

      {/* CUSTOMER */}
      {userType===USER_ROLES.customer?.toLocaleLowerCase() && <CustomerBackPage userType={userType} userName={username} />  } 
      
      {/* DRIVER */}
      {userType===USER_ROLES['driver-partner']?.toLocaleLowerCase() && <DriverPage userType={userType} userName={username} />  } 
   
     </>
  )
}

export default page
