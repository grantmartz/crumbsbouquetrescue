/* ============================================
   ARCADE-STYLE NAME ENTRY
   3-letter name picker for high scores
   ============================================ */

import { gameState, NAME_ENTRY_CHARS } from './state.js';
import { canvas, ctx } from './renderer.js';
import { isButtonJustPressed, shouldTriggerUp, shouldTriggerDown, shouldTriggerLeft, shouldTriggerRight } from './gamepad.js';
import { saveScore } from '../shared/leaderboard.js';
import { playMenuBlip, playCursorMove, playConfirm } from './audio.js';

// ============================================
// NAME ENTRY CONSTANTS
// ============================================

const CHAR_WIDTH = 50;
const CHAR_SPACING = 60;
const CURSOR_POSITIONS = 4; // 0, 1, 2 for letters, 3 for END

// ============================================
// NAME ENTRY UPDATE
// ============================================

/**
 * Update name entry state based on gamepad input
 * @param {number} deltaTime - Frame delta
 * @returns {boolean} True if name entry is complete
 */
export function updateNameEntry(deltaTime) {
    // Handle up/down for character selection
    if (gameState.nameEntryCursor < 3) {
        // Cycling through letters
        if (shouldTriggerUp()) {
            // Move to next character
            gameState.nameEntryCharIndex = (gameState.nameEntryCharIndex + 1) % NAME_ENTRY_CHARS.length;
            gameState.nameEntryChars[gameState.nameEntryCursor] = NAME_ENTRY_CHARS[gameState.nameEntryCharIndex];
            playMenuBlip();
        } else if (shouldTriggerDown()) {
            // Move to previous character
            gameState.nameEntryCharIndex = (gameState.nameEntryCharIndex - 1 + NAME_ENTRY_CHARS.length) % NAME_ENTRY_CHARS.length;
            gameState.nameEntryChars[gameState.nameEntryCursor] = NAME_ENTRY_CHARS[gameState.nameEntryCharIndex];
            playMenuBlip();
        }
    }

    // Handle left/right for cursor movement
    if (shouldTriggerRight()) {
        if (gameState.nameEntryCursor < 3) {
            gameState.nameEntryCursor++;
            // Update char index to match current position's character
            if (gameState.nameEntryCursor < 3) {
                const currentChar = gameState.nameEntryChars[gameState.nameEntryCursor];
                gameState.nameEntryCharIndex = NAME_ENTRY_CHARS.indexOf(currentChar);
                if (gameState.nameEntryCharIndex === -1) gameState.nameEntryCharIndex = 0;
            }
            playCursorMove();
        }
    } else if (shouldTriggerLeft()) {
        if (gameState.nameEntryCursor > 0) {
            gameState.nameEntryCursor--;
            // Update char index to match current position's character
            const currentChar = gameState.nameEntryChars[gameState.nameEntryCursor];
            gameState.nameEntryCharIndex = NAME_ENTRY_CHARS.indexOf(currentChar);
            if (gameState.nameEntryCharIndex === -1) gameState.nameEntryCharIndex = 0;
            playCursorMove();
        }
    }

    // Handle button press for confirmation
    if (isButtonJustPressed()) {
        if (gameState.nameEntryCursor === 3) {
            // END selected - submit the name
            playConfirm();
            const name = gameState.nameEntryChars.join('');
            saveScore(name, gameState.score);

            // Transition to game over
            gameState.showNameEntry = false;
            gameState.gameOverPhase = 'gameover';
            gameState.gameOverTimer = 0;
            return true;
        } else {
            // Move to next position
            playConfirm();
            gameState.nameEntryCursor++;
            if (gameState.nameEntryCursor < 3) {
                const currentChar = gameState.nameEntryChars[gameState.nameEntryCursor];
                gameState.nameEntryCharIndex = NAME_ENTRY_CHARS.indexOf(currentChar);
                if (gameState.nameEntryCharIndex === -1) gameState.nameEntryCharIndex = 0;
            }
        }
    }

    return false;
}

// ============================================
// NAME ENTRY DRAWING
// ============================================

/**
 * Draw name entry screen
 */
export function drawNameEntry() {
    // Semi-transparent overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Title
    ctx.fillStyle = '#e8b84d';
    ctx.font = 'bold 42px Arvo, Rockwell, Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('NEW HIGH SCORE!', centerX, centerY - 120);

    // Score
    ctx.fillStyle = '#f5a3b5';
    ctx.font = 'bold 32px Arvo, Rockwell, Georgia, serif';
    ctx.fillText('Score: ' + gameState.score, centerX, centerY - 70);

    // Enter name prompt
    ctx.fillStyle = '#fef9f0';
    ctx.font = '22px Arvo, Rockwell, Georgia, serif';
    ctx.fillText('Enter your initials:', centerX, centerY - 25);

    // Draw letter boxes
    const startX = centerX - (CHAR_SPACING * 1.5);

    for (let i = 0; i < 3; i++) {
        const boxX = startX + (i * CHAR_SPACING);
        const boxY = centerY + 40;
        const isSelected = gameState.nameEntryCursor === i;

        // Box background
        ctx.fillStyle = isSelected ? '#e8b84d' : 'rgba(254, 249, 240, 0.9)';
        ctx.fillRect(boxX - CHAR_WIDTH/2, boxY - 25, CHAR_WIDTH, 50);

        // Box border
        ctx.strokeStyle = isSelected ? '#d44e3a' : '#888';
        ctx.lineWidth = isSelected ? 4 : 2;
        ctx.strokeRect(boxX - CHAR_WIDTH/2, boxY - 25, CHAR_WIDTH, 50);

        // Letter
        ctx.fillStyle = '#3a2a1a';
        ctx.font = 'bold 36px Arvo, Rockwell, Georgia, serif';
        ctx.textAlign = 'center';
        ctx.fillText(gameState.nameEntryChars[i], boxX, boxY + 12);

        // Up/down arrows for selected position
        if (isSelected) {
            ctx.fillStyle = '#d44e3a';
            ctx.font = '20px sans-serif';
            ctx.fillText('\u25B2', boxX, boxY - 35); // Up triangle
            ctx.fillText('\u25BC', boxX, boxY + 45); // Down triangle
        }
    }

    // Draw ENTER button (moved right with more spacing)
    const endX = startX + (3 * CHAR_SPACING) + 20;
    const endY = centerY + 40;
    const isEndSelected = gameState.nameEntryCursor === 3;

    // ENTER box background
    ctx.fillStyle = isEndSelected ? '#4CAF50' : 'rgba(254, 249, 240, 0.9)';
    ctx.fillRect(endX - 45, endY - 25, 90, 50);

    // ENTER box border
    ctx.strokeStyle = isEndSelected ? '#2E7D32' : '#888';
    ctx.lineWidth = isEndSelected ? 4 : 2;
    ctx.strokeRect(endX - 45, endY - 25, 90, 50);

    // ENTER text
    ctx.fillStyle = isEndSelected ? '#fff' : '#3a2a1a';
    ctx.font = 'bold 22px Arvo, Rockwell, Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('ENTER', endX, endY + 10);

    // Instructions
    ctx.fillStyle = '#f5d5c8';
    ctx.font = '16px Arvo, Rockwell, Georgia, serif';
    ctx.fillText('\u2190 \u2192 Move   \u2191 \u2193 Change Letter   Button: Select', centerX, centerY + 130);
}
