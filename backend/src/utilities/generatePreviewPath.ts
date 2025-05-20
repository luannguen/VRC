import { PayloadRequest, CollectionSlug } from 'payload'

const collectionPrefixMap: Partial<Record<CollectionSlug, string>> = {
  posts: '/posts',
  pages: '',
}

type Props = {
  collection: keyof typeof collectionPrefixMap
  slug: string
  req: PayloadRequest
}

export const generatePreviewPath = ({ collection, slug }: Props) => {
  // Use dev-preview as fallback in development mode or empty string in production
  const previewSecret = process.env.PREVIEW_SECRET || 
    (process.env.NODE_ENV === 'development' ? 'dev-preview' : '');

  const encodedParams = new URLSearchParams({
    slug,
    collection,
    path: `${collectionPrefixMap[collection]}/${slug}`,
    previewSecret,
  })

  const url = `/next/preview?${encodedParams.toString()}`

  return url
}
