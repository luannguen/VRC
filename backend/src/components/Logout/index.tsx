'use client'

import React, { useCallback } from 'react'
import { Button } from '@payloadcms/ui'
import { LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import HydrationSafeWrapper from '../HydrationSafeWrapper'

// This component will be used as custom logout button at the bottom of left menu
const LogoutButton: React.FC = () => {
  const router = useRouter()
  
  // Using useCallback to avoid creating a new function on each render
  const handleLogout = useCallback(() => {
    if (window.confirm('Bạn có chắc chắn muốn đăng xuất không?')) {
      router.push('/admin/logout')
    }
  }, [router])
  return (
    <div style={{ 
      padding: '1rem', 
      marginTop: 'auto',
      borderTop: '1px solid var(--theme-elevation-100)',
      marginBottom: '1rem'
    }}>
      <HydrationSafeWrapper>
        <Button 
          className="logout-button" 
          icon={<LogOut size={18} />} 
          buttonStyle="secondary"
          onClick={handleLogout}
        >
          Đăng xuất
        </Button>
      </HydrationSafeWrapper>
    </div>
  )
}

export default LogoutButton
