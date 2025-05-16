import { CollectionConfig } from 'payload';
import { authenticated } from '../access/authenticated';
import { authenticatedOrPublished } from '../access/authenticatedOrPublished';
import { slugField } from '../fields/slug';

export const Products: CollectionConfig = {
  slug: 'products',
  labels: {
    singular: 'Sản phẩm',
    plural: 'Sản phẩm',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'category', 'featured', 'status', 'updatedAt'],
    group: 'Sản phẩm & Dịch vụ',
  },
  access: {
    create: authenticated,
    read: authenticatedOrPublished,
    update: authenticated,
    delete: authenticated,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Tên sản phẩm',
      required: true,
    },
    ...slugField('name'),
    {
      name: 'excerpt',
      type: 'textarea',
      label: 'Mô tả ngắn',
      admin: {
        description: 'Mô tả ngắn gọn hiển thị trong danh sách sản phẩm',
      },
    },
    {
      name: 'description',
      type: 'richText',
      label: 'Mô tả chi tiết',
    },
    {
      name: 'mainImage',
      type: 'upload',
      label: 'Hình ảnh chính',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'gallery',
      type: 'array',
      label: 'Thư viện ảnh',
      fields: [
        {
          name: 'image',
          type: 'upload',
          label: 'Hình ảnh',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'caption',
          type: 'text',
          label: 'Chú thích',
        },
      ],
    },
    {
      name: 'category',
      type: 'relationship',
      label: 'Danh mục',
      relationTo: 'categories',
      hasMany: false,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'tags',
      type: 'relationship',
      label: 'Thẻ',
      relationTo: 'categories',
      hasMany: true,
      filterOptions: ({ relationTo }) => {
        return {
          type: { equals: 'tag' },
        };
      },
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'featured',
      type: 'checkbox',
      label: 'Sản phẩm nổi bật',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Đánh dấu là sản phẩm nổi bật để hiện trên trang chủ',
      },
    },
    {
      name: 'relatedProducts',
      type: 'relationship',
      label: 'Sản phẩm liên quan',
      relationTo: ['products'],
      hasMany: true,
      admin: {
        description: 'Chọn các sản phẩm liên quan để hiển thị phía dưới',
      },
    },
    {
      name: 'specifications',
      type: 'array',
      label: 'Thông số kỹ thuật',
      fields: [
        {
          name: 'name',
          type: 'text',
          label: 'Tên thông số',
          required: true,
        },
        {
          name: 'value',
          type: 'text',
          label: 'Giá trị',
          required: true,
        },
      ],
    },
    {
      name: 'documents',
      type: 'array',
      label: 'Tài liệu',
      fields: [
        {
          name: 'name',
          type: 'text',
          label: 'Tên tài liệu',
          required: true,
        },
        {
          name: 'file',
          type: 'upload',
          label: 'Tập tin',
          relationTo: 'media',
          required: true,
        },
      ],
    },
    {
      name: 'status',
      type: 'select',
      label: 'Trạng thái',
      required: true,
      options: [
        {
          label: 'Bản nháp',
          value: 'draft',
        },
        {
          label: 'Đã xuất bản',
          value: 'published',
        },
      ],
      defaultValue: 'draft',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'meta',
      type: 'group',
      label: 'SEO & Metadata',
      fields: [
        {
          name: 'title',
          type: 'text',
          label: 'Meta Title',
        },
        {
          name: 'description',
          type: 'textarea',
          label: 'Meta Description',
        },
        {
          name: 'image',
          type: 'upload',
          label: 'Meta Image',
          relationTo: 'media',
        },
      ],
    },
  ],
};
