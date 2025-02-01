
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import {SWC_KEYS} from './constants/index'
import { useAxios } from './utils/axios';
export async function middleware(request) {
    console.log("Middleware triggered!");
    
    const cookieStore = cookies();
    const details = cookieStore.get(SWC_KEYS.SWC_TOKEN);
    let  validUser =  await useAxios.post('/v1/auth/check-valid-user', {username:'dd'} ) .then(data => data ) .catch(error => console.error(error));
  
    if(!validUser?.data) 
      return NextResponse.redirect(new URL('/', request.url))
    
    
     if(!details)  {
       return NextResponse.redirect(new URL('/', request.url))
     }

     return NextResponse.next();

  
  }

  // See "Matching Paths" below to learn more
export const config = {
  matcher: ['/:path/:path/'], 
}

  