/* ============================================
   ATTRACT MODE
   Demo/idle screen for kiosk display
   ============================================ */

import { gameState } from './state.js';
import { flowers, eaters, particles } from './entities.js';
import { spawnFlower, updateClouds } from './physics.js';
import { canvas, ctx } from './renderer.js';

// ============================================
// ATTRACT MODE CONSTANTS
// ============================================

const START_TEXT = "PRESS START";
const FLASH_INTERVAL = 30;         // Frames between flash toggles
const ATTRACT_SPAWN_INTERVAL = 80; // Slower spawn rate for bg flowers

// Screen 1 — title slide + flash
const TITLE_LINES = ["CRUMB'S", "BOUQUET", "RESCUE!"];
const S1_WORD_INTERVAL = 50;     // frames between each word start
const S1_WORD_SLIDE_DUR = 40;    // frames for a word to slide in
const S1_FLASH_START = 160;      // timer value when flashing begins (all words settled by 140)
const S1_FLASH_HALF = 20;        // frames per half-flash
const S1_FLASH_CYCLES = 3;       // on/off cycles
const S1_TRANSITION = 550;       // timer value to switch to Screen 2 (4s hold after flash)

// Screen 2 — static high score board
const S2_DISPLAY_FRAMES = 480;   // 8 seconds on Screen 2

// Leaderboard box geometry
const BOX_START_Y = 160;
const BOX_END_Y = 514; // canvas.height(614) - 100

// ============================================
// ATTRACT MODE UPDATE
// ============================================

export function updateAttractMode(deltaTime) {
    gameState.attractFlashTimer += deltaTime;

    // Background flowers
    gameState.flowerSpawnTimer += deltaTime;
    if (gameState.flowerSpawnTimer >= ATTRACT_SPAWN_INTERVAL) {
        spawnFlower();
        gameState.flowerSpawnTimer = 0;
    }
    for (let i = flowers.length - 1; i >= 0; i--) {
        const flower = flowers[i];
        flower.y -= flower.riseSpeed * deltaTime;
        if (flower.y < -50) flowers.splice(i, 1);
    }

    updateClouds();

    if (gameState.attractScreen === 1) {
        gameState.attractTitleTimer += deltaTime;
        if (gameState.attractTitleTimer >= S1_TRANSITION) {
            gameState.attractScreen = 2;
            gameState.attractTitleTimer = 0;
            gameState.attractScreen2Timer = 0;
        }
    } else {
        gameState.attractScreen2Timer += deltaTime;
        if (gameState.attractScreen2Timer >= S2_DISPLAY_FRAMES) {
            gameState.attractScreen = 1;
            gameState.attractTitleTimer = 0;
        }
    }
}

// ============================================
// ATTRACT MODE DRAWING
// ============================================

export function drawAttractOverlay() {
    if (gameState.attractScreen === 1) {
        drawTitleScreen();
    } else {
        drawStaticLeaderboard();
    }

    // "PRESS START" on both screens
    const showStartText = Math.floor(gameState.attractFlashTimer / FLASH_INTERVAL) % 2 === 0;
    if (showStartText) {
        ctx.font = 'bold 36px Rockwell, Georgia, serif';
        ctx.textAlign = 'center';

        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillText(START_TEXT, canvas.width / 2 + 2, canvas.height - 58);

        ctx.strokeStyle = '#d44e3a';
        ctx.lineWidth = 3;
        ctx.strokeText(START_TEXT, canvas.width / 2, canvas.height - 60);

        ctx.fillStyle = '#e8b84d';
        ctx.fillText(START_TEXT, canvas.width / 2, canvas.height - 60);
    }
}

// ============================================
// SCREEN 1 — TITLE ANIMATION
// ============================================

