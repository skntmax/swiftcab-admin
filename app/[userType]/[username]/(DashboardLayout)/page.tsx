import React from 'react'
import UsersDashboard from './backpage'
import AdminBackPage from './AdminBackpage'
import CustomerBackPage from './CustomerBackpage'
import  DriverPage from './utilities/driver-cmp/Index'
import { USER_ROLES } from '@constants'


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
