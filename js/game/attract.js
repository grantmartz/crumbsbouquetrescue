/* ============================================
   ATTRACT MODE
   Demo/idle screen for kiosk display
   ============================================ */

import { gameState } from './state.js';
import { flowers, eaters, particles, clouds, eaterMouthOpen, eaterMouthClosed } from './entities.js';
import { spawnFlower, updateClouds } from './physics.js';
import { canvas, ctx } from './renderer.js';
import { EATER_COLOR } from '../shared/config.js';

// ============================================
// ATTRACT MODE CONSTANTS
// ============================================

const TITLE_TEXT = "CRUMB'S BOUQUET RESCUE!";
const START_TEXT = "PRESS START";
const FLASH_INTERVAL = 30;  // Frames between flash toggles
const SCROLL_SPEED = 0.5;   // Pixels per frame
const ATTRACT_SPAWN_INTERVAL = 80; // Slower spawn rate

// ============================================
// ATTRACT MODE UPDATE
// ============================================

/**
 * Update attract mode state
 * @param {number} deltaTime - Frame delta
 */
export function updateAttractMode(deltaTime) {
    // Update flash timer
    gameState.attractFlashTimer += deltaTime;

    // Spawn flowers continuously for demo
    gameState.flowerSpawnTimer += deltaTime;
    if (gameState.flowerSpawnTimer >= ATTRACT_SPAWN_INTERVAL) {
        spawnFlower();
        gameState.flowerSpawnTimer = 0;
    }

    // Move flowers up (they just rise and disappear)
    for (let i = flowers.length - 1; i >= 0; i--) {
        const flower = flowers[i];
        flower.y -= flower.riseSpeed * deltaTime;

        // Remove flowers that went off top
        if (flower.y < -50) {
            flowers.splice(i, 1);
        }
    }

    // Update clouds
    updateClouds();

    // Scroll leaderboard
    if (gameState.topScores.length > 0) {
        gameState.leaderboardScrollY += SCROLL_SPEED * deltaTime;

        // Reset scroll when all scores and Cricket have scrolled past the top
        // Need to scroll: scrollHeight (to move first score from bottom to top) + all scores + Cricket
        const scrollAreaHeight = 280; // Approximate scroll area height
        const totalHeight = scrollAreaHeight + (gameState.topScores.length * 36) + 100; // Scroll area + Scores + Cricket
        if (gameState.leaderboardScrollY > totalHeight) {
            gameState.leaderboardScrollY = 0; // Reset to bottom
        }
    }

    // Update Cricket chomp animation
    gameState.cricketChompTimer += deltaTime;
    if (gameState.cricketChompTimer >= 15) { // Toggle every 15 frames
        gameState.cricketMouthOpen = !gameState.cricketMouthOpen;
        gameState.cricketChompTimer = 0;
    }
}

// ============================================
// ATTRACT MODE DRAWING
// ============================================

/**
 * Draw attract mode overlay
 */
export function drawAttractOverlay() {
    // Draw title with shadow/outline effect
    ctx.font = 'bold 56px Rockwell, Georgia, serif';
    ctx.textAlign = 'center';

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillText(TITLE_TEXT, canvas.width / 2 + 3, 113);

    // Outline (yellow border)
    ctx.strokeStyle = '#e8b84d';
    ctx.lineWidth = 6;
    ctx.strokeText(TITLE_TEXT, canvas.width / 2, 110);

    // Fill
    ctx.fillStyle = '#d44e3a';
    ctx.fillText(TITLE_TEXT, canvas.width / 2, 110);

    // Draw scrolling leaderboard
    drawScrollingLeaderboard();

    // Draw "PRESS START" with flash effect
    const showStartText = Math.floor(gameState.attractFlashTimer / FLASH_INTERVAL) % 2 === 0;
    if (showStartText) {
        ctx.font = 'bold 36px Rockwell, Georgia, serif';
        ctx.textAlign = 'center';

        // Shadow (increased opacity)
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillText(START_TEXT, canvas.width / 2 + 2, canvas.height - 58);

        // Red outline for better visibility
        ctx.strokeStyle = '#d44e3a';
        ctx.lineWidth = 3;
        ctx.strokeText(START_TEXT, canvas.width / 2, canvas.height - 60);

        // Main text (bright yellow, full opacity)
        ctx.fillStyle = '#e8b84d';
        ctx.fillText(START_TEXT, canvas.width / 2, canvas.height - 60);
    }
}

