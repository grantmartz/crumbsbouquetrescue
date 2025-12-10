/* ============================================
   SHARED CONFIGURATION
   Crumb's Bouquet Rescue
   ============================================ */

// ============================================
// ASSET BASE PATH
// ============================================
// For local development: use './' (relative paths)
// For GitHub Pages embedding: use absolute URL
// Example: 'https://username.github.io/crumbsbouquetrescue/'
export const ASSET_BASE_PATH = 'https://grantmartz.github.io/crumbsbouquetrescue/';

/**
 * Get full asset URL by combining base path with asset path
 * @param {string} assetPath - Relative asset path (e.g., 'assets/image.png')
 * @returns {string} Full asset URL
 */
export function getAssetUrl(assetPath) {
    if (!assetPath) return null;

    // If assetPath is already absolute (starts with http:// or https://), return as-is
    if (assetPath.startsWith('http://') || assetPath.startsWith('https://')) {
        return assetPath;
    }

    // Combine base path with asset path
    const base = ASSET_BASE_PATH.endsWith('/') ? ASSET_BASE_PATH : ASSET_BASE_PATH + '/';
    const asset = assetPath.startsWith('/') ? assetPath.substring(1) : assetPath;
    return base + asset;
}

// ============================================
// GAME ASSET URLS
// ============================================
// To use custom images, replace these URLs with your hosted image URLs
// Set to null to use placeholder shapes

export const SPRITE_IMAGE = getAssetUrl('assets/Crumb_small.png'); // Main character sprite
export const FLOWER_IMAGE_1 = getAssetUrl('assets/RED_Flower_SMALL.png'); // First flower style
export const FLOWER_IMAGE_2 = getAssetUrl('assets/PINK_Flower_SMALL.png'); // Second flower style
export const FLOWER_IMAGE_3 = getAssetUrl('assets/YELLOW_Flower_SMALL.png'); // Third flower style
export const FLOWER_IMAGE_4 = getAssetUrl('assets/ORANGE_Flower_SMALL.png'); // Fourth flower style (orange)
export const EATER_MOUTH_OPEN = getAssetUrl('assets/CRICKET_open_SMALL.png'); // Dog head profile with mouth open
export const EATER_MOUTH_CLOSED = getAssetUrl('assets/CRICKET_closed_SMALL.png'); // Dog head profile with mouth closed
export const CLOUD_IMAGE = getAssetUrl('assets/CLOUD_Small.png'); // Cloud image for background
export const FINCH_IMAGE = getAssetUrl('assets/FINCH_Small.png'); // Special finch sprite (1 in 50 chance)
export const TREE_IMAGE = getAssetUrl('assets/TREE_Small.png'); // Single tree image (tiled across bottom with size variations)

// ============================================
// INSTRUCTIONS & LEADERBOARD ASSETS
// ============================================
export const FLOWER_LEFT_IMAGE = getAssetUrl('assets/PINK_Flower_SMALL.png'); // Flower image for instructions page (left)
export const FLOWER_RIGHT_IMAGE = getAssetUrl('assets/YELLOW_Flower_SMALL.png'); // Flower image for instructions page (right)
export const TROPHY_IMAGE = getAssetUrl('assets/TROPHY_Small.png'); // Trophy image for leaderboard page

// ============================================
// COLOR CONSTANTS
// ============================================
// Placeholder colors (used when images are null)

export const SPRITE_COLOR = '#d44e3a';  // Red-orange from homepage
export const FLOWER_COLORS = ['#d44e3a', '#f5a3b5', '#e8b84d', '#ff8c42'];  // Red, Pink, Yellow, Orange
export const CLOUD_COLOR = '#f5d5c8';   // Soft peachy pink
export const EATER_COLOR = '#d44e3a';   // Red-orange for the eater sprite
export const FINCH_COLOR = '#4a9eff';   // Blue for special finch
export const TREE_COLOR = '#2d4a2b';    // Dark green for pine trees

// ============================================
// CANVAS DIMENSIONS
// ============================================
export const CANVAS_WIDTH = 400;
export const CANVAS_HEIGHT = 600;

// ============================================
// PHYSICS CONSTANTS
// ============================================
export const GRAVITY = 0.5;
export const BOUNCE_STRENGTH = -12;
export const PLAYER_SPEED = 5;

// ============================================
// FIREBASE CONFIGURATION
// ============================================
// Replace these values with your Firebase project config
// Get these from: Firebase Console → Project Settings → Your apps → SDK setup and configuration

export const FIREBASE_CONFIG = {
    apiKey: "AIzaSyCkJGin3saoC6s59YhEOno7y60hlj154A8",
    authDomain: "crumbs-bouquet-rescue.firebaseapp.com",
    databaseURL: "https://crumbs-bouquet-rescue-default-rtdb.firebaseio.com",
    projectId: "crumbs-bouquet-rescue",
    storageBucket: "crumbs-bouquet-rescue.firebasestorage.app",
    messagingSenderId: "293182118702",
    appId: "1:293182118702:web:e9b642090b5d965e5538bf"
};
