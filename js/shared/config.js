/* ============================================
   SHARED CONFIGURATION
   Crumb's Bouquet Rescue
   ============================================ */

// ============================================
// GAME ASSET PATHS
// ============================================
// Direct paths to local asset files
// Set to null to use placeholder shapes

export const SPRITE_IMAGE = 'assets/CRUMB_SMALL.png'; // Main character sprite
export const FLOWER_IMAGE_1 = 'assets/RED_Flower_SMALL.png'; // First flower style
export const FLOWER_IMAGE_2 = 'assets/PINK_Flower_SMALL.png'; // Second flower style
export const FLOWER_IMAGE_3 = 'assets/YELLOW_Flower_SMALL.png'; // Third flower style
export const FLOWER_IMAGE_4 = 'assets/ORANGE_Flower_SMALL.png'; // Fourth flower style (orange)
export const EATER_MOUTH_OPEN = 'assets/CRICKET_open_SMALL.png'; // Dog head profile with mouth open
export const EATER_MOUTH_CLOSED = 'assets/CRICKET_closed_SMALL.png'; // Dog head profile with mouth closed
export const CLOUD_IMAGE = 'assets/CLOUD_Small.png'; // Cloud image for background
export const FINCH_IMAGE = 'assets/FINCH_Small.png'; // Special finch sprite (1 in 50 chance)
export const TREE_IMAGE = 'assets/TREE_Small.png'; // Single tree image (tiled across bottom with size variations)

// ============================================
// INSTRUCTIONS & LEADERBOARD ASSETS
// ============================================
export const FLOWER_LEFT_IMAGE = 'assets/PINK_Flower_SMALL.png'; // Flower image for instructions page (left)
export const FLOWER_RIGHT_IMAGE = 'assets/YELLOW_Flower_SMALL.png'; // Flower image for instructions page (right)
export const TROPHY_IMAGE = 'assets/TROPHY_Small.png'; // Trophy image for leaderboard page

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
