/* ============================================
   GAME STATE MANAGEMENT
   All mutable game state stored here - Kiosk Mode
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
    isTopTenScore: false,

    // Timing
    flowerSpawnTimer: 0,
    currentEatingFlower: null,

    // Attract mode
    attractMode: true,
    attractScreen: 1,       // 1 = title screen, 2 = score screen
    attractTitleTimer: 0,   // drives Screen 1 word-slide + flash animation
    attractFlashTimer: 0,
    leaderboardScrollY: 0, // Start at top for scroll effect
    cricketChompTimer: 0,  // Animation timer for Cricket in leaderboard
    cricketMouthOpen: false, // Toggle for chomp animation
    attractScreen2Timer: 0, // frames elapsed on Screen 2

    // Arcade name entry (3-letter picker)
    nameEntryChars: ['A', 'A', 'A'],
    nameEntryCursor: 0,  // 0, 1, 2, or 3 (END)
    nameEntryCharIndex: 0  // Index in character set
};

// ============================================
// INPUT STATE - GAMEPAD ONLY
// ============================================

export const inputState = {
    // Gamepad connection
    gamepadIndex: null,

    // Movement (axis 1: left/right)
    leftPressed: false,
    rightPressed: false,

    // Name entry (axis 0: up/down)
    upPressed: false,
    downPressed: false,

    // Action button (button 0)
    buttonPressed: false,
    previousButtonPressed: false  // For edge detection
};

// ============================================
// CONSTANTS
// ============================================

export const flowerSpawnInterval = 60; // frames between spawns

// Character set for name entry (A-Z, 0-9, END)
export const NAME_ENTRY_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

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
    gameState.isTopTenScore = false;
    gameState.flowerSpawnTimer = 0;
    gameState.currentEatingFlower = null;
    gameState.attractMode = false;

    // Reset name entry state
    gameState.nameEntryChars = ['A', 'A', 'A'];
    gameState.nameEntryCursor = 0;
    gameState.nameEntryCharIndex = 0;
}

/**
 * Reset attract mode state
 */
export function resetAttractMode() {
    gameState.attractMode = true;
    gameState.attractScreen = 1;
    gameState.attractTitleTimer = 0;
    gameState.attractFlashTimer = 0;
    gameState.leaderboardScrollY = 0;
    gameState.cricketChompTimer = 0;
    gameState.cricketMouthOpen = false;
    gameState.attractScreen2Timer = 0;
    gameState.gameStarted = false;
    gameState.gameActive = false;
    gameState.gameOverPhase = '';
    gameState.gameOverShown = false;
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
