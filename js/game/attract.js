/* ============================================
   ATTRACT MODE
   Demo/idle screen for kiosk display
   ============================================ */

import { gameState } from './state.js';
import { flowers, eaters, particles, finchWingsImage } from './entities.js';
import { spawnFlower, updateClouds } from './physics.js';
import { canvas, ctx } from './renderer.js';
import { S, CANVAS_WIDTH } from '../shared/config.js';

// ============================================
// ATTRACT MODE CONSTANTS
// ============================================

// Flying oops bird state (moves right to left, starts off right edge)
// Use CANVAS_WIDTH from config since canvas element may not be resized yet at module load time
let oopsBirdX = CANVAS_WIDTH + Math.round(80 * S);

const START_TEXT = "PRESS START";
const FLASH_INTERVAL = 30;         // Frames between flash toggles
const ATTRACT_SPAWN_INTERVAL = 80; // Slower spawn rate for bg flowers

// Screen 1 — title slide + flash
const TITLE_LINES = ["CRUMB'S", "BOUQUET", "BOUNCE!"];
const S1_WORD_INTERVAL = 50;     // frames between each word start
const S1_WORD_SLIDE_DUR = 40;    // frames for a word to slide in
const S1_FLASH_START = 160;      // timer value when flashing begins (all words settled by 140)
const S1_FLASH_HALF = 20;        // frames per half-flash
const S1_FLASH_CYCLES = 3;       // on/off cycles
const S1_TRANSITION = 550;       // timer value to switch to Screen 2 (4s hold after flash)

// Screen 2 — static high score board
const S2_DISPLAY_FRAMES = 480;   // 8 seconds on Screen 2

// Leaderboard box geometry
const BOX_START_Y = Math.round(125 * S);
const BOX_END_Y = Math.round(524 * S); // scales proportionally with canvas height

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

    // Advance oops bird if record exists
    if (gameState.oopsRecord) {
        oopsBirdX -= 1.2 * S * deltaTime;
        if (oopsBirdX < -Math.round(1200 * S)) oopsBirdX = canvas.width + Math.round(80 * S);
    }

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

    // Flying oops bird with record holder trailing behind it
    if (gameState.oopsRecord) {
        const birdY = Math.round(40 * S);
        const birdSize = Math.round(54 * S);
        if (finchWingsImage && finchWingsImage.complete) {
            ctx.drawImage(finchWingsImage, oopsBirdX - birdSize / 2, birdY - birdSize / 2, birdSize, birdSize);
        }
        ctx.font = `bold ${Math.round(30 * S)}px Arvo, Rockwell, Georgia, serif`;
        ctx.textAlign = 'left';
        const bannerText = `${gameState.oopsRecord.name}  ${gameState.oopsRecord.score}`;
        const textX = oopsBirdX + birdSize / 2 + Math.round(27 * S);
        const textMetrics = ctx.measureText(bannerText);
        const bannerPad = Math.round(11 * S);
        const bannerLeft = textX - bannerPad;
        const bannerRight = bannerLeft + textMetrics.width + bannerPad * 2;
        const bannerTop = birdY - Math.round(27 * S);
        const bannerBot = birdY + Math.round(11 * S);
        const bannerMid = (bannerTop + bannerBot) / 2;
        const pointExtend = Math.round(14 * S);

        // Banner body with two swallowtail points on the right
        ctx.fillStyle = '#d94d72';
        ctx.beginPath();
        ctx.moveTo(bannerLeft, bannerTop);
        ctx.lineTo(bannerRight, bannerTop);
        ctx.lineTo(bannerRight + pointExtend, bannerMid - Math.round(7 * S));  // top point
        ctx.lineTo(bannerRight, bannerMid);                                     // notch
        ctx.lineTo(bannerRight + pointExtend, bannerMid + Math.round(7 * S));  // bottom point
        ctx.lineTo(bannerRight, bannerBot);
        ctx.lineTo(bannerLeft, bannerBot);
        ctx.closePath();
        ctx.fill();

        // Yellow triangle tab on the left edge pointing toward the bird
        ctx.fillStyle = '#f5c020';
        ctx.beginPath();
        ctx.moveTo(bannerLeft - Math.round(19 * S), bannerMid);  // tip pointing left
        ctx.lineTo(bannerLeft, bannerTop);                        // top-right corner
        ctx.lineTo(bannerLeft, bannerBot);                        // bottom-right corner
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillText(bannerText, textX + Math.round(2 * S), birdY + Math.round(5 * S));
        ctx.fillStyle = '#f5c020';
        ctx.fillText(bannerText, textX, birdY + Math.round(3 * S));
    }

    // "PRESS START" on both screens
    const showStartText = Math.floor(gameState.attractFlashTimer / FLASH_INTERVAL) % 2 === 0;
    if (showStartText) {
        ctx.font = `bold ${Math.round(44 * S)}px Arvo, Rockwell, Georgia, serif`;
        ctx.textAlign = 'center';

        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillText(START_TEXT, canvas.width / 2 + Math.round(2 * S), canvas.height - Math.round(28 * S));

        ctx.strokeStyle = '#e8321a';
        ctx.lineWidth = Math.round(3 * S);
        ctx.strokeText(START_TEXT, canvas.width / 2, canvas.height - Math.round(30 * S));

        ctx.fillStyle = '#f5c020';
        ctx.fillText(START_TEXT, canvas.width / 2, canvas.height - Math.round(30 * S));
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

    ctx.font = `bold ${Math.round(100 * S)}px Arvo, Rockwell, Georgia, serif`;
    ctx.textAlign = 'center';

    TITLE_LINES.forEach((word, i) => {
        const wordTimer = t - i * S1_WORD_INTERVAL;

        if (wordTimer < 0) return;

        let x;
        if (wordTimer < S1_WORD_SLIDE_DUR) {
            const progress = wordTimer / S1_WORD_SLIDE_DUR;
            const eased = 1 - Math.pow(1 - progress, 2);
            x = (canvas.width + Math.round(300 * S)) + (canvas.width / 2 - (canvas.width + Math.round(300 * S))) * eased;
        } else {
            x = canvas.width / 2;
        }

        const y = Math.round(190 * S) + i * Math.round(130 * S);

        const wordSettled = wordTimer >= S1_WORD_SLIDE_DUR;
        if (wordSettled && !flashVisible) return;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillText(word, x + Math.round(4 * S), y + Math.round(4 * S));

        ctx.strokeStyle = '#f5c020';
        ctx.lineWidth = Math.round(10 * S);
        ctx.strokeText(word, x, y);

        ctx.fillStyle = '#e8321a';
        ctx.fillText(word, x, y);
    });
}

