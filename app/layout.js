'use client'
import "./globals.css";
import RootPage from './../components/RootPage'
import  Tsparticle from './../components/Tsparticle'

export default function RootLayout({ children }) {
  return (
    <html lang='en'>
      <body className='relative'>
        <RootPage>
      <Tsparticle /> 
           {children}
        </RootPage>
      </body>
    </html>
  );
}
