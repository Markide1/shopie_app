import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  // Upload image function
  async uploadImage(
    file: Express.Multer.File,
    folder: string = 'shopie-profiles',
  ): Promise<string> {
    try {
      return await new Promise<string>((resolve, reject) => {
        const upload = cloudinary.uploader.upload_stream(
          {
            folder,
          },
          (
            error: UploadApiErrorResponse | undefined,
            result: UploadApiResponse | undefined,
          ) => {
            if (error || !result) {
              reject(
                error instanceof Error
                  ? error
                  : new Error(error?.message || 'Upload failed'),
              );
              return;
            }
            resolve(result.secure_url);
          },
        );

        upload.end(file.buffer);
      });
    } catch (error) {
      throw error instanceof Error
        ? error
        : new Error('Failed to upload image');
    }
  }

  // Delete image from Cloudinary
  async deleteImage(publicId: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      cloudinary.uploader
        .destroy(publicId)
        .then(() => resolve())
        .catch((error: Error) => {
          reject(new Error(`Failed to delete image: ${error.message}`));
        });
    });
  }
}
