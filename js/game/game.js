/* ============================================
   MAIN GAME ENTRY POINT
   Game loop, initialization - Kiosk Mode
   ============================================ */

import { gameState, inputState, resetGameState, resetAttractMode, loadHighScore } from './state.js';
import { initAudio, toggleMute, startMusic, stopMusic, playCountdownBeep, playGameOver } from './audio.js';
import { player, flowers, eaters, particles, initClouds, initPineTrees, initPlayer } from './entities.js';
import { update, spawnFlower } from './physics.js';
import { canvas, draw, drawOopsScreen } from './renderer.js';
import { initGamepad, pollGamepad, isButtonJustPressed } from './gamepad.js';
import { updateAttractMode, drawAttractOverlay, resetAttractMode as resetAttract } from './attract.js';
import { updateNameEntry, drawNameEntry } from './nameentry.js';
import { loadLeaderboard, isTopTen, loadOopsRecord, isNewOopsRecord } from '../shared/leaderboard.js';

// ============================================
// TIMING
// ============================================

let lastFrameTime = performance.now();
const targetFrameTime = 1000 / 60; // 60 FPS

// Game over timeout (7 seconds = 420 frames at 60fps)
const GAME_OVER_TIMEOUT = 420;

// ============================================
// GAME LOOP
// ============================================

/**
 * Main game loop using requestAnimationFrame
 */
function gameLoop(currentTime) {
    // Calculate delta time and cap it to prevent huge jumps when tab loses focus
    const deltaTime = Math.min((currentTime - lastFrameTime) / targetFrameTime, 3);
    lastFrameTime = currentTime;

    // Poll gamepad input each frame
    pollGamepad();

    // Handle oops mode announcement screen
    if (gameState.oopsScreen) {
        draw();
        drawOopsScreen();
        if (isButtonJustPressed()) {
            gameState.oopsScreen = false;
            startGame();
            gameState.oopsAllFinches = true; // restore after resetGameState clears it
            // re-spawn initial flowers now that oopsAllFinches is set
            flowers.length = 0;
            spawnFlower(); spawnFlower(); spawnFlower();
            flowers[flowers.length - 2].y = canvas.height - 150;
            flowers[flowers.length - 1].y = canvas.height - 300;
        }
        requestAnimationFrame(gameLoop);
        return;
    }

    // Handle attract mode
    if (gameState.attractMode) {
        updateAttractMode(deltaTime);
        draw();
        drawAttractOverlay();

        // Start game when button pressed
        if (isButtonJustPressed()) {
            startGame();
        }

        requestAnimationFrame(gameLoop);
        return;
    }

    // Handle name entry mode
    if (gameState.gameOverPhase === 'nameentry' && gameState.showNameEntry) {
        draw();
        drawNameEntry();
        updateNameEntry(deltaTime);
        requestAnimationFrame(gameLoop);
        return;
    }

    // Handle game over timeout
    if (gameState.gameOverPhase === 'gameover' || gameState.gameOverPhase === 'birdword') {
        gameState.gameOverTimer += deltaTime;

        // Return to attract mode after timeout or button press
        if (gameState.gameOverTimer >= GAME_OVER_TIMEOUT || isButtonJustPressed()) {
            returnToAttract();
        }
    }

    // Start music the first frame gameplay becomes active (after countdown)
    if (gameState.gameActive && !gameState.musicStarted) {
        gameState.musicStarted = true;
        startMusic();
    }

    // Only update if delta time is reasonable (prevents updates during long pauses)
    if (deltaTime < 5) {
        const result = update(deltaTime);
        // Check if game over was triggered
        if (result === 'gameover') {
            gameOver();
        }
    }

    draw();
    requestAnimationFrame(gameLoop);
}

// ============================================
// GAME STATE MANAGEMENT
// ============================================

/**
 * Start a new game
 */
export function startGame() {
    // Reset game state
    resetGameState();
    gameState.gameStarted = true;
    gameState.countdown = 3;
    gameState.attractMode = false;

    // Reset player
    player.x = canvas.width / 2;
    player.y = 100;
    player.velocityY = 0;
    player.velocityX = 0;

    // Clear arrays
    flowers.length = 0;
    eaters.length = 0;
    particles.length = 0;

    // First countdown beep (music starts after countdown ends)
    initAudio();
    playCountdownBeep(3);

    // Spawn 3 initial flowers at staggered heights
    spawnFlower();
    spawnFlower();
    spawnFlower();
    // Spread them vertically so they don't all start at the bottom
    flowers[flowers.length - 2].y = canvas.height - 150;
    flowers[flowers.length - 1].y = canvas.height - 300;
}

/**
 * Handle game over
 */
function gameOver() {
    if (gameState.gameOverShown) return;
    stopMusic();
    playGameOver();
    gameState.gameActive = false;
    player.velocityY = 0;
    player.velocityX = 0;

    // Clear any in-progress eaters from normal gameplay
    eaters.length = 0;

    // Check if score makes top 10 (oops mode scores don't count)
    gameState.isTopTenScore = !gameState.oopsAllFinches && isTopTen(gameState.score);
    gameState.isOopsRecord = gameState.oopsAllFinches && isNewOopsRecord(gameState.score);

    // Start eating phase
    gameState.gameOverPhase = 'eating';
    gameState.gameOverTimer = 0;
    gameState.gameOverShown = true;
}

/**
 * Return to attract mode
 */
function returnToAttract() {
    resetAttract();

    // Reload leaderboard and oops record for attract screen display
    gameState.topScores = loadLeaderboard();
    gameState.oopsRecord = loadOopsRecord();
}

// ============================================
// INITIALIZATION
// ============================================

// Initialize gamepad
initGamepad();

// Initialize clouds and trees
initClouds(canvas.width, canvas.height);
initPineTrees(canvas.width);
initPlayer(canvas.width);

// Load high score, leaderboard, and oops record from localStorage
loadHighScore();
gameState.topScores = loadLeaderboard();
gameState.oopsRecord = loadOopsRecord();

// Start in attract mode
gameState.attractMode = true;

// Keyboard: unlock AudioContext on any key, toggle mute with M
document.addEventListener('keydown', (e) => {
    initAudio();
    if (e.key === 'm' || e.key === 'M') {
        toggleMute();
    }
});

// Start game loop
lastFrameTime = performance.now();
gameLoop(lastFrameTime);
