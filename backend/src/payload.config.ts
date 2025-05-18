import { mongooseAdapter } from '@payloadcms/db-mongodb'

import sharp from 'sharp' // sharp-import
import path from 'path'
import { buildConfig, PayloadRequest } from 'payload'
import { fileURLToPath } from 'url'

import { Categories } from './collections/Categories'
import { EventCategories } from './collections/EventCategories'
import { Events } from './collections/Events'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Posts } from './collections/Posts'
import { Users } from './collections/Users'
import { ContactSubmissions } from './collections/ContactSubmissions'
import { Navigation } from './collections/Navigation'
import { ProductCategories } from './collections/ProductCategories'
import { NewsCategories } from './collections/NewsCategories'
import { ServiceCategories } from './collections/ServiceCategories'
import { Products } from './collections/Products'
import { Projects } from './collections/Projects'
import { Services } from './collections/Services'
import { Technologies } from './collections/Technologies'
import { Footer } from './Footer/config'
import { Header } from './Header/config'
import { CompanyInfo } from './globals/CompanyInfo'
import { plugins } from './plugins'
import { defaultLexical } from '@/fields/defaultLexical'
import { getServerSideURL } from './utilities/getURL'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({  admin: {    components: {
      // The `BeforeLogin` component renders a message that you see while logging into your admin panel.
      // Feel free to delete this at any time. Simply remove the line below and the import `BeforeLogin` statement on line 15.
      beforeLogin: ['@/components/BeforeLogin'],      // The `BeforeDashboard` component renders the 'welcome' block that you see after logging into your admin panel.
      // Feel free to delete this at any time. Simply remove the line below and the import `BeforeDashboard` statement on line 15.
      beforeDashboard: ['@/components/BeforeDashboard'],      // Add logout button to the bottom of the left menu
      afterNavLinks: ['@/components/AdminUI/DynamicLogout', '@/components/AdminUI/DynamicSidebar', '@/components/AdminUI/DynamicAdminStyles'],
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
    user: Users.slug,
    livePreview: {
      breakpoints: [
        {
          label: 'Mobile',
          name: 'mobile',
          width: 375,
          height: 667,
        },
        {
          label: 'Tablet',
          name: 'tablet',
          width: 768,
          height: 1024,
        },
        {
          label: 'Desktop',
          name: 'desktop',
          width: 1440,
          height: 900,
        },
      ],
    },
  },
  // This config helps us configure global or default features that the other editors can inherit
  editor: defaultLexical,
  db: mongooseAdapter({
    url: process.env.DATABASE_URI || '',  }),  collections: [
    Pages, 
    Posts, 
    Media, 
    Categories, 
    ProductCategories,
    NewsCategories,
    ServiceCategories,
    Users, 
    ContactSubmissions,
    Navigation,
    Products,
    Projects,
    EventCategories,
    Events,
    Services,
    Technologies
  ],cors: {
    origins: [
      getServerSideURL(),                                    // Backend URL
      process.env.FRONTEND_URL || 'http://localhost:5173',   // Default Frontend Vite URL
      'http://localhost:8080', 'http://localhost:8081',                              // Your custom frontend port
      // Thêm domain production nếu cần
    ].filter(Boolean),    
    headers: ['authorization', 'content-type', 'x-custom-header'], // Thêm headers cần thiết
  },
  globals: [Header, Footer, CompanyInfo],
  plugins: [
    ...plugins,
    // storage-adapter-placeholder
  ],
  secret: process.env.PAYLOAD_SECRET,
  sharp,  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },  endpoints: [
    // Health check endpoint for frontend connectivity testing
    {
      path: '/health',
      method: 'get',
      handler: async (req) => {
        try {
          // Prepare health data
          const healthData = {
            status: 'ok',
            timestamp: new Date().toISOString(),
            server: 'VRC Backend API',
            environment: process.env.NODE_ENV || 'development',
            apiVersion: '1.0.0',
          };
          
          // For HEAD requests, just return empty response
          if (req.method?.toLowerCase() === 'head') {
            return new Response(null, { 
              status: 200,
              headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'X-Health-Status': 'ok',
                'X-Backend-Available': 'true',
                'X-Health-Timestamp': new Date().toISOString()
              }
            });
          }
          
          // For GET requests, return the full health data
          return Response.json(healthData, {
            status: 200,
            headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'X-Health-Status': 'ok',
              'X-Backend-Available': 'true',
              'X-Health-Timestamp': new Date().toISOString()
            }
          });
        } catch (error) {
          // For error cases, still return a valid response
          const errorData = {
            status: 'warning',
            message: 'Health check experienced an error but the server is still running',
            timestamp: new Date().toISOString(),
          };
          
          // For HEAD requests
          if (req.method?.toLowerCase() === 'head') {
            return new Response(null, { 
              status: 200,
              headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'X-Health-Status': 'warning',
                'X-Backend-Available': 'true',
                'X-Health-Timestamp': new Date().toISOString()
              }
            });
          }
          
          // For GET requests
          return Response.json(errorData, {
            status: 200,
            headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'X-Health-Status': 'warning',
              'X-Backend-Available': 'true',
              'X-Health-Timestamp': new Date().toISOString()
            }
          });
        }
      }
    },
  ],
  jobs: {
    access: {
      run: ({ req }: { req: PayloadRequest }): boolean => {
        // Allow logged in users to execute this endpoint (default)
        if (req.user) return true

        // If there is no logged in user, then check
        // for the Vercel Cron secret to be present as an
        // Authorization header:
        const authHeader = req.headers.get('authorization')
        return authHeader === `Bearer ${process.env.CRON_SECRET}`
      },
    },
    tasks: [],
  },
})
