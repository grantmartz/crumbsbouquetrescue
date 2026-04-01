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
import { loadLeaderboard } from '../shared/leaderboard.js';
import { drawMuteIndicator } from './audio.js';

import {
    SPRITE_COLOR,
    FLOWER_COLORS,
    CLOUD_COLOR,
    EATER_COLOR,
    FINCH_COLOR,
    TREE_COLOR,
    S
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
 * Visual size is 10% larger than hitbox
 */
export function drawPlayer() {
    const visualScale = 1.1;
    const visualWidth = player.width * visualScale;
    const visualHeight = player.height * visualScale;

    // Oops mode: draw Cricket as the player
    if (gameState.oopsAllFinches) {
        const mouthOpen = player.velocityY < 0; // falling = mouth open
        const img = mouthOpen ? eaterMouthOpen : eaterMouthClosed;
        if (img && img.complete) {
            ctx.drawImage(img, player.x - visualWidth/2, player.y - visualHeight/2, visualWidth, visualHeight);
        } else {
            ctx.fillStyle = EATER_COLOR;
            ctx.beginPath();
            ctx.arc(player.x, player.y, visualWidth/2, 0, Math.PI * 2);
            ctx.fill();
        }
        return;
    }

    if (player.image && player.image.complete) {
        ctx.drawImage(player.image, player.x - visualWidth/2, player.y - visualHeight/2, visualWidth, visualHeight);
    } else {
        // Placeholder: simple animal-like shape (circle with ears)
        ctx.fillStyle = SPRITE_COLOR;

        // Body
        ctx.beginPath();
        ctx.arc(player.x, player.y, visualWidth/2, 0, Math.PI * 2);
        ctx.fill();

        // Ears
        ctx.beginPath();
        ctx.arc(player.x - visualWidth/3, player.y - visualHeight/3, visualWidth/4, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(player.x + visualWidth/3, player.y - visualHeight/3, visualWidth/4, 0, Math.PI * 2);
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
        ctx.fillRect(flower.x - Math.round(3 * S), flower.y, Math.round(6 * S), flower.height/2);

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
 * Visual size is 10% larger than hitbox
 */
export function drawEater(eater, sizeMultiplier = 1) {
    const visualScale = 1.1 * sizeMultiplier;
    const visualWidth = eater.width * visualScale;
    const visualHeight = eater.height * visualScale;

    // Determine if mouth should be open or closed based on phase
    const mouthOpen = eater.phase === 'descending' ||
                     eater.phase === 'chomp1_open' ||
                     eater.phase === 'chomp2_open';

    // Use custom images if provided
    if (mouthOpen && eaterMouthOpen && eaterMouthOpen.complete) {
        ctx.drawImage(eaterMouthOpen, eater.x - visualWidth/2, eater.y - visualHeight/2, visualWidth, visualHeight);
        return;
    } else if (!mouthOpen && eaterMouthClosed && eaterMouthClosed.complete) {
        ctx.drawImage(eaterMouthClosed, eater.x - visualWidth/2, eater.y - visualHeight/2, visualWidth, visualHeight);
        return;
    }

    // Fallback to placeholder drawing
    ctx.fillStyle = EATER_COLOR;

    // Head (main circle)
    ctx.beginPath();
    ctx.arc(eater.x, eater.y, visualWidth/2, 0, Math.PI * 2);
    ctx.fill();

    // Left ear (floppy, pointing down-left)
    ctx.beginPath();
    ctx.ellipse(eater.x - visualWidth/3, eater.y - visualHeight/4, visualWidth/4, visualHeight/3, -0.3, 0, Math.PI * 2);
    ctx.fill();

    // Right ear (floppy, pointing down-right)
    ctx.beginPath();
    ctx.ellipse(eater.x + visualWidth/3, eater.y - visualHeight/4, visualWidth/4, visualHeight/3, 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Snout (oval pointing downward)
    ctx.beginPath();
    ctx.ellipse(eater.x, eater.y + visualHeight/4, visualWidth/3, visualHeight/3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Draw mouth differently based on open/closed state
    if (mouthOpen) {
        // Open mouth (small arc at bottom of snout)
        ctx.fillStyle = '#1a0a0a';
        ctx.beginPath();
        ctx.arc(eater.x, eater.y + visualHeight/2.5, visualWidth/6, 0, Math.PI);
        ctx.fill();
    }

    // Nose (small circle at bottom of snout)
    ctx.fillStyle = '#3a2a1a';
    ctx.beginPath();
    ctx.arc(eater.x, eater.y + visualHeight/2, visualWidth/8, 0, Math.PI * 2);
    ctx.fill();

    // Eyes (two small circles)
    ctx.fillStyle = '#3a2a1a';
    ctx.beginPath();
    ctx.arc(eater.x - visualWidth/5, eater.y, visualWidth/10, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(eater.x + visualWidth/5, eater.y, visualWidth/10, 0, Math.PI * 2);
    ctx.fill();
}

/**
 * Main draw function - renders entire scene
 */
export function draw() {
    // Clear canvas
    ctx.fillStyle = '#f7e0d6';  // Off-white pinkish cream background
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw very subtle diagonal line texture
    ctx.strokeStyle = 'rgba(232, 184, 77, 0.07)';  // Light yellow, very transparent
    ctx.lineWidth = Math.round(6 * S);
    const lineSpacing = Math.round(20 * S);
    for (let i = -canvas.height; i < canvas.width + canvas.height; i += lineSpacing) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i + canvas.height, canvas.height);
        ctx.stroke();
    }

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
    eaters.forEach(e => drawEater(e));

    // Draw current eating flower (during game over) — 2x size
    if (gameState.currentEatingFlower) {
        drawEater(gameState.currentEatingFlower, 1.5);
    }

    // Draw player (only when not in attract mode)
    if (!gameState.attractMode) {
        drawPlayer();
    }

    // Draw particles
    particles.forEach(p => {
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    });

    // Draw score on canvas (upper right corner) - only during active game
    if (!gameState.attractMode) {
        ctx.fillStyle = '#e8321a';
        ctx.font = `bold ${Math.round(34 * S)}px Arvo, Rockwell, Georgia, serif`;
        ctx.textAlign = 'right';
        ctx.fillText('Score: ' + gameState.score, canvas.width - Math.round(20 * S), Math.round(42 * S));
    }

    // Draw bonus text
    if (gameState.bonusText) {
        ctx.fillStyle = '#4a9eff';
        ctx.font = `bold ${Math.round(28 * S)}px Arvo, Rockwell, Georgia, serif`;
        ctx.textAlign = 'center';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = Math.round(3 * S);
        ctx.strokeText(gameState.bonusText.text, gameState.bonusText.x, gameState.bonusText.y);
        ctx.fillText(gameState.bonusText.text, gameState.bonusText.x, gameState.bonusText.y);
    }

    // Draw countdown if active
    if (gameState.countdown > 0) {
        ctx.font = `bold ${Math.round(96 * S)}px Arvo, Rockwell, Georgia, serif`;
        ctx.textAlign = 'center';
        ctx.strokeStyle = '#e8321a';
        ctx.lineWidth = Math.round(4 * S);
        ctx.strokeText(gameState.countdown.toString(), canvas.width/2, canvas.height/2);
        ctx.fillStyle = '#f5c020';  // Sunshine yellow
        ctx.fillText(gameState.countdown.toString(), canvas.width/2, canvas.height/2);
    }

    // Draw scolding text during game over
    if (gameState.gameOverPhase === 'scolding') {
        ctx.font = `bold ${Math.round(78 * S)}px Arvo, Rockwell, Georgia, serif`;
        ctx.textAlign = 'center';

        // Yellow outline
        ctx.strokeStyle = '#f5c020';
        ctx.lineWidth = Math.round(4 * S);
        ctx.strokeText('No, Cricket!', canvas.width/2, canvas.height/2 - Math.round(46 * S));

        // Red fill
        ctx.fillStyle = '#e8321a';
        ctx.fillText('No, Cricket!', canvas.width/2, canvas.height/2 - Math.round(46 * S));

        // Show "Bad!" after a full second (60 frames)
        if (gameState.gameOverTimer >= 60) {
            ctx.strokeText('Bad!', canvas.width/2, canvas.height/2 + Math.round(50 * S));
            ctx.fillText('Bad!', canvas.width/2, canvas.height/2 + Math.round(50 * S));
        }
    }

    // Draw game over text + leaderboard
    if (gameState.gameOverPhase === 'gameover') {
        // Dark overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.72)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const cx = canvas.width / 2;

        // "GAME OVER" header
        ctx.font = `bold ${Math.round(62 * S)}px Arvo, Rockwell, Georgia, serif`;
        ctx.textAlign = 'center';
        ctx.strokeStyle = '#f5c020';
        ctx.lineWidth = Math.round(4 * S);
        ctx.strokeText('GAME OVER', cx, Math.round(72 * S));
        ctx.fillStyle = '#e8321a';
        ctx.fillText('GAME OVER', cx, Math.round(72 * S));

        // Current score
        ctx.fillStyle = '#f5a3b5';
        ctx.font = `bold ${Math.round(34 * S)}px Arvo, Rockwell, Georgia, serif`;
        ctx.fillText('Score: ' + gameState.score, cx, Math.round(114 * S));

        // Leaderboard title
        ctx.fillStyle = '#f5c020';
        ctx.font = `bold ${Math.round(26 * S)}px Arvo, Rockwell, Georgia, serif`;
        ctx.fillText('HIGH SCORES', cx, Math.round(154 * S));

        // Divider line
        ctx.strokeStyle = '#f5c020';
        ctx.lineWidth = Math.round(2 * S);
        ctx.beginPath();
        ctx.moveTo(cx - Math.round(185 * S), Math.round(166 * S));
        ctx.lineTo(cx + Math.round(185 * S), Math.round(166 * S));
        ctx.stroke();

        // Leaderboard rows
        const scores = loadLeaderboard();
        const rowHeight = Math.round(36 * S);
        const startY = Math.round(194 * S);
        const maxRows = 10;

        for (let i = 0; i < maxRows; i++) {
            const entry = scores[i];
            const rowY = startY + i * rowHeight;

            // Highlight if this is the player's just-submitted score
            const isPlayerScore = entry &&
                entry.score === gameState.score &&
                gameState.nameEntryChars &&
                entry.name === gameState.nameEntryChars.join('');

            if (isPlayerScore) {
                ctx.fillStyle = 'rgba(232, 184, 77, 0.25)';
                ctx.fillRect(cx - Math.round(185 * S), rowY - Math.round(22 * S), Math.round(370 * S), rowHeight);
            }

            if (entry) {
                // Rank
                ctx.textAlign = 'right';
                ctx.fillStyle = isPlayerScore ? '#f5c020' : '#aaa';
                ctx.font = `bold ${Math.round(26 * S)}px Arvo, Rockwell, Georgia, serif`;
                ctx.fillText(i + 1 + '.', cx - Math.round(130 * S), rowY);

                // Name
                ctx.textAlign = 'left';
                ctx.fillStyle = isPlayerScore ? '#f5c020' : '#fef9f0';
                ctx.font = `bold ${Math.round(28 * S)}px Arvo, Rockwell, Georgia, serif`;
                ctx.fillText(entry.name, cx - Math.round(110 * S), rowY);

                // Score
                ctx.textAlign = 'right';
                ctx.fillStyle = isPlayerScore ? '#f5a3b5' : '#fef9f0';
                ctx.fillText(entry.score, cx + Math.round(185 * S), rowY);
            } else {
                // Empty slot
                ctx.textAlign = 'right';
                ctx.fillStyle = '#555';
                ctx.font = `bold ${Math.round(26 * S)}px Arvo, Rockwell, Georgia, serif`;
                ctx.fillText(i + 1 + '.', cx - Math.round(130 * S), rowY);
                ctx.textAlign = 'left';
                ctx.fillStyle = '#555';
                ctx.font = `${Math.round(26 * S)}px Arvo, Rockwell, Georgia, serif`;
                ctx.fillText('---', cx - Math.round(110 * S), rowY);
                ctx.textAlign = 'right';
                ctx.fillText('---', cx + Math.round(185 * S), rowY);
            }
        }

        // "Press Start to Continue"
        ctx.textAlign = 'center';
        ctx.fillStyle = '#f5c020';
        ctx.font = `bold ${Math.round(26 * S)}px Arvo, Rockwell, Georgia, serif`;
        ctx.fillText('Press Start to Continue', cx, startY + maxRows * rowHeight + Math.round(20 * S));
    }

    // "Bird is the Word" screen — shown after oops all finches when no new record
    if (gameState.gameOverPhase === 'birdword') {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.72)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        const lines = ['BIRD IS THE WORD', '&', 'FINCH IS THE BIRD'];
        const spacing = Math.round(90 * S);

        ctx.textAlign = 'center';
        ctx.lineWidth = Math.round(4 * S);
        lines.forEach((line, i) => {
            const y = cy - spacing + i * spacing;
            ctx.font = i === 1 ? `bold ${Math.round(72 * S)}px Arvo, Rockwell, Georgia, serif` : `bold ${Math.round(52 * S)}px Arvo, Rockwell, Georgia, serif`;
            ctx.strokeStyle = '#f5c020';
            ctx.strokeText(line, cx, y);
            ctx.fillStyle = '#e8321a';
            ctx.fillText(line, cx, y);
        });

        ctx.font = `bold ${Math.round(26 * S)}px Arvo, Rockwell, Georgia, serif`;
        ctx.fillStyle = '#f5c020';
        ctx.fillText('Press Start to Continue', cx, cy + spacing * 1.8);
    }

    // Name entry screen is now handled by nameentry.js

    // Draw "Click to Start" on initial screen
    if (!gameState.gameActive && !gameState.gameOverShown && gameState.countdown === 0 && !gameState.gameStarted) {
        // Don't draw anything - START GAME button handles this
    }

    // Mute indicator — small red dot when muted
    drawMuteIndicator(ctx);

    // Sync body background with overlay screens so edges outside canvas go dark too
    const isOopsOverlay = gameState.oopsScreen;
    const hasOverlay = gameState.gameOverPhase === 'gameover' ||
                       gameState.gameOverPhase === 'birdword' ||
                       gameState.gameOverPhase === 'nameentry' ||
                       isOopsOverlay;
    document.body.classList.toggle('overlay-darker', isOopsOverlay);
    document.body.classList.toggle('overlay-active', hasOverlay && !isOopsOverlay);
}

/**
 * "Oops, All Finches" announcement screen
 */
export function drawOopsScreen() {
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    // Dark overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.82)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // "OOPS,"
    ctx.textAlign = 'center';
    ctx.font = `bold ${Math.round(72 * S)}px Arvo, Rockwell, Georgia, serif`;
    ctx.strokeStyle = '#000';
    ctx.lineWidth = Math.round(6 * S);
    ctx.strokeText('OOPS,', cx, cy - Math.round(60 * S));
    ctx.fillStyle = '#ffffff';
    ctx.fillText('OOPS,', cx, cy - Math.round(60 * S));

    // "ALL FINCHES"
    ctx.font = `bold ${Math.round(96 * S)}px Arvo, Rockwell, Georgia, serif`;
    ctx.strokeText('ALL FINCHES', cx, cy + Math.round(50 * S));
    ctx.fillStyle = '#f5c020';
    ctx.fillText('ALL FINCHES', cx, cy + Math.round(50 * S));

    // Subtitle
    ctx.font = `bold ${Math.round(24 * S)}px Arvo, Rockwell, Georgia, serif`;
    ctx.fillStyle = '#ffffff';
    ctx.fillText('Press button to start', cx, cy + Math.round(110 * S));
}