// ============================================
// SCREEN 2 — STATIC HIGH SCORE BOARD
// ============================================

function drawStaticLeaderboard() {
    const boxX = canvas.width / 2 - Math.round(180 * S);
    const boxWidth = Math.round(360 * S);
    const startY = BOX_START_Y;
    const endY = BOX_END_Y;
    const leaderboardHeight = endY - startY;
    const headerHeight = Math.round(55 * S);

    // Title above the box
    ctx.font = `bold ${Math.round(54 * S)}px Arvo, Rockwell, Georgia, serif`;
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillText("CRUMB'S BOUQUET BOUNCE!", canvas.width / 2 + Math.round(3 * S), startY - Math.round(20 * S));
    ctx.strokeStyle = '#f5c020';
    ctx.lineWidth = Math.round(7 * S);
    ctx.strokeText("CRUMB'S BOUQUET BOUNCE!", canvas.width / 2, startY - Math.round(24 * S));
    ctx.fillStyle = '#e8321a';
    ctx.fillText("CRUMB'S BOUQUET BOUNCE!", canvas.width / 2, startY - Math.round(24 * S));

    // Background
    ctx.fillStyle = 'rgba(245, 163, 181, 0.7)';
    ctx.beginPath();
    ctx.roundRect(boxX, startY, boxWidth, leaderboardHeight, Math.round(12 * S));
    ctx.fill();

    // Border
    ctx.strokeStyle = '#e8321a';
    ctx.lineWidth = Math.round(6 * S);
    ctx.beginPath();
    ctx.roundRect(boxX, startY, boxWidth, leaderboardHeight, Math.round(12 * S));
    ctx.stroke();

    // Header
    ctx.fillStyle = '#e8321a';
    ctx.font = `bold ${Math.round(34 * S)}px Arvo, Rockwell, Georgia, serif`;
    ctx.textAlign = 'center';
    ctx.fillText('HIGH SCORES', canvas.width / 2, startY + Math.round(40 * S));

    ctx.strokeStyle = '#e8321a';
    ctx.lineWidth = Math.round(3 * S);
    ctx.beginPath();
    ctx.moveTo(boxX + Math.round(30 * S), startY + Math.round(56 * S));
    ctx.lineTo(boxX + boxWidth - Math.round(30 * S), startY + Math.round(56 * S));
    ctx.stroke();

    const MAX_ROWS = 10;
    const contentStartY = startY + headerHeight + Math.round(10 * S);
    const contentHeight = leaderboardHeight - headerHeight - Math.round(20 * S);
    const rowHeight = contentHeight / MAX_ROWS;

    ctx.font = `bold ${Math.round(28 * S)}px Arvo, Rockwell, Georgia, serif`;
    for (let index = 0; index < MAX_ROWS; index++) {
        const entry = gameState.topScores[index];
        const y = contentStartY + index * rowHeight + rowHeight * 0.75;

        // Gold / silver / bronze row highlight
        const podiumColors = ['#ffd700', '#d0d0d0', '#e8c49a'];
        if (index < 3 && entry) {
            ctx.fillStyle = podiumColors[index];
            const rowY = contentStartY + index * rowHeight;
            ctx.beginPath();
            ctx.roundRect(boxX + Math.round(4 * S), rowY + Math.round(2 * S), boxWidth - Math.round(8 * S), rowHeight - Math.round(4 * S), Math.round(4 * S));
            ctx.fill();
        }

        // Rank
        ctx.textAlign = 'right';
        ctx.fillStyle = entry ? '#e8321a' : '#999';
        ctx.fillText(`${index + 1}.`, boxX + Math.round(48 * S), y);

        if (entry) {
            // Name
            ctx.textAlign = 'left';
            ctx.fillStyle = '#3a2a1a';
            ctx.fillText(entry.name, boxX + Math.round(62 * S), y);

            // Score
            ctx.textAlign = 'right';
            ctx.fillStyle = '#e8321a';
            ctx.fillText(entry.score.toString(), boxX + boxWidth - Math.round(20 * S), y);
        } else {
            // Empty slot
            ctx.textAlign = 'left';
            ctx.fillStyle = '#bbb';
            ctx.font = `${Math.round(26 * S)}px Arvo, Rockwell, Georgia, serif`;
            ctx.fillText('---', boxX + Math.round(62 * S), y);
            ctx.textAlign = 'right';
            ctx.fillText('---', boxX + boxWidth - Math.round(20 * S), y);
            ctx.font = `bold ${Math.round(28 * S)}px Arvo, Rockwell, Georgia, serif`;
        }
    }
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
