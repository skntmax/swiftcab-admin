'use client'
import React from 'react'
import WalletEarnings from '../portal/WalletEarnings'

function DilyEarning() {
  return (
    <WalletEarnings
      title="Daily earnings"
      period="day"
      body="Today's wallet credits and the option to recharge or buy a zero-commission pack."
    />
  )
}

export default DilyEarning
