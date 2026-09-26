import "./globals.css";
import Script from "next/script";
import RootPage from './../components/RootPage'
import UseReduxSelector from "@app/libs/slice/useReduxSelector"

export default function RootLayout({ children }) {
  return (
    <html lang='en'>
    <body className='relative'>
        <RootPage>
        <UseReduxSelector>
           {children}
        </UseReduxSelector>
        </RootPage>
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
