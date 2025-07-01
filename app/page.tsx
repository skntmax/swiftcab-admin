'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getUserInfo } from '@utils'
import Login from './Login'

export default function Home() {
  const router = useRouter()
  const [checkingAuth, setCheckingAuth] = useState(true)

  useEffect(() => {
    const { username, roleTypeName } = getUserInfo()

    if (username && roleTypeName) {
      router.push(`/${roleTypeName}/${username}`)
    } else {
      setCheckingAuth(false)
    }
  }, [router])

  // Block rendering Login until after check is done
  if (checkingAuth) return null

  return <Login />
}
