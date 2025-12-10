/* ============================================
   MAIN GAME ENTRY POINT
   Game loop, event handlers, initialization
   ============================================ */

import { gameState, inputState, resetGameState, loadHighScore } from './state.js';
import { player, flowers, eaters, particles, initClouds, initPineTrees, initPlayer } from './entities.js';
import { update } from './physics.js';
import { canvas, draw } from './renderer.js';
import { database, loadLeaderboard, isTopTen, submitScore } from '../shared/firebase.js';
import { spawnFlower } from './physics.js';

// ============================================
// TIMING
// ============================================

let lastFrameTime = performance.now();
const targetFrameTime = 1000 / 60; // 60 FPS

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
function startGame() {
    // Reset game state
    resetGameState();
    gameState.gameStarted = true; // Mark that game has been started
    gameState.countdown = 3; // Start countdown from 3

    // Hide start button
    document.getElementById('startButton').style.display = 'none';

    // Reset player
    player.x = canvas.width / 2;
    player.y = 100;
    player.velocityY = 0;
    player.velocityX = 0;

    // Clear arrays
    flowers.length = 0;
    eaters.length = 0;
    particles.length = 0;

    // Update UI
    document.getElementById('score').textContent = 'Score: 0';
    document.getElementById('highScore').textContent = 'High Score: ' + gameState.highScore;

    // Spawn initial flowers immediately at different heights
    spawnFlower(); // First flower at bottom

    // Add a second flower already partway up
    const flower2 = {
        x: Math.random() * (canvas.width - 80) + 40,
        y: canvas.height - 150,
        width: 50,
        height: 50,
        riseSpeed: 2,
        bounced: false,
        type: Math.floor(Math.random() * 4),
        isFinch: false
    };
    flowers.push(flower2);

    // Add a third flower even higher
    const flower3 = {
        x: Math.random() * (canvas.width - 80) + 40,
        y: canvas.height - 300,
        width: 50,
        height: 50,
        riseSpeed: 2,
        bounced: false,
        type: Math.floor(Math.random() * 4),
        isFinch: false
    };
    flowers.push(flower3);
}

/**
 * Handle game over
 */
function gameOver() {
    if (gameState.gameOverShown) return;
    gameState.gameActive = false;
    player.velocityY = 0; // Stop velocity immediately
    player.velocityX = 0;

    // Clear any in-progress eaters from normal gameplay
    eaters.length = 0;

    // Check if score makes top 10
    if (database && isTopTen(gameState.score, gameState.topScores)) {
        gameState.isTopTenScore = true;
    } else {
        gameState.isTopTenScore = false;
    }

    // Start eating phase
    gameState.gameOverPhase = 'eating';
    gameState.gameOverTimer = 0;
    gameState.gameOverShown = true;
}

// ============================================
// EVENT LISTENERS
// ============================================

// Keyboard events
document.addEventListener('keydown', (e) => {
    // Handle name entry
    if (gameState.showNameEntry && gameState.gameOverPhase === 'nameentry') {
        if (e.key === 'Enter') {
            if (gameState.playerName.trim().length > 0) {
                // Submit score if name provided
                submitScore(gameState.playerName, gameState.score,
                    () => {
                        gameState.showNameEntry = false;
                        gameState.playerName = '';
                        gameState.gameOverPhase = 'gameover';
                    },
                    (error) => {
                        console.error("Score submission error:", error);
                        gameState.showNameEntry = false;
                        gameState.playerName = '';
                        gameState.gameOverPhase = 'gameover';
                    }
                );
            } else {
                // Skip leaderboard submission if name is blank
                gameState.showNameEntry = false;
                gameState.playerName = '';
                gameState.gameOverPhase = 'gameover';
            }
        } else if (e.key === 'Backspace') {
            e.preventDefault();
            gameState.playerName = gameState.playerName.slice(0, -1);
        } else if (e.key.length === 1 && gameState.playerName.length < 15) {
            // Only allow letters, numbers, and spaces
            if (/[a-zA-Z0-9 ]/.test(e.key)) {
                gameState.playerName += e.key;
            }
        }
        return; // Don't process other keys during name entry
    }

    inputState.keys[e.key] = true;

    // Spacebar for page control only
    if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault(); // Prevent page scroll
        return;
    }
});