function drawTitleScreen() {
    const t = gameState.attractTitleTimer;
    const flashTimer = t - S1_FLASH_START;
    const totalFlashFrames = S1_FLASH_CYCLES * S1_FLASH_HALF * 2;

    let flashVisible = true;
    if (flashTimer >= 0 && flashTimer < totalFlashFrames) {
        flashVisible = Math.floor(flashTimer / S1_FLASH_HALF) % 2 === 0;
    }

    ctx.font = 'bold 72px Rockwell, Georgia, serif';
    ctx.textAlign = 'center';

    TITLE_LINES.forEach((word, i) => {
        const wordTimer = t - i * S1_WORD_INTERVAL;

        if (wordTimer < 0) return;

        let x;
        if (wordTimer < S1_WORD_SLIDE_DUR) {
            const progress = wordTimer / S1_WORD_SLIDE_DUR;
            const eased = 1 - Math.pow(1 - progress, 2);
            x = (canvas.width + 300) + (canvas.width / 2 - (canvas.width + 300)) * eased;
        } else {
            x = canvas.width / 2;
        }

        const y = 120 + i * 140;

        const wordSettled = wordTimer >= S1_WORD_SLIDE_DUR;
        if (wordSettled && !flashVisible) return;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillText(word, x + 4, y + 4);

        ctx.strokeStyle = '#e8b84d';
        ctx.lineWidth = 8;
        ctx.strokeText(word, x, y);

        ctx.fillStyle = '#d44e3a';
        ctx.fillText(word, x, y);
    });
}

// ============================================
// SCREEN 2 — STATIC HIGH SCORE BOARD
// ============================================

function drawStaticLeaderboard() {
    const boxX = canvas.width / 2 - 180;
    const boxWidth = 360;
    const startY = BOX_START_Y;
    const endY = BOX_END_Y;
    const leaderboardHeight = endY - startY;
    const headerHeight = 55;

    // Title above the box
    ctx.font = 'bold 44px Rockwell, Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillText("CRUMB'S BOUQUET RESCUE!", canvas.width / 2 + 3, startY - 18);
    ctx.strokeStyle = '#e8b84d';
    ctx.lineWidth = 6;
    ctx.strokeText("CRUMB'S BOUQUET RESCUE!", canvas.width / 2, startY - 21);
    ctx.fillStyle = '#d44e3a';
    ctx.fillText("CRUMB'S BOUQUET RESCUE!", canvas.width / 2, startY - 21);

    // Background
    ctx.fillStyle = 'rgba(245, 163, 181, 0.7)';
    ctx.beginPath();
    ctx.roundRect(boxX, startY, boxWidth, leaderboardHeight, 12);
    ctx.fill();

    // Border
    ctx.strokeStyle = '#d44e3a';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.roundRect(boxX, startY, boxWidth, leaderboardHeight, 12);
    ctx.stroke();

    // Header
    ctx.fillStyle = '#d44e3a';
    ctx.font = 'bold 28px Rockwell, Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('HIGH SCORES', canvas.width / 2, startY + 35);

    ctx.strokeStyle = '#d44e3a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(boxX + 30, startY + 50);
    ctx.lineTo(boxX + boxWidth - 30, startY + 50);
    ctx.stroke();

    if (gameState.topScores.length === 0) {
        ctx.fillStyle = '#3a2a1a';
        ctx.font = '20px Rockwell, Georgia, serif';
        ctx.textAlign = 'center';
        ctx.fillText('No scores yet!', canvas.width / 2, startY + headerHeight + 60);
        return;
    }

    const contentStartY = startY + headerHeight + 10;
    const contentHeight = leaderboardHeight - headerHeight - 20;
    const rowHeight = Math.min(28, contentHeight / gameState.topScores.length);

    ctx.font = 'bold 20px Rockwell, Georgia, serif';
    gameState.topScores.forEach((entry, index) => {
        const y = contentStartY + index * rowHeight + rowHeight * 0.75;

        let medal = '';
        if (index === 0) medal = '\u{1F947}';
        else if (index === 1) medal = '\u{1F948}';
        else if (index === 2) medal = '\u{1F949}';

        // Rank
        ctx.textAlign = 'right';
        ctx.fillStyle = '#d44e3a';
        ctx.fillText(`${index + 1}.`, boxX + 45, y);

        // Medal
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
    });
}

// ============================================
// RESET
// ============================================

export function resetAttractMode() {
    gameState.attractMode = true;
    gameState.attractScreen = 1;
    gameState.attractTitleTimer = 0;
    gameState.attractFlashTimer = 0;
    gameState.attractScreen2Timer = 0;
    gameState.cricketChompTimer = 0;
    gameState.cricketMouthOpen = false;
    gameState.leaderboardScrollY = 0;
    gameState.gameStarted = false;
    gameState.gameActive = false;
    gameState.gameOverPhase = '';
    flowers.length = 0;
    eaters.length = 0;
    particles.length = 0;
}
