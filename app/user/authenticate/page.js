'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { persistAuthSession } from '@utils/authSession'
import { useExchangeSessionMutation } from '@app/libs/apis/user'
import { fetGlobalNavbar } from '@app/libs/slice/navMenuSlice'
import { useAppDispatch } from '@app/libs/store'

function AuthenticateInner() {
  const router = useRouter()
  const params = useSearchParams()
  const dispatch = useAppDispatch()
  const [exchangeSession] = useExchangeSessionMutation()
  const [message, setMessage] = useState('Completing verification…')

  useEffect(() => {
    const exchange = params.get('exchange')
    const token = params.get('token')
    const username = params.get('username')
    const roleTypeName = params.get('roleTypeName')
    if (!exchange && token && username && roleTypeName) {
      persistAuthSession({
        token,
        user: { username, firstName: params.get('firstName'), lastName: params.get('lastName'), roleTypeName },
      }).then(() => {
        dispatch(fetGlobalNavbar({ userType: roleTypeName }))
        router.replace(`/${roleTypeName}/${String(username).toLowerCase()}`)
      }).catch(() => setMessage('Could not save login session'))
      return
    }
    if (!exchange) {
      setMessage('This verification link is missing.')
      return
    }
    let cancelled = false
    ;(async () => {
      const result = await exchangeSession({ exchange })
      const data = result?.data?.data || result?.data
      if (cancelled) return
      if (!data?.token || !data?.usersObj) {
        setMessage(data?.message || 'This verification link is invalid or already used.')
        return
      }
      await persistAuthSession({ token: data.token, user: data.usersObj, refreshToken: data.refreshToken })
      const role = data.usersObj.roleTypeName
      const name = data.usersObj.username
      if (role && name) {
        dispatch(fetGlobalNavbar({ userType: role }))
        router.replace(`/${role}/${String(name).toLowerCase()}`)
        return
      }
      router.replace('/')
    })().catch(() => {
      if (!cancelled) setMessage('Could not complete sign-in.')
    })
    return () => {
      cancelled = true
    }
  }, [dispatch, exchangeSession, params, router])

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#0b0b0b', color: '#fff' }}>
      <p>{message}</p>
    </div>
  )
}

export default function AuthenticatePage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#0b0b0b' }} />}>
      <AuthenticateInner />
    </Suspense>
  )
}
