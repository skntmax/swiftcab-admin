'use client'
import { SocketProvider } from '@components/Socket/SocketProvider'
import React, { useContext } from 'react'

function ViewSummary() {
  const {socket} = useContext(SocketProvider)
  socket.emit('loaded-driver', { a: "b", c: [] })
  return (
    <div>ViewSummary</div>
  )
}

export default ViewSummary