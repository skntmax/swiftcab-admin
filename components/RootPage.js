'use client'
import React from 'react'
import { Provider } from 'react-redux'
import AppProvider from './../components/AppProvider'
import { reduxStore } from '@app/libs/store'
function RootPage({children}) {
  return (
   <>
   <Provider store={reduxStore}>
        <AppProvider>
          {children}
        </AppProvider>
      </Provider>
   
   </>
  )
}

export default RootPage
