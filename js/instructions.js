/* ============================================
   INSTRUCTIONS PAGE
   Load and display flower images
   ============================================ */

import { FLOWER_LEFT_IMAGE, FLOWER_RIGHT_IMAGE } from './shared/config.js';

// ============================================
// IMAGE LOADING
// ============================================

// Load left flower image if provided
if (FLOWER_LEFT_IMAGE) {
    const flowerLeftImg = new Image();
    flowerLeftImg.src = FLOWER_LEFT_IMAGE;
    flowerLeftImg.onload = function() {
        document.getElementById('flowerLeft').innerHTML = '<img src="' + FLOWER_LEFT_IMAGE + '" alt="Flower">';
    };
}

// Load right flower image if provided
if (FLOWER_RIGHT_IMAGE) {
    const flowerRightImg = new Image();
    flowerRightImg.src = FLOWER_RIGHT_IMAGE;
    flowerRightImg.onload = function() {
        document.getElementById('flowerRight').innerHTML = '<img src="' + FLOWER_RIGHT_IMAGE + '" alt="Flower">';
    };
}
