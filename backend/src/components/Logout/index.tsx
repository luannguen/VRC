'use client'

import React from 'react'
import { Button } from '@payloadcms/ui'
import { LogOut } from 'lucide-react'

// This component will be used as custom logout button
const LogoutButton: React.FC = () => {
  const handleLogout = () => {
    if (window.confirm('Bạn có chắc chắn muốn đăng xuất không?')) {
      window.location.href = '/admin/logout'
    }
  }

  return (
    <div style={{ padding: '1rem', marginTop: '1rem' }}>
      <Button 
        className="logout-button" 
        icon={<LogOut size={18} />} 
        buttonStyle="secondary"
        onClick={handleLogout}
      >
        Đăng xuất
      </Button>
    </div>
  )
}

export default LogoutButton
