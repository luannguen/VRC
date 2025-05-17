/**
 * Tiện ích xử lý hình ảnh và file
 * Cung cấp các hàm nâng cao để làm việc với file hình ảnh
 */
import * as fs from 'fs';
import * as path from 'path';
import { Payload } from 'payload';
import { PATHS } from './pathConfig';

/**
 * Interface để lưu thông tin hình ảnh
 */
interface ImageDimensions {
  width: number;
  height: number;
}

/**
 * Lấy kích thước của hình ảnh
 * Chú ý: Đây chỉ là phiên bản giả lập, trong thực tế bạn cần sử dụng thư viện như sharp hoặc image-size
 * 
 * @param filePath Đường dẫn đến file hình ảnh
 * @returns Kích thước hình ảnh (width, height) hoặc giá trị mặc định
 */
export function getImageDimensions(filePath: string): ImageDimensions {
  try {
    // Trong môi trường thực tế, sử dụng thư viện như sharp hoặc image-size
    // Ví dụ: const dimensions = require('image-size')(filePath);
    
    // Đây chỉ là giá trị mặc định, trong thực tế sẽ được thay thế bằng kích thước thật
    const fileExt = path.extname(filePath).toLowerCase();
    
    if (fileExt === '.svg') {
      return { width: 512, height: 512 }; // Default for SVG icons
    } else if (['.jpg', '.jpeg', '.png'].includes(fileExt)) {
      return { width: 1920, height: 1080 }; // Default for photos
    } else {
      return { width: 800, height: 600 }; // Default for other images
    }
  } catch (error) {
    console.error(`Error getting image dimensions: ${filePath}`, error);
    return { width: 0, height: 0 };
  }
}

/**
 * Tạo thư mục nếu không tồn tại
 * 
 * @param dirPath Đường dẫn thư mục cần tạo
 */
export function ensureDirectoryExists(dirPath: string): void {
  try {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`Created directory: ${dirPath}`);
    }
  } catch (error) {
    console.error(`Error creating directory: ${dirPath}`, error);
  }
}

/**
 * Tạo tên file duy nhất với timestamp
 * 
 * @param originalFilename Tên file ban đầu
 * @returns Tên file duy nhất với timestamp
 */
export function generateUniqueFilename(originalFilename: string): string {
  const fileExt = path.extname(originalFilename);
  const baseName = path.basename(originalFilename, fileExt);
  return `${baseName}-${Date.now()}${fileExt}`;
}

/**
 * Lấy MIME type từ phần mở rộng file
 * 
 * @param extension Phần mở rộng file (không bao gồm dấu chấm)
 * @returns MIME type tương ứng
 */
export function getMimeType(extension: string): string {
  const types: Record<string, string> = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'svg': 'image/svg+xml',
    'webp': 'image/webp',
    'pdf': 'application/pdf',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'xls': 'application/vnd.ms-excel',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'ppt': 'application/vnd.ms-powerpoint',
    'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  };
  
  return types[extension.toLowerCase()] || 'application/octet-stream';
}

/**
 * Tải file lên thư mục media của Payload CMS với thông tin đầy đủ
 * 
 * @param payload Payload instance
 * @param sourceFilePath Đường dẫn đến file nguồn
 * @param altText Alt text cho file media
 * @returns ID của media đã tải lên hoặc null nếu có lỗi
 */
export async function uploadFileToPayloadMedia(
  payload: Payload,
  sourceFilePath: string,
  altText: string
): Promise<string | null> {
  try {
    // Kiểm tra file tồn tại
    if (!fs.existsSync(sourceFilePath)) {
      console.error(`File not found: ${sourceFilePath}`);
      return null;
    }
    
    const fileName = path.basename(sourceFilePath);
    const fileExt = path.extname(fileName).toLowerCase();
    
    // Tạo tên file duy nhất
    const uniqueFileName = generateUniqueFilename(fileName);
    
    // Đảm bảo thư mục media tồn tại
    ensureDirectoryExists(PATHS.BACKEND_MEDIA);
    
    // Đường dẫn đích trong thư mục media
    const destinationPath = path.join(PATHS.BACKEND_MEDIA, uniqueFileName);
    
    // Lấy kích thước file và hình ảnh
    const fileSizeBytes = fs.statSync(sourceFilePath).size;
    const dimensions = getImageDimensions(sourceFilePath);
    
    // Sao chép file
    fs.copyFileSync(sourceFilePath, destinationPath);
    console.log(`Copied file from ${sourceFilePath} to ${destinationPath}`);
    
    // Tạo bản ghi media
    const mediaDoc = await payload.create({
      collection: 'media',
      data: {
        alt: altText,
        filename: uniqueFileName,
        url: `/media/${uniqueFileName}`,
        mimeType: getMimeType(fileExt.slice(1)),
        filesize: fileSizeBytes,
        width: dimensions.width,
        height: dimensions.height,
      }
    });
    
    if (mediaDoc?.id) {
      console.log(`Created media record for ${uniqueFileName} with ID: ${mediaDoc.id}`);
      return mediaDoc.id;
    }
    
    return null;
  } catch (error) {
    console.error(`Error uploading file: ${sourceFilePath}`, error);
    return null;
  }
}

/**
 * Cache đã upload để tránh upload trùng lặp
 */
const uploadedFileCache: Record<string, string> = {};

/**
 * Upload file với cache để tránh upload trùng lặp
 * 
 * @param payload Payload instance
 * @param sourceFilePath Đường dẫn file nguồn
 * @param altText Alt text cho media
 * @returns ID của media đã tải lên
 */
export async function uploadFileWithCache(
  payload: Payload,
  sourceFilePath: string,
  altText: string
): Promise<string | null> {
  // Kiểm tra cache trước
  if (uploadedFileCache[sourceFilePath]) {
    console.log(`Using cached media ID for ${sourceFilePath}: ${uploadedFileCache[sourceFilePath]}`);
    return uploadedFileCache[sourceFilePath];
  }
  
  // Upload file và lưu vào cache
  const mediaId = await uploadFileToPayloadMedia(payload, sourceFilePath, altText);
  
  if (mediaId) {
    uploadedFileCache[sourceFilePath] = mediaId;
  }
  
  return mediaId;
}
