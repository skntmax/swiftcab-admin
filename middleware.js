
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import {SWC_KEYS, USER_ROLES} from './constants/index'
import { useAxios } from './utils/axios';
import { getCookie } from 'cookies-next';
export async function middleware(request) {
    console.log("Middleware triggered!");

    const cookieStore = cookies();    
    const { pathname, searchParams } = request.nextUrl;

      // Extract dynamic route parameters (e.g., /user/123)
    const segments = pathname.split('/').filter(Boolean); // Removes empty strings
    const userType = segments[0] || null; // Example: /user/[userType]
    const userName = segments[1] || null; // Example: /user/[userType]/[userName]


    const details = cookieStore.get(SWC_KEYS.SWC_TOKEN);

    
    if(!details)  {
      return NextResponse.redirect(new URL('/', request.url))
    }
    
    let  validUser =  await useAxios.post('/v1/auth/is-valid-user-with-role', { username:userName , userType} ,  {
      headers: {
        authorization: `Bearer ${details.value}`,
      },
    }) .then(data => data ) .catch(error => console.error(error));
  
    
    if(!validUser?.data || validUser?.error) 
      return NextResponse.redirect(new URL('/', request.url))
    

    // if user is  customer 
    if(userType==USER_ROLES.customer && validUser?.data){
      return NextResponse.redirect(new URL( process.env.NEXT_PUBLIC_CLIENT_PORTAL_URL, request.url))
    }

     return NextResponse.next();  
  }

  // See "Matching Paths" below to learn more
export const config = {
  matcher: ['/:path/:path/'], 
}

  