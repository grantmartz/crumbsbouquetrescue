/* ============================================
   GAME ENTITIES
   Player, flowers, eaters, particles, clouds, trees, and image loading
   ============================================ */

import {
    SPRITE_IMAGE,
    FLOWER_IMAGE_1,
    FLOWER_IMAGE_2,
    FLOWER_IMAGE_3,
    FLOWER_IMAGE_4,
    EATER_MOUTH_OPEN,
    EATER_MOUTH_CLOSED,
    CLOUD_IMAGE,
    FINCH_IMAGE,
    FINCH_WINGS_IMAGE,
    TREE_IMAGE,
    CANVAS_WIDTH,
    CANVAS_HEIGHT,
    S
} from '../shared/config.js';

// ============================================
// PLAYER ENTITY
// ============================================

export const player = {
    x: CANVAS_WIDTH / 2,
    y: Math.round(100 * S),
    width: Math.round(75 * S),
    height: Math.round(65 * S),
    velocityY: 0,
    velocityX: 0,
    gravity: 0.2 * S,
    bounceStrength: -8 * S,
    moveSpeed: 11 * S,
    image: null
};

// Load sprite image if provided
if (SPRITE_IMAGE) {
    player.image = new Image();
    player.image.src = SPRITE_IMAGE;
}

// ============================================
// IMAGE LOADING
// ============================================

// Flower images
export const flowerImages = [null, null, null, null];
if (FLOWER_IMAGE_1) {
    flowerImages[0] = new Image();
    flowerImages[0].src = FLOWER_IMAGE_1;
}
if (FLOWER_IMAGE_2) {
    flowerImages[1] = new Image();
    flowerImages[1].src = FLOWER_IMAGE_2;
}
if (FLOWER_IMAGE_3) {
    flowerImages[2] = new Image();
    flowerImages[2].src = FLOWER_IMAGE_3;
}
if (FLOWER_IMAGE_4) {
    flowerImages[3] = new Image();
    flowerImages[3].src = FLOWER_IMAGE_4;
}

// Eater images
export let eaterMouthOpen = null;
export let eaterMouthClosed = null;
if (EATER_MOUTH_OPEN) {
    eaterMouthOpen = new Image();
    eaterMouthOpen.src = EATER_MOUTH_OPEN;
}
if (EATER_MOUTH_CLOSED) {
    eaterMouthClosed = new Image();
    eaterMouthClosed.src = EATER_MOUTH_CLOSED;
}

// Cloud image
export let cloudImage = null;
if (CLOUD_IMAGE) {
    cloudImage = new Image();
    cloudImage.src = CLOUD_IMAGE;
}

// Finch image
export let finchImage = null;
if (FINCH_IMAGE) {
    finchImage = new Image();
    finchImage.src = FINCH_IMAGE;
}

// Winged finch image (oops record bird)
export let finchWingsImage = null;
if (FINCH_WINGS_IMAGE) {
    finchWingsImage = new Image();
    finchWingsImage.src = FINCH_WINGS_IMAGE;
}

// Tree image (tiled)
export let treeImage = null;
if (TREE_IMAGE) {
    treeImage = new Image();
    treeImage.src = TREE_IMAGE;
}

// ============================================
// GAME ENTITY ARRAYS
// ============================================

export const flowers = [];
export const eaters = [];
export const particles = [];
export const clouds = [];
export const pineTrees = [];

// Flower type counter (cycles through 0, 1, 2, 3)
export let flowerTypeCounter = 0;

/**
 * Increment flower type counter
 */
export function incrementFlowerTypeCounter() {
    flowerTypeCounter = (flowerTypeCounter + 1) % 4;
}

// ============================================
// INITIALIZATION FUNCTIONS
// ============================================

/**
 * Initialize player position (call after canvas is available)
 * @param {number} canvasWidth - Canvas width
 */
export function initPlayer(canvasWidth) {
    player.x = canvasWidth / 2;
    player.y = Math.round(100 * S);
}

/**
 * Initialize background clouds
 * @param {number} canvasWidth - Canvas width
 * @param {number} canvasHeight - Canvas height
 */
export function initClouds(canvasWidth, canvasHeight) {
    clouds.length = 0; // Clear array
    for (let i = 0; i < 5; i++) {
        clouds.push({
            x: Math.random() * canvasWidth,
            y: Math.random() * (canvasHeight * 0.4),
            width: (100 + Math.random() * 60) * S,
            height: (35 + Math.random() * 25) * S,
            speed: (0.3 + Math.random() * 0.5) * S
        });
    }
}

/**
 * Initialize pine trees along the bottom
 * @param {number} canvasWidth - Canvas width
 */
export function initPineTrees(canvasWidth) {
    pineTrees.length = 0; // Clear array
    const treeSpacing = Math.round(30 * S);
    const treeCount = Math.ceil(canvasWidth / treeSpacing) + 1;

    // Base dimensions for tree image
    const baseHeight = Math.round(70 * S);
    const baseWidth = Math.round(50 * S);

    for (let i = 0; i < treeCount; i++) {
        // Random scale between 0.85 and 1.15 (±15% variation)
        const scale = 0.85 + Math.random() * 0.3;

        pineTrees.push({
            x: i * treeSpacing - Math.round(30 * S),
            baseHeight: baseHeight,
            baseWidth: baseWidth,
            scale: scale,
            // Calculated dimensions (used by both image and procedural rendering)
            height: baseHeight * scale,
            width: baseWidth * scale
        });
    }
}
