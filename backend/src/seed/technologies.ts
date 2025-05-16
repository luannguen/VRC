// filepath: e:\Download\vrc\backend\src\seed\technologies.ts
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

export const seedTechnologies = async (payload: Payload) => {
  console.log('🔬 Seeding technologies...');

  try {
    // Fetch existing technologies to avoid duplicates
    const existingTechnologies = await payload.find({
      collection: 'technologies',
      limit: 100,
    });

    // If we already have technologies, skip
    if (existingTechnologies.docs.length > 0) {
      console.log(`Found ${existingTechnologies.docs.length} existing technologies, skipping seed.`);
      return;
    }

    // Get default media id for required media fields
    const defaultMediaId = await getDefaultMediaId(payload);
    if (!defaultMediaId) {
      console.error('Failed to get default media ID. Please upload at least one media item first.');
      return;
    }    // Sample technologies based on the frontend data
    const technologies = [
      {
        name: "Inverter DC",
        type: "technology", // Required field
        logo: defaultMediaId, // Required field
        description: createRichText("Công nghệ biến tần tiết kiệm năng lượng, điều chỉnh công suất linh hoạt theo nhu cầu."),
        featured: true,
        status: "published",
        order: 1,
      },
      {
        name: "Smart Control System",
        type: "technology", // Required field
        logo: defaultMediaId, // Required field
        description: createRichText("Hệ thống điều khiển thông minh, quản lý từ xa qua internet và tối ưu hóa vận hành."),
        featured: true,
        status: "published",
        order: 2,
      },
      {
        name: "Green Refrigerant",
        type: "technology", // Required field
        logo: defaultMediaId, // Required field
        description: createRichText("Môi chất lạnh thân thiện với môi trường, không làm suy giảm tầng ozone."),
        featured: true,
        status: "published",
        order: 3,
      },
      // Partners
      {
        name: "Daikin",
        type: "partner", // Partner type
        logo: defaultMediaId, // Required field
        description: createRichText("Đối tác chiến lược cung cấp thiết bị điều hòa không khí và giải pháp điện lạnh chất lượng cao."),
        website: "https://www.daikin.com",
        featured: true,
        status: "published",
        order: 1,
      },
      {
        name: "Carrier",
        type: "partner", // Partner type
        logo: defaultMediaId, // Required field
        description: createRichText("Nhà cung cấp hàng đầu về các giải pháp HVAC và hệ thống lạnh công nghiệp."),
        website: "https://www.carrier.com",
        featured: true,
        status: "published",
        order: 2,
      },      {
        name: "Mitsubishi Electric",
        type: "partner", // Partner type
        logo: defaultMediaId, // Required field
        description: createRichText("Đối tác cung cấp công nghệ điện lạnh tiên tiến với hiệu suất cao và thân thiện môi trường."),
        website: "https://www.mitsubishielectric.com",
        featured: true,
        status: "published",
        order: 3,
      },
      {
        name: "Trane",
        type: "partner", // Partner type
        logo: defaultMediaId, // Required field
        description: createRichText("Đối tác cung cấp giải pháp điều hòa không khí và làm lạnh hiệu quả cho các công trình quy mô lớn."),
        website: "https://www.trane.com",
        featured: true,
        status: "published",
        order: 4,
      },
      {
        name: "LG Electronics",
        type: "partner", // Partner type
        logo: defaultMediaId, // Required field
        description: createRichText("Đối tác chuyên về hệ thống điều hòa không khí thương mại và dân dụng, với nhiều giải pháp tiết kiệm năng lượng."),
        website: "https://www.lg.com",
        featured: true,
        status: "published",
        order: 5,
      },
      {
        name: "York",
        type: "partner", // Partner type
        logo: defaultMediaId, // Required field
        description: createRichText("Đối tác chuyên cung cấp các hệ thống điều hòa không khí và làm lạnh công nghiệp hiệu suất cao."),
        website: "https://www.york.com",
        featured: false,
        status: "published",
        order: 6,
      },
      // Suppliers
      {
        name: "Danfoss",
        type: "supplier", // Supplier type
        logo: defaultMediaId, // Required field
        description: createRichText("Nhà cung cấp thiết bị và giải pháp điều khiển cho ngành công nghiệp điện lạnh và tự động hóa."),
        website: "https://www.danfoss.com",
        featured: true,
        status: "published",
        order: 1,
      },
      {
        name: "Emerson",
        type: "supplier", // Supplier type
        logo: defaultMediaId, // Required field
        description: createRichText("Nhà cung cấp linh kiện và thiết bị cho hệ thống lạnh thương mại và công nghiệp."),
        website: "https://www.emerson.com",
        featured: true,
        status: "published",
        order: 2,
      }
    ];

    // Create technologies
    for (const tech of technologies) {
      try {
        const createdTech = await payload.create({
          collection: 'technologies',
          data: tech as any, // Using type assertion as a temporary solution
        });
        console.log(`Created technology: ${createdTech.name}`);
      } catch (error) {
        console.error(`Error creating technology ${tech.name}:`, error);
      }
    }

    console.log(`✅ Successfully seeded technologies`);
  } catch (error) {
    console.error('Error seeding technologies:', error);
  }
};
