import type { CollectionSlug, PayloadRequest } from 'payload'
import { getPayload } from 'payload'

import { draftMode } from 'next/headers'
import { NextResponse } from 'next/server'

import configPromise from '@payload-config'

export async function GET(
  req: {
    cookies: {
      get: (name: string) => {
        value: string
      }
    }
  } & Request,
): Promise<Response> {
  const payload = await getPayload({ config: configPromise })

  const { searchParams } = new URL(req.url)

  const path = searchParams.get('path')
  const collection = searchParams.get('collection') as CollectionSlug
  const slug = searchParams.get('slug')
  const previewSecret = searchParams.get('previewSecret')

  // Log environment info for debugging
  console.log('Preview debug info:')
  console.log('- NODE_ENV:', process.env.NODE_ENV)
  console.log('- Has PREVIEW_SECRET env:', !!process.env.PREVIEW_SECRET)
  console.log('- Provided secret:', previewSecret ? `${previewSecret.slice(0, 3)}...` : '(no secret provided)')
  
  // Allow specific dev secrets in development environment
  const DEV_SECRETS = ['dev-preview', 'test-preview'];
  
  // Allow empty secret in development for easier testing
  if (process.env.NODE_ENV === 'development' && !previewSecret) {
    console.log('Preview accepted - Empty secret allowed in development environment')
    // Continue with preview using empty dev secret
  }
  // Allow specific dev secrets in any environment for testing
  else if (DEV_SECRETS.includes(previewSecret || '')) {
    console.log('Preview accepted - Using development secret')
    // Continue with preview using dev secret
  } 
  // Check against environment variable secret if available
  else if (process.env.PREVIEW_SECRET && previewSecret === process.env.PREVIEW_SECRET) {
    console.log('Preview accepted - Using PREVIEW_SECRET from environment')
    // Continue with preview
  }
  // If no valid secret provided
  else {
    console.log('Preview rejected - Invalid or missing secret')
    console.log('  Provided:', previewSecret || '(empty)')
    console.log('  Expected in dev mode:', DEV_SECRETS.join(' or '))
    console.log('  You can set PREVIEW_SECRET in .env file or use a dev secret in development')
    
    return new Response('Invalid preview secret. Check server logs for details.', { status: 403 })
  }

  if (!path || !collection || !slug) {
    return new Response('Insufficient search params (path, collection, and slug are required)', { status: 404 })
  }

  if (!path.startsWith('/')) {
    return new Response('This endpoint can only be used for relative previews', { status: 500 })
  }  
  
  try {
    if (!path) {
      return new Response('Path parameter is required for preview', { status: 400 })
    }
    
    console.log('Enabling draft mode for path:', path)
    const draft = await draftMode()
    draft.enable()
    
    console.log('Redirecting to:', path)
    
    // Use NextResponse.redirect instead of the redirect function
    // This is the recommended approach for App Router in Next.js
    return NextResponse.redirect(new URL(path, req.url))
  } catch (error: any) { // Type any to handle error.message
    console.error('Error during preview redirect:', error)
    return new Response(`Error during preview: ${error?.message || 'Unknown error'}`, { status: 500 })
  }
}
