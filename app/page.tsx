'use client'

import { getUserInfo } from '@utils';
import Login from './Login'
import { useRouter } from 'next/navigation'
export default async function Home() { 
   const router = useRouter()
   const { firstName , lastName , username , roleTypeName}  =getUserInfo()
  
   if(roleTypeName && username)
    return window.location.href=(`/${roleTypeName}/${username}`)
   else 
    return  <Login/>   
 
}
