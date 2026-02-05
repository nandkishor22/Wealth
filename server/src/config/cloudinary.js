import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
});

/**
 * Upload image to Cloudinary
 * @param {string} filePath - Path to the file to upload
 * @param {string} folder - Folder in Cloudinary to store the image
 * @returns {object} Upload result with secure_url and public_id
 */
export const uploadToCloudinary = async (filePath, folder = 'wealth-receipts') => {
    try {
        const result = await cloudinary.uploader.upload(filePath, {
            folder: folder,
            resource_type: 'auto',
            transformation: [
                { quality: 'auto', fetch_format: 'auto' },
                { width: 1500, crop: 'limit' } // Limit max width while maintaining aspect ratio
            ]
        });

        return {
            success: true,
            url: result.secure_url,
            publicId: result.public_id,
            format: result.format,
            width: result.width,
            height: result.height
        };
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        throw new Error(`Failed to upload image: ${error.message}`);
    }
};

/**
 * Delete image from Cloudinary
 * @param {string} publicId - Public ID of the image to delete
 * @returns {object} Deletion result
 */
export const deleteFromCloudinary = async (publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        return {
            success: result.result === 'ok',
            message: result.result
        };
    } catch (error) {
        console.error('Cloudinary deletion error:', error);
        throw new Error(`Failed to delete image: ${error.message}`);
    }
};

/**
 * Get optimized image URL
 * @param {string} publicId - Public ID of the image
 * @param {object} options - Transformation options
 * @returns {string} Optimized image URL
 */
export const getOptimizedImageUrl = (publicId, options = {}) => {
    const { width = 800, quality = 'auto', format = 'auto' } = options;

    return cloudinary.url(publicId, {
        transformation: [
            { width, quality, fetch_format: format, crop: 'limit' }
        ]
    });
};

export default cloudinary;
