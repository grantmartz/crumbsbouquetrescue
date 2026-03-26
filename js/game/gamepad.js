/* ============================================
   GAMEPAD INPUT HANDLER
   USB Joystick support for kiosk mode
   ============================================ */

import { inputState } from './state.js';

// ============================================
// JOYSTICK CONFIGURATION
// User-provided mapping:
// Axis 0 (vertical):   +1 = Up,    -1 = Down
// Axis 1 (horizontal): -1 = Left,  +1 = Right
// Button 0: Action button
// ============================================

const AXIS_VERTICAL = 0;
const AXIS_HORIZONTAL = 1;
const BUTTON_ACTION = 0;
const DEAD_ZONE = 0.3;

// Input repeat timing for name entry
let lastUpTime = 0;
let lastDownTime = 0;
let lastLeftTime = 0;
let lastRightTime = 0;
const INPUT_REPEAT_DELAY = 200; // ms before first repeat
const INPUT_REPEAT_RATE = 100;  // ms between repeats

// ============================================
// CONNECTION HANDLING
// ============================================

/**
 * Initialize gamepad event listeners
 */
export function initGamepad() {
    window.addEventListener('gamepadconnected', (e) => {
        console.log(`Gamepad connected: ${e.gamepad.id} at index ${e.gamepad.index}`);
        inputState.gamepadIndex = e.gamepad.index;
    });

    window.addEventListener('gamepaddisconnected', (e) => {
        console.log(`Gamepad disconnected: ${e.gamepad.id}`);
        if (inputState.gamepadIndex === e.gamepad.index) {
            inputState.gamepadIndex = null;
            resetInputState();
        }
    });
}

/**
 * Reset all input state
 */
function resetInputState() {
    inputState.leftPressed = false;
    inputState.rightPressed = false;
    inputState.upPressed = false;
    inputState.downPressed = false;
    inputState.buttonPressed = false;
}

// ============================================
// POLLING FUNCTION
// ============================================

/**
 * Poll gamepad state - call once per frame
 * Updates inputState with current button/axis values
 */
export function pollGamepad() {
    // Store previous button state for edge detection
    inputState.previousButtonPressed = inputState.buttonPressed;

    // Reset state
    resetInputState();

    const gamepads = navigator.getGamepads();
    if (!gamepads) return;

    // Find connected gamepad
    let gamepad = null;
    if (inputState.gamepadIndex !== null) {
        gamepad = gamepads[inputState.gamepadIndex];
    }

    // Fallback: find any connected gamepad
    if (!gamepad) {
        for (const gp of gamepads) {
            if (gp) {
                gamepad = gp;
                inputState.gamepadIndex = gp.index;
                break;
            }
        }
    }

    if (!gamepad) return;

    // Read horizontal axis (axis 1: -1 = left, +1 = right)
    const horizontalAxis = gamepad.axes[AXIS_HORIZONTAL] || 0;
    if (horizontalAxis < -DEAD_ZONE) {
        inputState.leftPressed = true;
    } else if (horizontalAxis > DEAD_ZONE) {
        inputState.rightPressed = true;
    }

    // Read vertical axis (axis 0: +1 = up, -1 = down)
    const verticalAxis = gamepad.axes[AXIS_VERTICAL] || 0;
    if (verticalAxis > DEAD_ZONE) {
        inputState.upPressed = true;
    } else if (verticalAxis < -DEAD_ZONE) {
        inputState.downPressed = true;
    }

    // Read action button (button 0)
    if (gamepad.buttons[BUTTON_ACTION]?.pressed) {
        inputState.buttonPressed = true;
    }
}

/**
 * Check if action button was just pressed this frame (rising edge)
 * @returns {boolean}
 */
export function isButtonJustPressed() {
    return inputState.buttonPressed && !inputState.previousButtonPressed;
}

// ============================================
// REPEAT INPUT HELPERS (for name entry)
// ============================================

/**
 * Check if up input should trigger (with repeat)
 * @returns {boolean}
 */
export function shouldTriggerUp() {
    const now = performance.now();
    if (inputState.upPressed) {
        if (lastUpTime === 0) {
            lastUpTime = now;
            return true;
        } else if (now - lastUpTime > INPUT_REPEAT_DELAY) {
            if ((now - lastUpTime - INPUT_REPEAT_DELAY) % INPUT_REPEAT_RATE < 16) {
                return true;
            }
        }
    } else {
        lastUpTime = 0;
    }
    return false;
}

/**
 * Check if down input should trigger (with repeat)
 * @returns {boolean}
 */
export function shouldTriggerDown() {
    const now = performance.now();
    if (inputState.downPressed) {
        if (lastDownTime === 0) {
            lastDownTime = now;
            return true;
        } else if (now - lastDownTime > INPUT_REPEAT_DELAY) {
            if ((now - lastDownTime - INPUT_REPEAT_DELAY) % INPUT_REPEAT_RATE < 16) {
                return true;
            }
        }
    } else {
        lastDownTime = 0;
    }
    return false;
}

/**
 * Check if left input should trigger (with repeat, for name entry cursor)
 * @returns {boolean}
 */
export function shouldTriggerLeft() {
    const now = performance.now();
    if (inputState.leftPressed) {
        if (lastLeftTime === 0) {
            lastLeftTime = now;
            return true;
        } else if (now - lastLeftTime > INPUT_REPEAT_DELAY) {
            if ((now - lastLeftTime - INPUT_REPEAT_DELAY) % INPUT_REPEAT_RATE < 16) {
                return true;
            }
        }
    } else {
        lastLeftTime = 0;
    }
    return false;
}

/**
 * Check if right input should trigger (with repeat, for name entry cursor)
 * @returns {boolean}
 */
export function shouldTriggerRight() {
    const now = performance.now();
    if (inputState.rightPressed) {
        if (lastRightTime === 0) {
            lastRightTime = now;
            return true;
        } else if (now - lastRightTime > INPUT_REPEAT_DELAY) {
            if ((now - lastRightTime - INPUT_REPEAT_DELAY) % INPUT_REPEAT_RATE < 16) {
                return true;
            }
        }
    } else {
        lastRightTime = 0;
    }
    return false;
}
