import type { GlobalConfig } from 'payload';
import { defaultLexical } from '../fields/defaultLexical';

export const CompanyInfo: GlobalConfig = {
  slug: 'company-info',
  label: 'Thông tin công ty',
  admin: {
    description: 'Quản lý thông tin liên hệ và giới thiệu về công ty',
    group: 'Cấu hình',
  },
  fields: [
    {
      name: 'companyName',
      label: 'Tên công ty',
      type: 'text',
      required: true,
      admin: {
        description: 'Tên đầy đủ của công ty (hiển thị trên trang Liên hệ)'
      }
    },
    {
      name: 'companyShortName',
      label: 'Tên viết tắt',
      type: 'text',
      admin: {
        description: 'Tên viết tắt hoặc thương hiệu của công ty (VRC)'
      }
    },
    {
      name: 'companyDescription',
      label: 'Mô tả ngắn',
      type: 'textarea',
      admin: {
        description: 'Mô tả ngắn gọn về công ty hiển thị trên trang Liên hệ'
      }
    },
    {
      name: 'contactSection',
      label: 'Thông tin Liên hệ',
      type: 'group',
      fields: [
        {
          name: 'address',
          label: 'Địa chỉ',
          type: 'text',
          required: true,
        },
        {
          name: 'phone',
          label: 'Số điện thoại',
          type: 'text',
        },
        {
          name: 'email',
          label: 'Email',
          type: 'email',
        },
        {
          name: 'hotline',
          label: 'Hotline',
          type: 'text',
        },
        {
          name: 'workingHours',
          label: 'Giờ làm việc',
          type: 'text',
        },
        {
          name: 'fax',
          label: 'Số Fax',
          type: 'text',
        },
      ]
    },
    {
      name: 'socialMedia',
      label: 'Mạng xã hội',
      type: 'group',
      fields: [
        {
          name: 'facebook',
          label: 'Facebook',
          type: 'text',
        },
        {
          name: 'twitter',
          label: 'Twitter',
          type: 'text',
        },
        {
          name: 'instagram',
          label: 'Instagram',
          type: 'text',
        },
        {
          name: 'linkedin',
          label: 'LinkedIn',
          type: 'text',
        },
        {
          name: 'youtube',
          label: 'Youtube',
          type: 'text',
        },
        {
          name: 'telegram',
          label: 'Telegram',
          type: 'text',
        }
      ]
    },
    {
      name: 'maps',
      label: 'Bản đồ',
      type: 'group',
      fields: [
        {
          name: 'googleMapsEmbed',
          label: 'Google Maps Embed URL',
          type: 'text',
          admin: {
            description: 'URL iframe của Google Maps (src từ thẻ iframe)'
          }
        },
        {
          name: 'latitude',
          label: 'Vĩ độ',
          type: 'text',
        },
        {
          name: 'longitude',
          label: 'Kinh độ',
          type: 'text',
        }
      ]
    },    {
      name: 'additionalInfo',
      label: 'Thông tin bổ sung',
      type: 'richText',
      editor: defaultLexical,
    },
    {
      name: 'logo',
      label: 'Logo công ty',
      type: 'upload',
      relationTo: 'media',
    }
  ],
  access: {
    read: () => true,
  },
};
