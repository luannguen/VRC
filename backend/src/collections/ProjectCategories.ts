import type { CollectionConfig } from 'payload'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'
import { slugField } from '@/fields/slug'

export const ProjectCategories: CollectionConfig = {
  slug: 'project-categories',
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  labels: {
    plural: 'Danh mục dự án',
    singular: 'Danh mục dự án',
  },  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'color', 'orderNumber', 'updatedAt'],
    group: 'Dự án',
    description: 'Quản lý danh mục phân loại dự án - collection độc lập.',
    listSearchableFields: ['title', 'description', 'slug'],
  },
  hooks: {
    afterChange: [
      ({ doc, operation }) => {
        console.log(`ProjectCategory ${operation}: ${doc.id} - ${doc.title}`);
        return doc;
      },
    ],
  },fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Tên danh mục',
      required: true,
      admin: {
        description: 'Nhập tên danh mục dự án (VD: Điều hòa thương mại, Kho lạnh, Hệ thống đặc biệt...)',
      },
    },    {
      name: 'description',
      type: 'textarea',
      label: 'Mô tả',
      admin: {
        description: 'Mô tả ngắn gọn về loại dự án này (không bắt buộc)',
      },
    },
    {
      name: 'parent',
      type: 'relationship',
      label: 'Danh mục cha',
      relationTo: 'project-categories',
      admin: {
        position: 'sidebar',
        description: 'Chọn danh mục cha để tạo cấu trúc phân cấp (không bắt buộc)',
      },
    },
    {
      name: 'icon',
      type: 'text',
      label: 'Biểu tượng',
      admin: {
        description: 'Tên icon hoặc emoji đại diện cho danh mục (VD: 🏢, ❄️, ⚙️)',
        position: 'sidebar',
        placeholder: '🏢',
      },
    },
    {
      name: 'color',
      type: 'text',
      label: 'Màu sắc',
      admin: {
        description: 'Mã màu hex cho hiển thị (VD: #3B82F6). Không bắt buộc.',
        placeholder: '#3B82F6',
        position: 'sidebar',
      },      validate: (val: string | null | undefined) => {
        if (!val) return true
        const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
        return hexColorRegex.test(val) || 'Vui lòng nhập mã màu hex hợp lệ (VD: #3B82F6)'
      },
    },
    {
      name: 'showInMenu',
      type: 'checkbox',
      label: 'Hiển thị trong menu',
      defaultValue: true,
      admin: {
        position: 'sidebar',
        description: 'Bật để hiển thị danh mục này trong menu frontend',
      },
    },
    {
      name: 'orderNumber',
      type: 'number',
      label: 'Thứ tự sắp xếp',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        description: 'Số thứ tự để sắp xếp danh mục (số nhỏ hiển thị trước)',
      },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      label: 'Kích hoạt',
      defaultValue: true,
      admin: {
        position: 'sidebar',
        description: 'Bỏ tick để ẩn danh mục này khỏi frontend',
      },
    },
    {
      name: 'featuredImage',
      type: 'upload',
      label: 'Hình ảnh đại diện',
      relationTo: 'media',
      admin: {
        description: 'Hình ảnh đại diện cho danh mục dự án (không bắt buộc)',
      },
    },
    ...slugField(),
  ],
}
