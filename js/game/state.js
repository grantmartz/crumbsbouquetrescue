/* ============================================
   GAME STATE MANAGEMENT
   All mutable game state stored here
   ============================================ */

// ============================================
// GAME STATE OBJECT
// ============================================

export const gameState = {
    // Core game flow
    gameActive: false,
    gameStarted: false, // Track if game has been started at all
    score: 0,
    gameOverShown: false,
    countdown: 0, // 0 = no countdown, 3, 2, 1 = counting down
    countdownTimer: 0,
    highScore: 0, // Loaded from localStorage on init
    gameOverPhase: '', // '', 'eating', 'scolding', 'nameentry', 'gameover'
    gameOverTimer: 0,
    bonusText: null, // {text: string, x: number, y: number, timer: number}

    // Combo system
    lastFlowerColor: null, // Track last bounced flower color
    comboStreak: 0, // Current streak count

    // Leaderboard state
    topScores: [], // Array of {name: string, score: number, timestamp: number}
    showNameEntry: false,
    playerName: '',
    isTopTenScore: false,

    // Timing
    flowerSpawnTimer: 0,
    currentEatingFlower: null // Moved from window.currentEatingFlower
};

// ============================================
// INPUT STATE
// ============================================

export const inputState = {
    keys: {},
    touchStartX: 0,
    touchCurrentX: 0,
    isTouching: false,
    leftButtonPressed: false,
    rightButtonPressed: false
};

// ============================================
// CONSTANTS
// ============================================

export const flowerSpawnInterval = 60; // frames between spawns

// ============================================
// STATE MANAGEMENT FUNCTIONS
// ============================================

/**
 * Reset game state for a new game
 */
export function resetGameState() {
    gameState.gameActive = false;
    gameState.score = 0;
    gameState.gameOverShown = false;
    gameState.countdown = 3; // Start countdown
    gameState.countdownTimer = 0;
    gameState.gameOverPhase = '';
    gameState.gameOverTimer = 0;
    gameState.bonusText = null;
    gameState.lastFlowerColor = null;
    gameState.comboStreak = 0;
    gameState.showNameEntry = false;
    gameState.playerName = '';
    gameState.isTopTenScore = false;
    gameState.flowerSpawnTimer = 0;
    gameState.currentEatingFlower = null;
}

// ============================================
// LOCALSTORAGE FUNCTIONS
// ============================================

const HIGH_SCORE_KEY = 'weddingGameHighScore';

/**
 * Load high score from localStorage
 * @returns {number}
 */
export function loadHighScore() {
    const stored = localStorage.getItem(HIGH_SCORE_KEY);
    const score = parseInt(stored) || 0;
    gameState.highScore = score;
    return score;
}

/**
 * Save high score to localStorage
 * @param {number} score - Score to save
 */
export function saveHighScore(score) {
    localStorage.setItem(HIGH_SCORE_KEY, score.toString());
    gameState.highScore = score;
}
