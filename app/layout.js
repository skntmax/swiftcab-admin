'use client'
import "./globals.css";
import RootPage from './../components/RootPage'
export default function RootLayout({ children }) {
  return (
    <html lang='en'>
      <body className='relative'>
        <RootPage>
           {children}
        </RootPage>
      </body>
    </html>
  );
}
