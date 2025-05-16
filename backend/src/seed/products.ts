// filepath: e:\Download\vrc\backend\src\seed\products.ts
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

// Simplified richText structure - this is a basic structure
// In a real implementation, you would use a proper markdown to richText converter
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

export const seedProducts = async (payload: Payload) => {
  console.log('📦 Seeding products...');

  try {
    // Fetch existing products to avoid duplicates
    const existingProducts = await payload.find({
      collection: 'products',
      limit: 100,
    });

    // If we already have products, skip
    if (existingProducts.docs.length > 0) {
      console.log(`Found ${existingProducts.docs.length} existing products, skipping seed.`);
      return;
    }

    // Get default media id for required media fields
    const defaultMediaId = await getDefaultMediaId(payload);
    if (!defaultMediaId) {
      console.error('Failed to get default media ID. Please upload at least one media item first.');
      return;
    }

    // Sample products based on the frontend data
    const products = [
      {
        name: "Điều hòa công nghiệp VRC-5000",
        excerpt: "Hệ thống điều hòa công nghiệp công suất lớn, phù hợp cho nhà xưởng, nhà máy sản xuất",
        description: createRichText("Hệ thống điều hòa công nghiệp công suất lớn, phù hợp cho nhà xưởng, nhà máy sản xuất."),
        category: "industrial",
        featured: true,
        status: "published",
        mainImage: defaultMediaId,
        price: "Liên hệ",
      },
      {
        name: "Kho lạnh bảo quản VRC-KL500",
        excerpt: "Kho lạnh công nghiệp lắp đặt nhanh chóng, bảo quản thực phẩm, dược phẩm với nhiệt độ ổn định",
        description: createRichText("Kho lạnh công nghiệp lắp đặt nhanh chóng, bảo quản thực phẩm, dược phẩm với nhiệt độ ổn định."),
        category: "cold-storage",
        featured: true,
        status: "published",
        mainImage: defaultMediaId,
        price: "Liên hệ",
      },
      {
        name: "Hệ thống lạnh thương mại VRC-CS200",
        excerpt: "Thiết bị làm lạnh cho siêu thị, nhà hàng và cửa hàng bán lẻ",
        description: createRichText("Thiết bị làm lạnh cho siêu thị, nhà hàng và cửa hàng bán lẻ"),
        category: "commercial",
        featured: true,
        status: "published",
        mainImage: defaultMediaId,
        price: "Liên hệ",
      },
    ];

    // Create products
    for (const product of products) {
      try {
        const createdProduct = await payload.create({
          collection: 'products',
          data: product as any, // Using type assertion as a temporary solution
        });
        console.log(`Created product: ${createdProduct.name}`);
      } catch (error) {
        console.error(`Error creating product ${product.name}:`, error);
      }
    }

    console.log(`✅ Successfully seeded products`);
  } catch (error) {
    console.error('Error seeding products:', error);
  }
}
