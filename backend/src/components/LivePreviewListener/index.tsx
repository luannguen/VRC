'use client'
import { getClientSideURL } from '@/utilities/getURL'
import { RefreshRouteOnSave as PayloadLivePreview } from '@payloadcms/live-preview-react'
import { useRouter } from 'next/navigation'
import React from 'react'

export const LivePreviewListener: React.FC = () => {
  const router = useRouter()
  // Always use absolute URL for live preview to prevent postMessage origin errors
  return <PayloadLivePreview refresh={router.refresh} serverURL={getClientSideURL(true)} />
}
