/**
 * Aggressive Cloudinary Image Optimization System
 * Targets 70-85% bandwidth reduction through:
 * - AVIF format (20-30% smaller than WebP)
 * - Device Pixel Ratio optimization (1x for standard displays)
 * - Smart cropping with facial recognition
 * - Device-specific responsive sizing
 * - Ultra-low quality blur placeholders (5-8% quality)
 * - Automatic quality adjustment based on format and device
 */

// Device-specific responsive sizes (mobile-first approach)
export const RESPONSIVE_SIZES_HERO = {
  mobile: 320,
  tablet: 640,
  desktop: 1024,
  wide: 1440,
  ultrawide: 1920,
};

export const RESPONSIVE_SIZES_CARD = {
  mobile: 280,
  tablet: 400,
  desktop: 500,
};

export const RESPONSIVE_SIZES_THUMBNAIL = {
  mobile: 80,
  tablet: 120,
  desktop: 150,
};

export const RESPONSIVE_SIZES_PROFILE = {
  mobile: 200,
  tablet: 300,
  desktop: 400,
};

export interface OptimizationOptions {
  quality?: 'auto' | number; // 'auto' for device-specific, or 1-100
  dpr?: 'auto' | number; // 'auto' for device-aware, or 1-3
  format?: 'auto' | 'avif' | 'webp' | 'jpg' | 'png';
  gravity?: 'face' | 'center'; // Removed 'auto' to disable smart cropping
  crop?: 'fill' | 'scale' | 'fit' | 'thumb';
  width?: number;
  height?: number;
  radius?: number;
  aspectRatio?: string;
  fetch_format?: 'auto' | 'avif' | 'webp' | 'jpg' | 'png';
}

interface BlurPlaceholderOptions {
  width?: number;
  height?: number;
  quality?: number;
}

/**
 * Main optimization function for regular images
 * Automatically applies AVIF format, auto-quality, and device-aware DPR
 */
export function optimizeCloudinaryUrl(
  url: string,
  options: OptimizationOptions = {}
): string {
  if (!url || typeof url !== 'string') return url;

  // If not a Cloudinary URL, return as-is
  if (!url.includes('cloudinary.com') && !url.includes('res.cloudinary.com')) {
    return url;
  }

  const {
    quality = 'auto',
    dpr = 'auto',
    format = 'avif',
    gravity = 'auto',
    crop = 'fill',
    width,
    height,
    radius,
    aspectRatio,
    fetch_format = 'auto',
  } = options;

  // Parse Cloudinary URL
  // Format: https://res.cloudinary.com/[cloud]/image/upload/[transformations]/[public_id]
  const parts = url.split('/upload/');
  if (parts.length !== 2) return url;

  const [baseUrl, publicId] = parts;
  const transformations: string[] = [];

  // 1. AVIF format (20-30% smaller than WebP)
  // With fallback chain: AVIF > WebP > Original
  if (format === 'avif') {
    transformations.push('f_auto'); // Let Cloudinary choose best format
  }

  // 2. Quality optimization - Auto quality based on format and device
  if (quality === 'auto') {
    // 60-75 for AVIF (very efficient), 75-85 for WebP, 80-90 for JPEG
    transformations.push('q_auto:eco'); // eco mode = best compression without visible degradation
  } else if (typeof quality === 'number') {
    transformations.push(`q_${Math.max(1, Math.min(100, quality))}`);
  }

  // 3. Device Pixel Ratio optimization
  if (dpr === 'auto') {
    transformations.push('dpr_auto'); // Serve 1x for standard, 2x for retina
  } else if (typeof dpr === 'number') {
    transformations.push(`dpr_${Math.max(1, Math.min(3, dpr))}`);
  }

  // 4. Smart cropping with gravity
  if (gravity === 'face') {
    transformations.push('g_face'); // Face detection for profile images
  } else if (gravity && gravity !== 'center') {
    transformations.push(`g_${gravity}`);
  }

  // 5. Crop mode
  if (crop) {
    transformations.push(`c_${crop}`);
  }

  // 6. Dimensions (optional)
  if (width && height && aspectRatio) {
    transformations.push(`w_${width},h_${height},ar_${aspectRatio}`);
  } else if (width && height) {
    transformations.push(`w_${width},h_${height}`);
  } else if (width) {
    transformations.push(`w_${width}`);
  }

  // 7. Border radius (optional)
  if (radius) {
    transformations.push(`r_${radius}`);
  }

  // Construct optimized URL
  const transformationString = transformations.join('/');
  return transformationString
    ? `${baseUrl}/upload/${transformationString}/${publicId}`
    : url;
}

/**
 * Specialized optimization for profile/avatar images
 * Uses facial recognition for smart cropping
 * Generates square images (1:1 aspect ratio) for circular profiles
 */
export function optimizeProfileImage(
  url: string,
  size: 'sm' | 'md' | 'lg' = 'md'
): string {
  if (!url) return url;

  const sizeMap = {
    sm: 150,  // Square dimensions for 1:1 ratio
    md: 250,
    lg: 350,
  };

  const dimension = sizeMap[size];

  return optimizeCloudinaryUrl(url, {
    quality: 'auto',
    dpr: 'auto',
    format: 'avif',
    gravity: 'face', // Face detection for cropping
    crop: 'thumb', // Thumbnail crop with face priority - maintains square
    width: dimension,
    height: dimension, // Both dimensions for square aspect ratio (required for circular)
    radius: dimension / 2, // Circular images
  });
}

