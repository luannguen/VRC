// filepath: e:\Download\vrc\backend\src\seed\index.ts
import { Payload } from 'payload';
import { seedProducts } from './products';
import { seedServices } from './services';
import { seedProjects } from './projects';
import { seedTechnologies } from './technologies';
import { seedNavigation } from './navigation';
import { seedCompanyInfo } from './company-info';
import { seedHeaderFooter } from './header-footer';
import { seedPosts } from './posts';
import { seedEventCategories } from './event-categories';
import { seedEvents } from './events';

export const seed = async (payload: Payload) => {
  console.log('🌱 Starting seed process...');
  console.log('🖼️ Images will be automatically uploaded from the frontend directory during seeding');

  // Seed data in a specific order - globals first
  await seedCompanyInfo(payload);
  await seedHeaderFooter(payload);
  
  // Then collections
  await seedNavigation(payload);
  await seedProducts(payload);
  await seedServices(payload);
  await seedProjects(payload);
  await seedTechnologies(payload);
  await seedPosts(payload);
  // Thêm category trước khi thêm events
  await seedEventCategories(payload);
  await seedEvents(payload);

  console.log('🌱 Seed process completed!');
  console.log('🖼️ All available frontend images have been uploaded to the backend');
};

export default seed;
