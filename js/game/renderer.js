/* ============================================
   RENDERING ENGINE
   All drawing functions and canvas management
   ============================================ */

import {
    player,
    flowers,
    eaters,
    particles,
    clouds,
    pineTrees,
    flowerImages,
    eaterMouthOpen,
    eaterMouthClosed,
    cloudImage,
    finchImage,
    treeImage
} from './entities.js';

import { gameState } from './state.js';

import {
    SPRITE_COLOR,
    FLOWER_COLORS,
    CLOUD_COLOR,
    EATER_COLOR,
    FINCH_COLOR,
    TREE_COLOR
} from '../shared/config.js';

// ============================================
// CANVAS SETUP
// ============================================

export const canvas = document.getElementById('gameCanvas');
export const ctx = canvas.getContext('2d');

// ============================================
// DRAWING FUNCTIONS
// ============================================

/**
 * Draw cloud (fluffy cloud with overlapping circles or custom image)
 */
export function drawCloud(cloud) {
    if (cloudImage && cloudImage.complete) {
        // Use custom cloud image
        ctx.drawImage(cloudImage, cloud.x - cloud.width/2, cloud.y - cloud.height/2, cloud.width, cloud.height);
    } else {
        // Fallback to placeholder fluffy cloud - solid soft pink
        ctx.fillStyle = '#f5d5c8'; // Soft pink, no transparency

        const baseRadius = cloud.height / 2;

        // Draw 4 overlapping circles to create a fluffy cloud
        ctx.beginPath();
        // Left circle (smallest)
        ctx.arc(cloud.x - baseRadius * 0.8, cloud.y, baseRadius * 0.7, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        // Left-center circle
        ctx.arc(cloud.x - baseRadius * 0.3, cloud.y - baseRadius * 0.3, baseRadius * 0.9, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        // Center circle (largest)
        ctx.arc(cloud.x + baseRadius * 0.2, cloud.y, baseRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        // Right circle
        ctx.arc(cloud.x + baseRadius * 0.9, cloud.y + baseRadius * 0.1, baseRadius * 0.8, 0, Math.PI * 2);
        ctx.fill();
    }
}

/**
 * Draw pine tree silhouette
 */
export function drawPineTree(tree) {
    ctx.fillStyle = TREE_COLOR; // Dark green silhouette

    const baseY = canvas.height;
    const tipY = baseY - tree.height;
    const centerX = tree.x;

    // Draw three stacked triangular sections
    const sections = 3;
    const sectionHeight = tree.height / sections;

    for (let i = 0; i < sections; i++) {
        const topY = tipY + (i * sectionHeight * 0.7);
        const bottomY = tipY + ((i + 1) * sectionHeight * 0.9);
        const widthAtSection = tree.width * (1 + i * 0.4);

        ctx.beginPath();
        ctx.moveTo(centerX, topY); // Top point
        ctx.lineTo(centerX - widthAtSection / 2, bottomY); // Bottom left
        ctx.lineTo(centerX + widthAtSection / 2, bottomY); // Bottom right
        ctx.closePath();
        ctx.fill();
    }

    // Trunk
    const trunkWidth = tree.width * 0.2;
    ctx.fillRect(centerX - trunkWidth / 2, baseY - sectionHeight * 0.4, trunkWidth, sectionHeight * 0.4);
}

/**
 * Draw player (placeholder or custom image)
 */
export function drawPlayer() {
    if (player.image && player.image.complete) {
        ctx.drawImage(player.image, player.x - player.width/2, player.y - player.height/2, player.width, player.height);
    } else {
        // Placeholder: simple animal-like shape (circle with ears)
        ctx.fillStyle = SPRITE_COLOR;

        // Body
        ctx.beginPath();
        ctx.arc(player.x, player.y, player.width/2, 0, Math.PI * 2);
        ctx.fill();

        // Ears
        ctx.beginPath();
        ctx.arc(player.x - player.width/3, player.y - player.height/3, player.width/4, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(player.x + player.width/3, player.y - player.height/3, player.width/4, 0, Math.PI * 2);
        ctx.fill();
    }
}

/**
 * Draw flower (placeholder or custom image)
 */
export function drawFlower(flower) {
    // Draw finch if it's a finch
    if (flower.isFinch) {
        if (finchImage && finchImage.complete) {
            ctx.drawImage(finchImage, flower.x - flower.width/2, flower.y - flower.height/2, flower.width, flower.height);
        } else {
            // Placeholder finch: simple bird shape
            ctx.fillStyle = FINCH_COLOR;

            // Body (oval)
            ctx.beginPath();
            ctx.ellipse(flower.x, flower.y, flower.width/3, flower.height/4, 0, 0, Math.PI * 2);
            ctx.fill();

            // Head (circle)
            ctx.beginPath();
            ctx.arc(flower.x + flower.width/4, flower.y - flower.height/6, flower.width/5, 0, Math.PI * 2);
            ctx.fill();

            // Wing (arc)
            ctx.beginPath();
            ctx.arc(flower.x - flower.width/6, flower.y, flower.width/4, 0, Math.PI * 2);
            ctx.fill();

            // Beak (small triangle)
            ctx.fillStyle = '#ffa500';
            ctx.beginPath();
            ctx.moveTo(flower.x + flower.width/3, flower.y - flower.height/6);
            ctx.lineTo(flower.x + flower.width/2.3, flower.y - flower.height/8);
            ctx.lineTo(flower.x + flower.width/3, flower.y - flower.height/12);
            ctx.fill();
        }
        return;
    }

    // Regular flower drawing
    const flowerImage = flowerImages[flower.type];

    if (flowerImage && flowerImage.complete) {
        ctx.drawImage(flowerImage, flower.x - flower.width/2, flower.y - flower.height/2, flower.width, flower.height);
    } else {
        // Placeholder: simple flower shape with color based on type
        ctx.fillStyle = FLOWER_COLORS[flower.type];

        // Stem
        ctx.fillRect(flower.x - 3, flower.y, 6, flower.height/2);

        // Petals (5 circles around center)
        const petalRadius = flower.width/5;
        const centerY = flower.y - flower.height/4;
        for (let i = 0; i < 5; i++) {
            const angle = (i * Math.PI * 2 / 5) - Math.PI/2;
            const petalX = flower.x + Math.cos(angle) * petalRadius * 1.2;
            const petalY = centerY + Math.sin(angle) * petalRadius * 1.2;

            ctx.beginPath();
            ctx.arc(petalX, petalY, petalRadius, 0, Math.PI * 2);
            ctx.fill();
        }

        // Center
        ctx.beginPath();
        ctx.arc(flower.x, centerY, petalRadius * 0.8, 0, Math.PI * 2);
        ctx.fill();
    }
}

/**
 * Draw eater sprite (dog's head facing downward, with chomping animation)
 */
export function drawEater(eater) {
    // Determine if mouth should be open or closed based on phase
    const mouthOpen = eater.phase === 'descending' ||
                     eater.phase === 'chomp1_open' ||
                     eater.phase === 'chomp2_open';

    // Use custom images if provided
    if (mouthOpen && eaterMouthOpen && eaterMouthOpen.complete) {
        ctx.drawImage(eaterMouthOpen, eater.x - eater.width/2, eater.y - eater.height/2, eater.width, eater.height);
        return;
    } else if (!mouthOpen && eaterMouthClosed && eaterMouthClosed.complete) {
        ctx.drawImage(eaterMouthClosed, eater.x - eater.width/2, eater.y - eater.height/2, eater.width, eater.height);
        return;
    }

    // Fallback to placeholder drawing
    ctx.fillStyle = EATER_COLOR;

    // Head (main circle)
    ctx.beginPath();
    ctx.arc(eater.x, eater.y, eater.width/2, 0, Math.PI * 2);
    ctx.fill();

    // Left ear (floppy, pointing down-left)
    ctx.beginPath();
    ctx.ellipse(eater.x - eater.width/3, eater.y - eater.height/4, eater.width/4, eater.height/3, -0.3, 0, Math.PI * 2);
    ctx.fill();

    // Right ear (floppy, pointing down-right)
    ctx.beginPath();
    ctx.ellipse(eater.x + eater.width/3, eater.y - eater.height/4, eater.width/4, eater.height/3, 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Snout (oval pointing downward)
    ctx.beginPath();
    ctx.ellipse(eater.x, eater.y + eater.height/4, eater.width/3, eater.height/3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Draw mouth differently based on open/closed state
    if (mouthOpen) {
        // Open mouth (small arc at bottom of snout)
        ctx.fillStyle = '#1a0a0a';
        ctx.beginPath();
        ctx.arc(eater.x, eater.y + eater.height/2.5, eater.width/6, 0, Math.PI);
        ctx.fill();
    }

    // Nose (small circle at bottom of snout)
    ctx.fillStyle = '#3a2a1a';
    ctx.beginPath();
    ctx.arc(eater.x, eater.y + eater.height/2, eater.width/8, 0, Math.PI * 2);
    ctx.fill();

    // Eyes (two small circles)
    ctx.fillStyle = '#3a2a1a';
    ctx.beginPath();
    ctx.arc(eater.x - eater.width/5, eater.y, eater.width/10, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(eater.x + eater.width/5, eater.y, eater.width/10, 0, Math.PI * 2);
    ctx.fill();
}

/**
 * Main draw function - renders entire scene
 */
export function draw() {
    // Clear canvas
    ctx.fillStyle = '#fef9f0';  // Cream background matching homepage
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw clouds
    clouds.forEach(drawCloud);

    // Draw pine trees (behind gameplay elements)
    if (treeImage && treeImage.complete) {
        // Draw tiled tree images with size variations
        pineTrees.forEach(tree => {
            const drawX = tree.x - tree.width / 2;
            const drawY = canvas.height - tree.height;
            ctx.drawImage(treeImage, drawX, drawY, tree.width, tree.height);
        });
    } else {
        // Fallback to procedural pine trees
        pineTrees.forEach(drawPineTree);
    }

    // Draw flowers
    flowers.forEach(drawFlower);

    // Draw eaters
    eaters.forEach(drawEater);

    // Draw current eating flower (during game over)
    if (gameState.currentEatingFlower) {
        drawEater(gameState.currentEatingFlower);
    }

    // Draw player
    drawPlayer();

    // Draw particles
    particles.forEach(p => {
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    });

    // Draw bonus text
    if (gameState.bonusText) {
        ctx.fillStyle = '#4a9eff';
        ctx.font = 'bold 24px Rockwell, Georgia, serif';
        ctx.textAlign = 'center';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.strokeText(gameState.bonusText.text, gameState.bonusText.x, gameState.bonusText.y);
        ctx.fillText(gameState.bonusText.text, gameState.bonusText.x, gameState.bonusText.y);
    }

    // Draw countdown if active
    if (gameState.countdown > 0) {
        ctx.font = 'bold 80px Rockwell, Georgia, serif';
        ctx.textAlign = 'center';
        ctx.strokeStyle = '#d44e3a';
        ctx.lineWidth = 4;
        ctx.strokeText(gameState.countdown.toString(), canvas.width/2, canvas.height/2);
        ctx.fillStyle = '#e8b84d';  // Sunshine yellow
        ctx.fillText(gameState.countdown.toString(), canvas.width/2, canvas.height/2);
    }

    // Draw scolding text during game over
    if (gameState.gameOverPhase === 'scolding') {
        ctx.fillStyle = '#d44e3a';
        ctx.font = 'bold 32px Rockwell, Georgia, serif';
        ctx.textAlign = 'center';
        ctx.fillText('No, Cricket!', canvas.width/2, canvas.height/2 - 20);
        ctx.fillText('Bad!', canvas.width/2, canvas.height/2 + 20);
    }

    // Draw game over text
    if (gameState.gameOverPhase === 'gameover') {
        ctx.fillStyle = '#d44e3a';
        ctx.font = 'bold 36px Rockwell, Georgia, serif';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over!', canvas.width/2, canvas.height/2);

        // Show restart button
        document.getElementById('restartButton').style.display = 'block';
    } else {
        // Hide restart button when not in game over
        document.getElementById('restartButton').style.display = 'none';
    }

    // Draw name entry screen for top 10
    if (gameState.gameOverPhase === 'nameentry' && gameState.showNameEntry) {
        // Semi-transparent overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Title
        ctx.fillStyle = '#e8b84d';
        ctx.font = 'bold 32px Rockwell, Georgia, serif';
        ctx.textAlign = 'center';
        ctx.fillText('TOP 10!', canvas.width/2, canvas.height/2 - 80);

        // Score
        ctx.fillStyle = '#f5a3b5';
        ctx.font = 'bold 24px Rockwell, Georgia, serif';
        ctx.fillText('Score: ' + gameState.score, canvas.width/2, canvas.height/2 - 40);

        // Name prompt
        ctx.fillStyle = '#fef9f0';
        ctx.font = 'bold 18px Rockwell, Georgia, serif';
        ctx.fillText('Enter your name:', canvas.width/2, canvas.height/2);

        // Name input box
        ctx.strokeStyle = '#e8b84d';
        ctx.lineWidth = 3;
        ctx.strokeRect(canvas.width/2 - 100, canvas.height/2 + 10, 200, 40);

        // Name text
        ctx.fillStyle = '#d44e3a';
        ctx.font = 'bold 24px Rockwell, Georgia, serif';
        ctx.fillText(gameState.playerName + '_', canvas.width/2, canvas.height/2 + 38);

        // Instructions
        ctx.fillStyle = '#f5d5c8';
        ctx.font = '14px Rockwell, Georgia, serif';
        ctx.fillText('Press ENTER to submit', canvas.width/2, canvas.height/2 + 75);
        ctx.fillText('(or leave blank to skip)', canvas.width/2, canvas.height/2 + 92);
    }

    // Draw "Click to Start" on initial screen
    if (!gameState.gameActive && !gameState.gameOverShown && gameState.countdown === 0 && !gameState.gameStarted) {
        // Don't draw anything - START GAME button handles this
    }
}