/**
 * Draw scalloped border around rectangle
 */
function drawScallopedBorder(x, y, width, height, scallopRadius) {
    ctx.fillStyle = '#d44e3a';

    // Top edge scallops
    const topScallops = Math.floor(width / (scallopRadius * 2));
    const topSpacing = width / topScallops;
    for (let i = 0; i < topScallops; i++) {
        ctx.beginPath();
        ctx.arc(x + topSpacing * i + topSpacing / 2, y, scallopRadius, 0, Math.PI * 2);
        ctx.fill();
    }

    // Bottom edge scallops
    for (let i = 0; i < topScallops; i++) {
        ctx.beginPath();
        ctx.arc(x + topSpacing * i + topSpacing / 2, y + height, scallopRadius, 0, Math.PI * 2);
        ctx.fill();
    }

    // Left edge scallops
    const sideScallops = Math.floor(height / (scallopRadius * 2));
    const sideSpacing = height / sideScallops;
    for (let i = 0; i < sideScallops; i++) {
        ctx.beginPath();
        ctx.arc(x, y + sideSpacing * i + sideSpacing / 2, scallopRadius, 0, Math.PI * 2);
        ctx.fill();
    }

    // Right edge scallops
    for (let i = 0; i < sideScallops; i++) {
        ctx.beginPath();
        ctx.arc(x + width, y + sideSpacing * i + sideSpacing / 2, scallopRadius, 0, Math.PI * 2);
        ctx.fill();
    }
}

/**
 * Draw Cricket sprite for leaderboard
 */
