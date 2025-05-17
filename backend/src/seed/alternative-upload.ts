/**
 * Alternative approach for uploading media files during the seeding process
 * Without using direct file streams that cause TypeScript errors.
 * 
 * This file serves as documentation for how to approach this with simpler
 * TypeScript-compatible techniques that work with Payload CMS.
 */

import fs from 'fs';
import path from 'path';
import { Payload } from 'payload';
import { createMediaRecord } from './utils/seedMediaManagement';

/**
 * How to properly upload media files via the seed process.
 * 
 * Instead of directly passing ReadStream objects, which causes TypeScript errors,
 * a better approach is to:
 * 
 * 1. First create the media record in the Media collection
 * 2. Then manually copy the file to the correct public directory
 * 3. Update the media record with the correct filename
 * 
 * This avoids the TypeScript compatibility issues with ReadStreams and the Payload types.
 */

export async function uploadMediaItemProperly(
  payload: Payload, 
  sourceImagePath: string, 
  altText: string
): Promise<string | null> {
  try {
    // Đảm bảo file tồn tại
    if (!fs.existsSync(sourceImagePath)) {
      console.error(`File not found: ${sourceImagePath}`);
      return null;
    }
    
    const fileName = path.basename(sourceImagePath);
    const fileExt = path.extname(fileName).toLowerCase();
    
    // Tạo tên file duy nhất bằng cách thêm timestamp
    const uniqueFileName = `${path.basename(fileName, fileExt)}-${Date.now()}${fileExt}`;
    
    // Step 1: Tạo bản ghi media trong Payload CMS
    const mediaDoc = await payload.create({
      collection: 'media',
      data: {
        alt: altText,
        filename: uniqueFileName
      },
    });
    
    if (!mediaDoc?.id) {
      console.error(`Failed to create media record for ${fileName}`);
      return null;
    }
    
    // Step 2: Xác định đường dẫn đến thư mục media của Payload CMS
    const payloadMediaDir = path.resolve(process.cwd(), 'media');
    
    // Tạo thư mục nếu không tồn tại
    if (!fs.existsSync(payloadMediaDir)) {
      fs.mkdirSync(payloadMediaDir, { recursive: true });
    }
    
    const destPath = path.join(payloadMediaDir, uniqueFileName);
    
    // Step 3: Sao chép file vào thư mục media
    fs.copyFileSync(sourceImagePath, destPath);
    console.log(`Copied ${sourceImagePath} to ${destPath}`);
    
    // Step 4: Cập nhật bản ghi media với thông tin file
    await payload.update({
      collection: 'media',
      id: mediaDoc.id,
      data: {
        url: `/media/${uniqueFileName}`,
        filename: uniqueFileName,
        mimeType: getMimeType(fileExt.slice(1)), // Loại bỏ dấu . từ fileExt
        filesize: fs.statSync(sourceImagePath).size,
        width: 0, // Lý tưởng thì lấy kích thước thực từ file hình ảnh
        height: 0 // Lý tưởng thì lấy kích thước thực từ file hình ảnh
      }
    });
    
    console.log(`Updated media record for ${uniqueFileName} with ID: ${mediaDoc.id}`);
    return mediaDoc.id;
  } catch (error) {
    console.error(`Error uploading media:`, error);
    return null;
  }
}

/**
 * Lấy MIME type từ phần mở rộng file
 */
function getMimeType(extension: string): string {
  const types: Record<string, string> = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'svg': 'image/svg+xml',
    'webp': 'image/webp',
  };
  
  return types[extension.toLowerCase()] || 'application/octet-stream';
}

/**
 * Usage instructions:
 * 
 * 1. Replace the direct file approach in uploadMediaFromFrontend with the above method
 * 2. Define the createMediaRecord function in seedMediaManagement.ts
 * 3. Copy files via copyFile instead of using streams
 * 4. Update the media records with filenames
 * 
 * This avoids TypeScript incompatibility while achieving the same result.
 */
