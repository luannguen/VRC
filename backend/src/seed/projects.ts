// filepath: e:\Download\vrc\backend\src\seed\projects.ts
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

export const seedProjects = async (payload: Payload) => {
  console.log('🏗️ Seeding projects...');

  try {
    // Fetch existing projects to avoid duplicates
    const existingProjects = await payload.find({
      collection: 'projects',
      limit: 100,
    });

    // If we already have projects, skip
    if (existingProjects.docs.length > 0) {
      console.log(`Found ${existingProjects.docs.length} existing projects, skipping seed.`);
      return;
    }

    // Get default media id for required media fields
    const defaultMediaId = await getDefaultMediaId(payload);
    if (!defaultMediaId) {
      console.error('Failed to get default media ID. Please upload at least one media item first.');
      return;
    }

    // Sample projects based on the frontend data
    const projects = [
      {
        title: "Nhà máy sản xuất Vinamilk",
        client: "Vinamilk",
        summary: "Hệ thống lạnh công nghiệp cho nhà máy sản xuất sữa quy mô lớn",
        location: "Bình Dương, Việt Nam",
        timeframe: {
          startDate: new Date("2023-01-15").toISOString(),
          endDate: new Date("2023-05-15").toISOString(),
          isOngoing: false
        },
        featured: true,
        status: "published",
        featuredImage: defaultMediaId, // Required field
        content: createRichText("Triển khai hệ thống lạnh công nghiệp hiện đại cho nhà máy sản xuất sữa quy mô lớn tại Bình Dương."),
      },
      {
        title: "Siêu thị Mega Market",
        client: "Mega Market",
        summary: "Hệ thống lạnh thương mại tổng thể cho chuỗi siêu thị lớn",
        location: "Hà Nội, Việt Nam",
        timeframe: {
          startDate: new Date("2023-04-10").toISOString(),
          endDate: new Date("2023-08-20").toISOString(),
          isOngoing: false
        },
        featured: true,
        status: "published",
        featuredImage: defaultMediaId, // Required field
        content: createRichText("Thiết kế và lắp đặt hệ thống lạnh thương mại tổng thể cho chuỗi siêu thị lớn tại Hà Nội."),
      },
      {
        title: "Nhà máy chế biến thủy sản Minh Phú",
        client: "Minh Phú Seafood",
        summary: "Hệ thống kho lạnh công nghiệp quy mô lớn cho nhà máy chế biến thủy sản xuất khẩu",
        location: "Cà Mau, Việt Nam",
        timeframe: {
          startDate: new Date("2023-06-01").toISOString(),
          endDate: new Date("2023-10-10").toISOString(),
          isOngoing: false
        },
        featured: true,
        status: "published",
        featuredImage: defaultMediaId, // Required field
        content: createRichText("Thiết kế và lắp đặt hệ thống kho lạnh công nghiệp quy mô lớn cho nhà máy chế biến thủy sản xuất khẩu tại Cà Mau."),
      },
    ];

    // Create projects
    for (const project of projects) {
      try {
        const createdProject = await payload.create({
          collection: 'projects',
          data: project as any, // Using type assertion as a temporary solution
        });
        console.log(`Created project: ${createdProject.title}`);
      } catch (error) {
        console.error(`Error creating project ${project.title}:`, error);
      }
    }

    console.log(`✅ Successfully seeded projects`);
  } catch (error) {
    console.error('Error seeding projects:', error);
  }
}
