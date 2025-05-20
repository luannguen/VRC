import canUseDOM from './canUseDOM'

export const getServerSideURL = () => {
  let url = process.env.NEXT_PUBLIC_SERVER_URL

  if (!url && process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  }

  if (!url) {
    url = 'http://localhost:3000'
  }

  return url
}

export const getClientSideURL = (forceAbsolute = false) => {
  // When in preview mode (or any SSR context), prefer to use relative URLs
  // This avoids hydration errors when server and client URLs differ
  // But always return absolute URL if forceAbsolute=true
  if (!forceAbsolute && (process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_IS_PREVIEW === 'true')) {
    return ''  // Use relative URLs
  }
  
  if (canUseDOM()) {
    const protocol = window.location.protocol
    const domain = window.location.hostname
    const port = window.location.port

    return `${protocol}//${domain}${port ? `:${port}` : ''}`
  }

  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  }

  return process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
}
