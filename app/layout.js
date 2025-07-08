'use client'
import "./globals.css";
import RootPage from './../components/RootPage'
import  Tsparticle from './../components/Tsparticle'
import UseReduxSelector from "@app/libs/slice/useReduxSelector"
import { SocketClient } from "../components/Socket/SocketProvider";
export default function RootLayout({ children }) {
  return (
    <html lang='en'>
      <body className='relative'>
        <RootPage>
       <Tsparticle /> 
        <UseReduxSelector> {/* centralized redux data selector */}
           <SocketClient>
           {children}
           </SocketClient>
        </UseReduxSelector>
        </RootPage>
      </body>
    </html>
  );
}