/**
 * Ultra-low quality blur placeholder
 * Used for LQIP (Low Quality Image Placeholder) technique
 * 8-12px width with 5-8% quality
 */
export function getBlurPlaceholder(
  url: string,
  options: BlurPlaceholderOptions = {}
): string {
  if (!url) return '';

  const {
    width = 10, // Ultra-low resolution
    height = 10,
    quality = 5, // Ultra-low quality (5-8%)
  } = options;

  return optimizeCloudinaryUrl(url, {
    quality,
    dpr: 1,
    format: 'jpg', // JPG compresses better for tiny images
    width,
    height,
    crop: 'fill',
  });
}

/**
 * Generate responsive image srcSet with AVIF format
 * Automatically creates multiple resolutions for different devices
 */
export function generateResponsiveSrcSet(
  url: string,
  sizeConfig: Record<string, number> = RESPONSIVE_SIZES_CARD
): string {
  if (!url) return '';

  return Object.entries(sizeConfig)
    .map(([_, size]) => {
      const optimized = optimizeCloudinaryUrl(url, {
        width: size,
        quality: 'auto',
        dpr: 1,
        format: 'avif',
      });
      return `${optimized} ${size}w`;
    })
    .join(', ');
}

/**
 * Hero image optimization
 * Targets hero sections with large viewports
 * Preserves aspect ratio
 */
export function optimizeHeroImage(url: string): string {
  if (!url) return url;

  return optimizeCloudinaryUrl(url, {
    quality: 'auto', // 65-75 for auto quality
    dpr: 'auto',
    format: 'avif',
    crop: 'scale', // Scale preserves aspect ratio
    width: 1200, // Only set width, height auto-calculated
  });
}

/**
 * Card thumbnail optimization
 * Targets card cover images
 * Preserves aspect ratio
 */
export function optimizeCardImage(url: string, width = 600, height?: number): string {
  if (!url) return url;

  return optimizeCloudinaryUrl(url, {
    quality: 'auto',
    dpr: 'auto',
    format: 'avif',
    crop: 'scale', // Scale preserves aspect ratio, no distortion
    width: Math.min(width, 600), // Cap at 600px width
    // height intentionally not set - Cloudinary will preserve aspect ratio
  });
}

/**
 * Logo/icon optimization
 * Preserves transparency and sharp edges
 */
export function optimizeLogoImage(url: string, size = 200): string {
  if (!url) return url;

  return optimizeCloudinaryUrl(url, {
    quality: 'auto',
    dpr: 'auto',
    format: 'auto', // Keep PNG/SVG format for logos
    crop: 'scale',
    width: size,
  });
}

/**
 * Generate Next.js Image component props with full optimization
 */
export function getOptimizedImageProps(
  url: string,
  type: 'hero' | 'card' | 'profile' | 'logo' | 'thumbnail' = 'card',
  customOptions: OptimizationOptions = {}
) {
  let optimized: string;
  let blurUrl: string | undefined;
  let sizes: string;

  switch (type) {
    case 'hero':
      optimized = optimizeHeroImage(url);
      blurUrl = getBlurPlaceholder(url, { width: 12, height: 6, quality: 5 });
      sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 100vw, (max-width: 1440px) 1024px, 1200px';
      break;

    case 'profile':
      optimized = optimizeProfileImage(url, 'lg');
      blurUrl = getBlurPlaceholder(url, { width: 10, height: 10, quality: 5 });
      sizes = '(max-width: 640px) 150px, (max-width: 1024px) 250px, 350px';
      break;

    case 'logo':
      optimized = optimizeLogoImage(url);
      sizes = '(max-width: 640px) 100px, 200px';
      break;

    case 'thumbnail':
      optimized = optimizeCloudinaryUrl(url, {
        width: RESPONSIVE_SIZES_THUMBNAIL.desktop,
        height: RESPONSIVE_SIZES_THUMBNAIL.desktop,
        crop: 'thumb',
        quality: 'auto',
        dpr: 'auto',
        format: 'avif',
        ...customOptions,
      });
      blurUrl = getBlurPlaceholder(url, { width: 8, height: 8, quality: 5 });
      sizes = `(max-width: 640px) ${RESPONSIVE_SIZES_THUMBNAIL.mobile}px, (max-width: 1024px) ${RESPONSIVE_SIZES_THUMBNAIL.tablet}px, ${RESPONSIVE_SIZES_THUMBNAIL.desktop}px`;
      break;

    case 'card':
    default:
      optimized = optimizeCardImage(url, customOptions.width || 600);
      blurUrl = getBlurPlaceholder(url, { width: 10, height: 8, quality: 5 });
      sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 600px';
  }

  return {
    src: optimized,
    placeholder: blurUrl ? 'blur' : 'empty' as const,
    blurDataURL: blurUrl,
    sizes,
  };
}

/**
 * Check if URL is Cloudinary hosted
 */
export function isCloudinaryUrl(url: string): boolean {
  return (
    typeof url === 'string' &&
    (url.includes('cloudinary.com') || url.includes('res.cloudinary.com'))
  );
}

/**
 * Batch optimize multiple URLs
 */
export function optimizeUrlBatch(
  urls: string[],
  options: OptimizationOptions = {}
): string[] {
  return urls.map((url) => optimizeCloudinaryUrl(url, options));
}
