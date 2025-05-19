// filepath: e:\Download\vrc\backend\src\endpoints\seed\home-static.ts
// Default static content for the home page when no database entry exists
// This serves as a fallback until proper content is seeded

import type { RequiredDataFromCollectionSlug } from 'payload';

export const homeStatic: RequiredDataFromCollectionSlug<'pages'> = {
  id: 'static-home',
  title: 'Welcome to Our Website',
  slug: 'home',
  _status: 'published' as const,
  meta: {
    title: 'Home | Our Website',
    description: 'Welcome to our website. Find products and services tailored to your needs.',
  },
  hero: {
    type: 'mediumImpact' as const,
    richText: {
      root: {
        type: 'root',
        children: [
          {
            type: 'h1',
            children: [
              {
                text: 'Welcome to Our Website',
                type: 'text',
              }
            ],
          },
          {
            type: 'p',
            children: [
              {
                text: 'Discover our products and services',
                type: 'text',
              }
            ],
          }
        ],
        direction: 'ltr',
        format: 'left',
        indent: 0,
      }
    },
    links: [
      {
        link: {
          type: 'custom' as const,
          url: '/products',
          label: 'Browse Products',
          appearance: 'default' as const,
        }
      },
      {
        link: {
          type: 'custom' as const,
          url: '/contact',
          label: 'Contact Us',
          appearance: 'outline' as const,
        }
      },
    ],
  },
  layout: [
    {
      blockType: 'content' as const,
      columns: [
        {
          size: 'full' as const,
          richText: {
            root: {
              type: 'root',
              children: [
                {
                  type: 'h2',
                  children: [
                    {
                      text: 'About Us',
                      type: 'text',
                    }
                  ],
                },
                {
                  type: 'p',
                  children: [
                    {
                      text: 'We provide high-quality products and excellent customer service.',
                      type: 'text',
                    }
                  ],
                }
              ],
              direction: 'ltr',
              format: 'left',
              indent: 0,
            }
          },
        },
      ],
    },
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};