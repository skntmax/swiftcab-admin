'use client'

import { SOCKET_EVENTS, SWC_KEYS, USER_ROLES } from '@constants'
import { getCookie } from 'cookies-next'
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { io, type Socket } from 'socket.io-client'

export const SOCKET_STATUS = {
  connected: 'connected',
  disconnected: 'disconnected',
} as const

export type SocketStatus = (typeof SOCKET_STATUS)[keyof typeof SOCKET_STATUS]

export type SocketContextValue = {
  socket: Socket | null
  status: SocketStatus
  incomingRideRequests: unknown[]
}

export const SocketProvider = createContext<SocketContextValue>({
  socket: null,
  status: SOCKET_STATUS.disconnected,
  incomingRideRequests: [],
})

export function useSocket(): SocketContextValue {
  return useContext(SocketProvider)
}

function readAuthToken(): string {
  const token = getCookie(SWC_KEYS.SWC_TOKEN)
  if (typeof token !== 'string') {
    return ''
  }
  return token.replace(/^(Bearer\s+)+/i, '').trim()
}

function resolveGatewaySocketUrl(): string {
  const medium = (process.env.NEXT_PUBLIC_CLIENT_MEDIUM_URL || '').trim()
  const api = (process.env.NEXT_PUBLIC_API_URL || '').trim()
  const staleGatewayPort = /:900[02]\/?$/
  if (medium && !staleGatewayPort.test(medium)) {
    return medium.replace(/\/+$/, '')
  }
  return api.replace(/\/+$/, '')
}

type SocketClientProps = {
  children: ReactNode
  userType?: string | null
}

export function SocketClient({ children, userType }: SocketClientProps) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [status, setStatus] = useState<SocketStatus>(SOCKET_STATUS.disconnected)
  const [incomingRideRequests, setIncomingRideRequests] = useState<unknown[]>([])
  const isDriver = userType === USER_ROLES['driver-partner']

  useEffect(() => {
    if (!isDriver) {
      setSocket(null)
      setStatus(SOCKET_STATUS.disconnected)
      setIncomingRideRequests([])
      return
    }

    const mediumUrl = resolveGatewaySocketUrl()
    if (!mediumUrl) {
      setStatus(SOCKET_STATUS.disconnected)
      return
    }

    const token = readAuthToken()
    const nextSocket = io(mediumUrl, {
      transports: ['polling', 'websocket'],
      upgrade: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
      path: '/medium/socket.io',
      withCredentials: true,
      auth: {
        token: token ? `Bearer ${token}` : '',
        portal: 'driver-portal',
      },
    })

    const markConnected = () => setStatus(SOCKET_STATUS.connected)
    const markDisconnected = () => setStatus(SOCKET_STATUS.disconnected)
    const onRideRequest = (data: unknown) => {
      setIncomingRideRequests((prev) => [data, ...prev].slice(0, 5))
    }

    nextSocket.on('connect', markConnected)
    nextSocket.on('disconnect', markDisconnected)
    nextSocket.on('connect_error', markDisconnected)
    nextSocket.on(SOCKET_EVENTS.NEW_RIDE_REQUEST, onRideRequest)

    if (nextSocket.connected) {
      markConnected()
    }

    setSocket(nextSocket)

    return () => {
      nextSocket.off('connect', markConnected)
      nextSocket.off('disconnect', markDisconnected)
      nextSocket.off('connect_error', markDisconnected)
      nextSocket.off(SOCKET_EVENTS.NEW_RIDE_REQUEST, onRideRequest)
      nextSocket.disconnect()
      setSocket(null)
      setStatus(SOCKET_STATUS.disconnected)
    }
  }, [isDriver])

  const value = useMemo(
    () => ({ socket, status, incomingRideRequests }) satisfies SocketContextValue,
    [socket, status, incomingRideRequests],
  )

  return (
    <SocketProvider.Provider value={value}>{children}</SocketProvider.Provider>
  )
}
