import { CollectionConfig } from 'payload';
import { authenticated } from '../access/authenticated';
import { authenticatedOrPublished } from '../access/authenticatedOrPublished';
import { slugField } from '../fields/slug';

export const Technologies: CollectionConfig = {
  slug: 'technologies',
  labels: {
    singular: 'Công nghệ & Đối tác',
    plural: 'Công nghệ & Đối tác',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'type', 'status', 'order'],
    group: 'Dự án & Đối tác',
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
      label: 'Tên',
      required: true,
    },
    ...slugField('name'),
    {
      name: 'type',
      type: 'select',
      label: 'Loại',
      required: true,
      options: [
        {
          label: 'Công nghệ',
          value: 'technology',
        },
        {
          label: 'Đối tác',
          value: 'partner',
        },
        {
          label: 'Nhà cung cấp',
          value: 'supplier',
        },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'logo',
      type: 'upload',
      label: 'Logo',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'website',
      type: 'text',
      label: 'Website',
      admin: {
        description: 'URL website của công ty/đối tác (https://example.com)',
      },
    },
    {
      name: 'description',
      type: 'richText',
      label: 'Mô tả',
    },
    {
      name: 'order',
      type: 'number',
      label: 'Thứ tự hiển thị',
      defaultValue: 99,
      admin: {
        position: 'sidebar',
        description: 'Số càng nhỏ thì hiển thị càng trước',
      },
    },
    {
      name: 'featured',
      type: 'checkbox',
      label: 'Đối tác nổi bật',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Đánh dấu là đối tác nổi bật để hiện trên trang chủ',
      },
    },
    {
      name: 'products',
      type: 'relationship',
      label: 'Sản phẩm liên quan',
      relationTo: ['products'],
      hasMany: true,
      admin: {
        description: 'Các sản phẩm liên quan đến công nghệ/đối tác này',
      },
    },
    {
      name: 'certifications',
      type: 'array',
      label: 'Chứng chỉ',
      fields: [
        {
          name: 'title',
          type: 'text',
          label: 'Tên chứng chỉ',
          required: true,
        },
        {
          name: 'image',
          type: 'upload',
          label: 'Hình ảnh chứng chỉ',
          relationTo: 'media',
        },
        {
          name: 'description',
          type: 'textarea',
          label: 'Mô tả',
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
  ],
};
