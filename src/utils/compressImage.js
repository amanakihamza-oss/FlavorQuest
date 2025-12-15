import imageCompression from 'browser-image-compression';

/**
 * Compresses an image file using browser-image-compression.
 * @param {File} imageFile - The file to compress
 * @returns {Promise<File>} - The compressed file
 */
export const compressImage = async (imageFile) => {
    // Basic validation
    if (!imageFile || !imageFile.type.startsWith('image/')) {
        console.warn("Invalid file type provided for compression:", imageFile?.type);
        return imageFile;
    }

    const options = {
        maxSizeMB: 0.8, // Max 800Ko
        maxWidthOrHeight: 1920, // Max width/height
        useWebWorker: true, // Use web worker for performance
        fileType: 'image/webp' // Convert to WebP
    };

    try {
        console.log(`Compressing ${imageFile.name} (${(imageFile.size / 1024 / 1024).toFixed(2)} MB)...`);
        const compressedFile = await imageCompression(imageFile, options);
        console.log(`Compression done: ${(compressedFile.size / 1024 / 1024).toFixed(2)} MB`);

        // Create a new File object to ensure name/type are preserved correctly if needed, 
        // though browser-image-compression returns a Blob/File. 
        // We often want to ensure it has a proper name extension if converted.
        // If converted to webp, the lib usually handles it, but let's be safe.
        return compressedFile;
    } catch (error) {
        console.error("Image compression failed:", error);
        // Fallback to original file if compression fails
        return imageFile;
    }
};
