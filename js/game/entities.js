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
    TREE_SKYLINE_IMAGE,
    CANVAS_WIDTH,
    CANVAS_HEIGHT
} from '../shared/config.js';

// ============================================
// PLAYER ENTITY
// ============================================

export const player = {
    x: CANVAS_WIDTH / 2,
    y: 100,
    width: 40,
    height: 40,
    velocityY: 0,
    velocityX: 0,
    gravity: 0.2,  // Reduced for slower falling
    bounceStrength: -8,  // Reduced from -15 to prevent bouncing off screen
    moveSpeed: 7,
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

// Tree skyline image
export let treeSkylineImage = null;
if (TREE_SKYLINE_IMAGE) {
    treeSkylineImage = new Image();
    treeSkylineImage.src = TREE_SKYLINE_IMAGE;
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
    player.y = 100;
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
            width: 60 + Math.random() * 40,
            height: 20 + Math.random() * 15,
            speed: 0.3 + Math.random() * 0.5
        });
    }
}

/**
 * Initialize pine trees along the bottom
 * @param {number} canvasWidth - Canvas width
 */
export function initPineTrees(canvasWidth) {
    pineTrees.length = 0; // Clear array
    const treeSpacing = 60;
    const treeCount = Math.ceil(canvasWidth / treeSpacing) + 1;
    for (let i = 0; i < treeCount; i++) {
        pineTrees.push({
            x: i * treeSpacing - 30,
            height: 40 + Math.random() * 30,
            width: 25 + Math.random() * 15
        });
    }
}
