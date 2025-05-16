// filepath: e:\Download\vrc\backend\src\seed\services.ts
import { Payload } from 'payload';

// Helper function to get a default media ID for required media fields
async function getDefaultMediaId(payload: Payload): Promise<string | null> {
  try {
    const media = await payload.find({
      collection: 'media',
      limit: 1,
    });
    
    if (media?.docs && media.docs.length > 0 && media.docs[0]?.id) {
      return media.docs[0].id;
    }
    return null;
  } catch (error) {
    console.error('Error fetching default media:', error);
    return null;
  }
}

// Simplified richText structure
const createRichText = (text: string) => {
  return {
    root: {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          version: 1,
          children: [
            {
              type: 'text',
              text: text,
              version: 1,
            },
          ],
        },
      ],
      direction: null,
      format: '',
      indent: 0,
      version: 1,
    }
  };
};

export const seedServices = async (payload: Payload) => {
  console.log('🛠️ Seeding services...');

  try {
    // Fetch existing services to avoid duplicates
    const existingServices = await payload.find({
      collection: 'services',
      limit: 100,
    });

    // If we already have services, skip
    if (existingServices.docs.length > 0) {
      console.log(`Found ${existingServices.docs.length} existing services, skipping seed.`);
      return;
    }

    // Get default media id for required media fields
    const defaultMediaId = await getDefaultMediaId(payload);
    if (!defaultMediaId) {
      console.error('Failed to get default media ID. Please upload at least one media item first.');
      return;
    }

    // Sample services based on the frontend data
    const services = [
      {
        title: "Dịch vụ bảo trì chuyên nghiệp",
        summary: "Đội ngũ kỹ thuật hàng đầu, phục vụ 24/7 cho các hệ thống điện lạnh công nghiệp và thương mại",
        type: "maintenance", // Required field
        featured: true,
        status: "published",
        featuredImage: defaultMediaId, // Required field
        content: createRichText("Đội ngũ kỹ thuật hàng đầu, phục vụ 24/7 cho các hệ thống điện lạnh công nghiệp và thương mại."),
        price: "Theo hợp đồng",
      },
      {
        title: "Tư vấn giải pháp tiết kiệm năng lượng",
        summary: "Giải pháp xanh cho tương lai bền vững, giúp doanh nghiệp tiết kiệm chi phí",
        type: "consulting", // Required field
        featured: true,
        status: "published",
        featuredImage: defaultMediaId, // Required field
        content: createRichText("Giải pháp xanh cho tương lai bền vững, giúp doanh nghiệp tiết kiệm chi phí."),
        price: "Theo dự án",
      },
      {
        title: "Dịch vụ sửa chữa khẩn cấp",
        summary: "Khắc phục sự cố nhanh chóng, hỗ trợ 24/7 cho mọi hệ thống điện lạnh",
        type: "repair", // Required field
        featured: true,
        status: "published",
        featuredImage: defaultMediaId, // Required field
        content: createRichText("Khắc phục sự cố nhanh chóng, hỗ trợ 24/7 cho mọi hệ thống điện lạnh."),
        price: "Theo giờ",
      },
    ];

    // Create services
    for (const service of services) {
      try {
        const createdService = await payload.create({
          collection: 'services',
          data: service as any, // Using type assertion as a temporary solution
        });
        console.log(`Created service: ${createdService.title}`);
      } catch (error) {
        console.error(`Error creating service ${service.title}:`, error);
      }
    }

    console.log(`✅ Successfully seeded services`);
  } catch (error) {
    console.error('Error seeding services:', error);
  }
}
