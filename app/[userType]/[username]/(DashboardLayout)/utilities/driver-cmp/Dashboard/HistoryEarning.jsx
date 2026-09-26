'use client'
import React from 'react'
import WalletEarnings from '../portal/WalletEarnings'

function HistoryEarning() {
  return (
    <WalletEarnings
      title="Payment history"
      period="all"
      body="Full wallet ledger: recharges, packs, trip earnings, commission, and dues."
    />
  )
}

export default HistoryEarning