function drawCricketInLeaderboard(x, y, size) {
    const mouthOpen = gameState.cricketMouthOpen;

    // Use custom images if provided
    if (mouthOpen && eaterMouthOpen && eaterMouthOpen.complete) {
        ctx.drawImage(eaterMouthOpen, x - size/2, y - size/2, size, size);
        return;
    } else if (!mouthOpen && eaterMouthClosed && eaterMouthClosed.complete) {
        ctx.drawImage(eaterMouthClosed, x - size/2, y - size/2, size, size);
        return;
    }

    // Fallback to placeholder drawing
    ctx.fillStyle = EATER_COLOR;

    // Head (main circle)
    ctx.beginPath();
    ctx.arc(x, y, size/2.5, 0, Math.PI * 2);
    ctx.fill();

    // Left ear
    ctx.beginPath();
    ctx.ellipse(x - size/4, y - size/5, size/6, size/4, -0.3, 0, Math.PI * 2);
    ctx.fill();

    // Right ear
    ctx.beginPath();
    ctx.ellipse(x + size/4, y - size/5, size/6, size/4, 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Snout
    ctx.beginPath();
    ctx.ellipse(x, y + size/5, size/5, size/4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Mouth (if open)
    if (mouthOpen) {
        ctx.fillStyle = '#1a0a0a';
        ctx.beginPath();
        ctx.arc(x, y + size/3, size/8, 0, Math.PI);
        ctx.fill();
    }

    // Nose
    ctx.fillStyle = '#3a2a1a';
    ctx.beginPath();
    ctx.arc(x, y + size/2.5, size/12, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.beginPath();
    ctx.arc(x - size/6, y, size/14, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + size/6, y, size/14, 0, Math.PI * 2);
    ctx.fill();
}

/**
 * Draw scrolling leaderboard in center of screen
 */
function drawScrollingLeaderboard() {
    // Leaderboard area (center of screen)
    const boxX = canvas.width / 2 - 180;
    const boxWidth = 360;
    const startY = 160;
    const endY = canvas.height - 100;
    const leaderboardHeight = endY - startY;
    const headerHeight = 55; // Space for static header

    // Semi-transparent light pink background with rounded corners
    ctx.fillStyle = 'rgba(245, 163, 181, 0.7)';
    ctx.beginPath();
    ctx.roundRect(boxX, startY, boxWidth, leaderboardHeight, 12);
    ctx.fill();

    // Thick red border with rounded corners
    ctx.strokeStyle = '#d44e3a';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.roundRect(boxX, startY, boxWidth, leaderboardHeight, 12);
    ctx.stroke();

    // Draw static header (outside clipping)
    ctx.fillStyle = '#d44e3a';
    ctx.font = 'bold 28px Rockwell, Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('HIGH SCORES', canvas.width / 2, startY + 35);

    // Draw static underline
    ctx.strokeStyle = '#d44e3a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(boxX + 30, startY + 50);
    ctx.lineTo(boxX + boxWidth - 30, startY + 50);
    ctx.stroke();

    if (gameState.topScores.length === 0) {
        // Show "No scores yet" if empty
        ctx.fillStyle = '#3a2a1a';
        ctx.font = '20px Rockwell, Georgia, serif';
        ctx.textAlign = 'center';
        ctx.fillText('No scores yet!', canvas.width / 2, startY + headerHeight + 60);

        // Still draw Cricket (20% larger)
        drawCricketInLeaderboard(canvas.width / 2, startY + headerHeight + 140, 72);
        return;
    }

    // Create clipping region for scrolling content (below header)
    const scrollStartY = startY + headerHeight + 5;
    const scrollHeight = leaderboardHeight - headerHeight - 10;

    ctx.save();
    ctx.beginPath();
    ctx.rect(boxX + 6, scrollStartY, boxWidth - 12, scrollHeight);
    ctx.clip();

    // Draw scrolling scores (start from bottom, scroll up)
    ctx.font = 'bold 20px Rockwell, Georgia, serif';
    gameState.topScores.forEach((entry, index) => {
        const y = scrollStartY + scrollHeight - 25 + (index * 36) - gameState.leaderboardScrollY;

        // Only draw if visible in clipping region
        if (y > scrollStartY - 30 && y < scrollStartY + scrollHeight + 30) {
            // Medal for top 3
            let medal = '';
            if (index === 0) medal = '\u{1F947}'; // Gold medal
            else if (index === 1) medal = '\u{1F948}'; // Silver medal
            else if (index === 2) medal = '\u{1F949}'; // Bronze medal

            // Rank
            ctx.textAlign = 'right';
            ctx.fillStyle = '#d44e3a';
            ctx.fillText(`${index + 1}.`, boxX + 45, y);

            // Medal (if top 3)
            if (medal) {
                ctx.textAlign = 'left';
                ctx.font = '18px sans-serif';
                ctx.fillText(medal, boxX + 50, y);
                ctx.font = 'bold 20px Rockwell, Georgia, serif';
            }

            // Name
            ctx.textAlign = 'left';
            ctx.fillStyle = '#3a2a1a';
            ctx.fillText(entry.name, boxX + (medal ? 78 : 55), y);

            // Score
            ctx.textAlign = 'right';
            ctx.fillStyle = '#d44e3a';
            ctx.fillText(entry.score.toString(), boxX + boxWidth - 20, y);
        }
    });

    // Draw Cricket at bottom of list
    const cricketY = scrollStartY + scrollHeight - 25 + (gameState.topScores.length * 36) + 40 - gameState.leaderboardScrollY;
    if (cricketY > scrollStartY - 40 && cricketY < scrollStartY + scrollHeight + 40) {
        drawCricketInLeaderboard(canvas.width / 2, cricketY, 66);
    }

    ctx.restore();
}

/**
 * Reset attract mode for re-entry
 */
export function resetAttractMode() {
    gameState.attractMode = true;
    gameState.attractFlashTimer = 0;
    gameState.leaderboardScrollY = 0;
    gameState.gameStarted = false;
    gameState.gameActive = false;
    gameState.gameOverPhase = '';
    flowers.length = 0;
    eaters.length = 0;
    particles.length = 0;
}
