'use client'
import React from 'react'
import WalletEarnings from '../portal/WalletEarnings'

function MonthlyEarning() {
  return (
    <WalletEarnings
      title="Monthly earnings"
      period="month"
      body="This month's wallet ledger. Recharge and commission packs sit on the same wallet."
    />
  )
}

export default MonthlyEarning
