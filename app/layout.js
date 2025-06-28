'use client'
import "./globals.css";
import RootPage from './../components/RootPage'
import  Tsparticle from './../components/Tsparticle'
import UseReduxSelector from "@app/libs/slice/useReduxSelector"
export default function RootLayout({ children }) {
  return (
    <html lang='en'>
      <body className='relative'>
        <RootPage>
       <Tsparticle /> 
        <UseReduxSelector> {/* centralized redux data selector */}
           {children}
        </UseReduxSelector>
        </RootPage>
      </body>
    </html>
  );
}
