'use client'

import React from 'react'
import LogoutButton from '../Logout'

const LeftNav: React.FC<{
  children?: React.ReactNode
}> = ({ children }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ flex: 1 }}>{children}</div>
      <LogoutButton />
    </div>
  )
}

export default LeftNav
