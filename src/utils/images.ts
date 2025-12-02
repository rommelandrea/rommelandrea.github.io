import { getImage } from 'astro:assets';
import type { GetImageResult } from 'astro';

/**
 * Image optimization options
 */
export interface OptimizeImageOptions {
  src: string;
  width?: number;
  height?: number;
  format?: 'avif' | 'webp' | 'png' | 'jpg' | 'jpeg';
  quality?: number;
  alt?: string;
}

/**
 * Cache for optimized images to avoid re-processing
 * Key: string representation of the image path and options
 * Value: GetImageResult
 */
const imageCache = new Map<string, GetImageResult>();

/**
 * Generate a cache key from image options
 */
function getCacheKey(options: OptimizeImageOptions): string {
  const { src, width, height, format, quality } = options;
  const srcStr = typeof src === 'string' ? src : src.src;
  return `${srcStr}-${width || 'auto'}-${height || 'auto'}-${format || 'auto'}-${quality || 'auto'}`;
}

/**
 * Optimize an image at build time
 *
 * This function:
 * - Checks if the image is already optimized (cached)
 * - Uses Astro's getImage() for optimization
 * - Handles both public/ folder images (string paths) and src/assets/ images (ImageMetadata)
 * - Returns optimized image data with src, width, height, and srcset
 *
 * @param options - Image optimization options
 * @returns Optimized image result
 */
export async function optimizeImage(
  options: OptimizeImageOptions
): Promise<GetImageResult> {
  const cacheKey = getCacheKey(options);

  // Check cache first
  if (imageCache.has(cacheKey)) {
    return imageCache.get(cacheKey)!;
  }

  const { src, width, height, format, quality } = options;

  // For images in public/ folder (string paths), we need width and height
  if (typeof src === 'string') {
    // If it's a remote URL, we can't optimize it at build time
    if (src.startsWith('http://') || src.startsWith('https://')) {
      // Return a mock result for remote images
      const result: GetImageResult = {
        src,
        attributes: {
          width: width || 1200,
          height: height || 630,
        },
        options: {
          src,
          width: width || 1200,
          height: height || 630,
        },
        rawOptions: {
          src,
          width: width || 1200,
          height: height || 630,
        },
        srcSet: {
          values: [],
          attribute: '',
        },
      };
      imageCache.set(cacheKey, result);
      return result;
    }

    // For public/ folder images, we need width and height
    if (!width || !height) {
      console.warn(
        `Image optimization: width and height are required for public/ folder images: ${src}`
      );
      // Return unoptimized result
      const result: GetImageResult = {
        src,
        attributes: {
          width: width || 1200,
          height: height || 630,
        },
        options: {
          src,
          width: width || 1200,
          height: height || 630,
        },
        rawOptions: {
          src,
          width: width || 1200,
          height: height || 630,
        },
        srcSet: {
          values: [],
          attribute: '',
        },
      };
      imageCache.set(cacheKey, result);
      return result;
    }

    // Optimize public/ folder image
    try {
      const result = await getImage({
        src,
        width,
        height,
        format: format || 'webp',
        quality: quality || 80,
      });
      imageCache.set(cacheKey, result);
      return result;
    } catch (error) {
      console.error(`Error optimizing image ${src}:`, error);
      // Return fallback
      const result: GetImageResult = {
        src,
        attributes: {
          width,
          height,
        },
        options: {
          src,
          width,
          height,
        },
        rawOptions: {
          src,
          width,
          height,
        },
        srcSet: {
          values: [],
          attribute: '',
        },
      };
      imageCache.set(cacheKey, result);
      return result;
    }
  }

  // For ImageMetadata (imported from src/assets/), optimize it
  try {
    const result = await getImage({
      src,
      width: width,
      height: height,
      format: format || 'webp',
      quality: quality || 80,
    });
    imageCache.set(cacheKey, result);
    return result;
  } catch (error) {
    console.error(`Error optimizing image:`, error);
    // Return fallback
    const metadata = src as ImageMetadata;
    const result: GetImageResult = {
      src: metadata.src,
      attributes: {
        width: width || metadata.width,
        height: height || metadata.height,
      },
      options: {
        src,
        width: width || metadata.width,
        height: height || metadata.height,
      },
      rawOptions: {
        src,
        width: width || metadata.width,
        height: height || metadata.height,
      },
      srcSet: {
        values: [],
        attribute: '',
      },
    };
    imageCache.set(cacheKey, result);
    return result;
  }
}

/**
 * Get optimized image for hero images
 * Defaults to 1200x630 (Open Graph standard) if dimensions not provided
 */
export async function getOptimizedHeroImage(
  src: string | ImageMetadata | undefined,
  options?: {
    width?: number;
    height?: number;
    format?: 'avif' | 'webp' | 'png' | 'jpg' | 'jpeg';
    quality?: number;
  }
): Promise<GetImageResult | null> {
  if (!src) return null;

  return optimizeImage({
    src,
    width: options?.width || 1200,
    height: options?.height || 630,
    format: options?.format || 'webp',
    quality: options?.quality || 80,
  });
}

/**
 * Get optimized image for blog post cards
 * Defaults to 400x225 (16:9 aspect ratio) if dimensions not provided
 */
export async function getOptimizedCardImage(
  src: string | ImageMetadata | undefined,
  options?: {
    width?: number;
    height?: number;
    format?: 'avif' | 'webp' | 'png' | 'jpg' | 'jpeg';
    quality?: number;
  }
): Promise<GetImageResult | null> {
  if (!src) return null;

  return optimizeImage({
    src,
    width: options?.width || 400,
    height: options?.height || 225,
    format: options?.format || 'webp',
    quality: options?.quality || 75,
  });
}

/**
 * Check if an image path exists and is valid
 * For public/ folder images, we can't check at build time easily,
 * but we can validate the path format
 */
export function isValidImagePath(path: string | undefined): boolean {
  if (!path) return false;

  // Remote URLs are valid
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return true;
  }

  // Public folder paths should start with /
  if (path.startsWith('/')) {
    return true;
  }

  // Relative paths are valid
  if (path.startsWith('./') || path.startsWith('../')) {
    return true;
  }

  return false;
}


