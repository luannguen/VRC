/**
 * This script tests the ability to upload images from frontend to backend
 * during the seeding process.
 * 
 * Usage: 
 * npx ts-node src/seed/test/test-upload-image.ts
 */

import dotenv from 'dotenv';
import { join } from 'path';
import { existsSync } from 'fs';

// Load environment variables
dotenv.config();

async function testUploadImage() {
  try {
    // Import payload and config dynamically
    const { default: payload } = await import('payload');
    
    // Import our utility functions
    const { uploadMediaFromFrontend } = await import('../utils/uploadMedia');
    
    // Initialize payload
    await payload.init({
      // @ts-ignore - Type definitions may not match the runtime implementation
      local: true,
    } as any);
    
    console.log('🧪 Testing image upload functionality...');
    
    // Test paths for commonly used images
    const testPaths = [
      join(process.cwd(), '../vrcfrontend/public/assets/svg/logo.svg'),
      join(process.cwd(), '../vrcfrontend/public/assets/images/service-overview.jpg'),
      join(process.cwd(), '../vrcfrontend/public/assets/images/projects-overview.jpg'),
    ];
    
    // Test each path
    for (const imagePath of testPaths) {
      if (existsSync(imagePath)) {
        console.log(`Testing upload of ${imagePath}...`);
        const mediaId = await uploadMediaFromFrontend(
          payload, 
          imagePath, 
          `Test upload of ${imagePath}`
        );
        
        if (mediaId) {
          console.log(`✅ Successfully uploaded image ${imagePath} with ID: ${mediaId}`);
        } else {
          console.error(`❌ Failed to upload image ${imagePath}`);
        }
      } else {
        console.warn(`⚠️ Image path does not exist: ${imagePath}`);
      }
    }
    
    console.log('🎉 Image upload test completed!');
    process.exit(0);
  } catch (error) {
    console.error('Error during test:', error);
    console.error(error instanceof Error ? error.stack : String(error));
    process.exit(1);
  }
}

// Execute the test
testUploadImage();