document.addEventListener('keyup', (e) => {
    inputState.keys[e.key] = false;
});

// Start button click handler (both mouse and touch)
document.getElementById('startButton').addEventListener('click', function(e) {
    e.stopPropagation(); // Prevent touch event from bubbling
    startGame();
});

document.getElementById('startButton').addEventListener('touchend', function(e) {
    e.preventDefault();
    e.stopPropagation();
    startGame();
});

// Restart button click handler
document.getElementById('restartButton').addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    document.getElementById('restartButton').style.display = 'none';
    startGame();
});

document.getElementById('restartButton').addEventListener('touchend', function(e) {
    e.preventDefault();
    e.stopPropagation();
    document.getElementById('restartButton').style.display = 'none';
    startGame();
});

// Left button controls with tap-and-hold
document.getElementById('leftButton').addEventListener('mousedown', function(e) {
    e.preventDefault();
    inputState.leftButtonPressed = true;
});

document.getElementById('leftButton').addEventListener('touchstart', function(e) {
    e.preventDefault();
    inputState.leftButtonPressed = true;
});

document.getElementById('leftButton').addEventListener('mouseup', function(e) {
    e.preventDefault();
    inputState.leftButtonPressed = false;
});

document.getElementById('leftButton').addEventListener('touchend', function(e) {
    e.preventDefault();
    inputState.leftButtonPressed = false;
});

document.getElementById('leftButton').addEventListener('mouseleave', function(e) {
    inputState.leftButtonPressed = false;
});

// Right button controls
document.getElementById('rightButton').addEventListener('mousedown', function(e) {
    e.preventDefault();
    inputState.rightButtonPressed = true;
});

document.getElementById('rightButton').addEventListener('touchstart', function(e) {
    e.preventDefault();
    inputState.rightButtonPressed = true;
});

document.getElementById('rightButton').addEventListener('mouseup', function(e) {
    e.preventDefault();
    inputState.rightButtonPressed = false;
});

document.getElementById('rightButton').addEventListener('touchend', function(e) {
    e.preventDefault();
    inputState.rightButtonPressed = false;
});

document.getElementById('rightButton').addEventListener('mouseleave', function(e) {
    inputState.rightButtonPressed = false;
});

// Touch controls - ONLY on canvas
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();

    // Don't handle touch movement if game hasn't started yet or is over
    if (!gameState.gameActive) {
        return;
    }

    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    // Map screen touch to canvas coordinates
    inputState.touchStartX = ((touch.clientX - rect.left) / rect.width) * canvas.width;
    inputState.touchCurrentX = inputState.touchStartX;
    inputState.isTouching = true;
});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (inputState.isTouching) {
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        // Map screen touch to canvas coordinates
        const canvasX = ((touch.clientX - rect.left) / rect.width) * canvas.width;
        inputState.touchCurrentX = inputState.touchStartX + (canvasX - inputState.touchStartX);
    }
});

canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    inputState.isTouching = false;
    inputState.touchStartX = 0;
    inputState.touchCurrentX = 0;
});

// Mouse controls (for desktop)
canvas.addEventListener('mousedown', (e) => {
    // Don't handle mouse movement if game hasn't started yet or is over
    if (!gameState.gameActive) {
        return;
    }

    const rect = canvas.getBoundingClientRect();
    inputState.touchStartX = e.clientX - rect.left;
    inputState.touchCurrentX = inputState.touchStartX;
    inputState.isTouching = true;
});

canvas.addEventListener('mousemove', (e) => {
    if (inputState.isTouching) {
        const rect = canvas.getBoundingClientRect();
        inputState.touchCurrentX = e.clientX - rect.left;
    }
});

canvas.addEventListener('mouseup', () => {
    inputState.isTouching = false;
});

// ============================================
// INITIALIZATION
// ============================================

// Initialize clouds and trees
initClouds(canvas.width, canvas.height);
initPineTrees(canvas.width);
initPlayer(canvas.width);

// Load high score from localStorage
loadHighScore();
document.getElementById('highScore').textContent = 'High Score: ' + gameState.highScore;

// Load leaderboard from Firebase
if (database) {
    loadLeaderboard((scores) => {
        gameState.topScores = scores;
    });
}

// Start game loop
lastFrameTime = performance.now();
gameLoop(lastFrameTime);
