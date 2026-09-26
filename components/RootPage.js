'use client'
import React from 'react'
import { Provider } from 'react-redux'
import AppProvider from './../components/AppProvider'
import { reduxStore } from '@app/libs/store'
import { ThemeProvider } from '@mui/material'
import CssBaseline from "@mui/material/CssBaseline";

import { baselightTheme } from '@utils/theme/DefaultColors'
import SessionGuard from '@components/SessionGuard'



function RootPage({ children }) {
  return (
    <>
      <ThemeProvider theme={baselightTheme}>
      <CssBaseline />
        <Provider store={reduxStore}>
          <AppProvider>
            <SessionGuard />
            {children}
          </AppProvider>
        </Provider>
      </ThemeProvider>

    </>
  )
}

export default RootPage
