// Cloudinary image optimization and transformation utilities

export interface CloudinaryTransformOptions {
  width?: number;
  height?: number;
  quality?: number | 'auto';
  format?: 'auto' | 'webp' | 'jpg' | 'png';
  crop?: 'fill' | 'fit' | 'scale' | 'thumb';
  gravity?: 'auto' | 'face' | 'center';
  blur?: number;
}

const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_BASE_URL = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload`;

/**
 * Generate optimized Cloudinary URL with transformations
 * Production-ready: handles responsive images, format conversion, quality optimization
 */
export const getCloudinaryUrl = (
  publicId: string,
  options: CloudinaryTransformOptions = {}
): string => {
  const {
    width,
    height,
    quality = 'auto',
    format = 'auto',
    crop = 'fill',
    gravity = 'auto',
    blur,
  } = options;

  const transformations: string[] = [];

  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);
  if (crop) transformations.push(`c_${crop}`);
  if (gravity && crop === 'fill') transformations.push(`g_${gravity}`);
  transformations.push(`q_${quality}`);
  transformations.push(`f_${format}`);
  if (blur) transformations.push(`e_blur:${blur}`);

  const transformString = transformations.join(',');
  return `${CLOUDINARY_BASE_URL}/${transformString}/${publicId}`;
};

/**
 * Generate responsive srcset for Next.js Image component
 */
export const getResponsiveSrcSet = (
  publicId: string,
  baseWidth: number = 1200
): string => {
  const widths = [640, 750, 828, 1080, 1200, 1920, 2048, 3840];
  const srcSet = widths
    .filter(w => w <= baseWidth * 2) // Don't upscale beyond 2x
    .map(w => {
      const url = getCloudinaryUrl(publicId, { width: w, quality: 'auto', format: 'auto' });
      return `${url} ${w}w`;
    })
    .join(', ');

  return srcSet;
};

/**
 * Get placeholder blur data URL for Next.js Image component
 * Uses tiny, heavily compressed version for instant loading
 */
export const getBlurDataUrl = (publicId: string): string => {
  return getCloudinaryUrl(publicId, {
    width: 10,
    quality: 30,
    format: 'auto',
    blur: 1000,
  });
};

/**
 * Presets for common use cases
 */
export const cloudinaryPresets = {
  feedThumbnail: (publicId: string) =>
    getCloudinaryUrl(publicId, { width: 600, height: 600, crop: 'fill', gravity: 'auto' }),
  
  feedFullscreen: (publicId: string) =>
    getCloudinaryUrl(publicId, { width: 1200, quality: 'auto', format: 'auto' }),
  
  desktopHero: (publicId: string) =>
    getCloudinaryUrl(publicId, { width: 2400, quality: 'auto', format: 'auto' }),
  
  collectionCover: (publicId: string) =>
    getCloudinaryUrl(publicId, { width: 800, height: 1000, crop: 'fill', gravity: 'auto' }),
};
