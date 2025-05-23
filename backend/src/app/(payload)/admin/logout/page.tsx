'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@payloadcms/ui'

export default function LogoutPage() {
  const router = useRouter()

  useEffect(() => {
    // Properly handle logout by calling the official Payload logout endpoint
    const performLogout = async () => {
      try {
        const res = await fetch('/api/users/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // Important for cookies
        })

        if (res.ok) {
          // Redirect back to login page after successful logout
          router.push('/admin/login')
        } else {
          console.error('Logout failed:', await res.text())
          // Even if logout fails, redirect to login page
          setTimeout(() => {
            router.push('/admin/login')
          }, 1000)
        }
      } catch (error) {
        console.error('Error during logout:', error)
        // Fallback - redirect to login even on error
        setTimeout(() => {
          router.push('/admin/login')
        }, 1000)
      }
    }

    performLogout()
  }, [router])

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      gap: '2rem'
    }}>
      <h1>Đang đăng xuất...</h1>
      <div>
        <Button
          onClick={() => router.push('/admin/login')}
        >
          Quay lại trang đăng nhập
        </Button>
      </div>
    </div>
  )
}
