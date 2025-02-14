
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function middleware(request) {
    console.log("admin>> Middleware triggered!");

    const cookieStore = cookies();    
    const { pathname, searchParams } = request.nextUrl;

      // Extract dynamic route parameters (e.g., /user/123)
    // const segments = pathname.split('/').filter(Boolean); // Removes empty strings
    // const userType = segments[0] || null; // Example: /user/[userType]
    // const userName = segments[1] || null; // Example: /user/[userType]/[userName]


    // const details = cookieStore.get(SWC_KEYS.SWC_TOKEN);
    // let  validUser =  await useAxios.post('/v1/auth/check-valid-user', {username:userName} ) .then(data => data ) .catch(error => console.error(error));
  
    // if(!validUser?.data) 
    //   return NextResponse.redirect(new URL('/', request.url))
    
    
    //  if(!details)  {
    //    return NextResponse.redirect(new URL('/', request.url))
    //  }

     return NextResponse.next();

  
  }

  // See "Matching Paths" below to learn more
export const config = {
  matcher: ['/:path/:path/'], 
}

  