// filepath: e:\Download\vrc\backend\src\seed\products.ts
import { Payload } from 'payload';

// Import our improved media management utilities
import { 
  getImageForCollectionItem,
  getOrCreateDefaultMediaId 
} from './utils/seedMediaManagement';

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
    }    // Get or create a default media ID for fallback
    const defaultMediaId = await getOrCreateDefaultMediaId(payload);
    console.log('Default media ID for products fallback:', defaultMediaId);

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
    ];    // Create products
    for (const product of products) {
      try {
        // Get appropriate image for this product
        const mediaId = await getImageForCollectionItem(
          payload, 
          'product', 
          product.name
        );
        
        // Create product with the appropriate image
        const data = {
          ...product,
          mainImage: mediaId || defaultMediaId
        };
        
        const createdProduct = await payload.create({
          collection: 'products',
          data: data as any, // Using type assertion as a temporary solution
        });
        console.log(`Created product: ${createdProduct.name} with media ID: ${data.mainImage}`);
      } catch (error) {
        console.error(`Error creating product ${product.name}:`, error);
      }
    }

    console.log(`✅ Successfully seeded products`);
  } catch (error) {
    console.error('Error seeding products:', error);
  }
}
