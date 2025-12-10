/* ============================================
   LEADERBOARD PAGE
   Display top scores with real-time Firebase updates
   ============================================ */

import { TROPHY_IMAGE } from './shared/config.js';
import { database } from './shared/firebase.js';

// ============================================
// IMAGE LOADING
// ============================================

// Load trophy image if provided
if (TROPHY_IMAGE) {
    const trophyImg = new Image();
    trophyImg.src = TROPHY_IMAGE;
    trophyImg.onload = function() {
        document.getElementById('trophyContainer').innerHTML = '<img src="' + TROPHY_IMAGE + '" alt="Trophy">';
    };
}

// ============================================
// LEADERBOARD FUNCTIONS
// ============================================

/**
 * Load and display leaderboard
 */
function loadLeaderboard() {
    if (!database) {
        document.getElementById('leaderboardList').innerHTML = '<div class="no-scores">Database unavailable</div>';
        return;
    }

    database.ref('scores').orderByChild('score').limitToLast(10).on('value', (snapshot) => {
        const scores = [];
        snapshot.forEach((childSnapshot) => {
            scores.push({
                id: childSnapshot.key,
                ...childSnapshot.val()
            });
        });

        // Reverse to show highest first
        scores.reverse();

        displayLeaderboard(scores);
        updateTimestamp();
    });
}

/**
 * Display leaderboard in UI
 * @param {Array} scores - Array of score objects
 */
function displayLeaderboard(scores) {
    const listElement = document.getElementById('leaderboardList');

    if (scores.length === 0) {
        listElement.innerHTML = '<div class="no-scores">No scores yet!<br>Be the first to play!</div>';
        return;
    }

    let html = '';
    scores.forEach((entry, index) => {
        const rank = index + 1;
        const rankClass = rank <= 3 ? `rank-${rank}` : '';
        const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '';

        html += `
            <div class="score-entry ${rankClass}">
                <div class="rank">${medal || rank + '.'}</div>
                <div class="name">${escapeHtml(entry.name)}</div>
                <div class="score">${entry.score}</div>
            </div>
        `;
    });

    listElement.innerHTML = html;
}

/**
 * Escape HTML to prevent XSS
 * @param {string} text - Text to escape
 * @returns {string}
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Update timestamp
 */
function updateTimestamp() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString();
    document.getElementById('lastUpdated').textContent = `Last updated: ${timeStr}`;
}

// ============================================
// INITIALIZATION
// ============================================

// Check if Firebase is configured
const isFirebaseConfigured = database !== null;

if (isFirebaseConfigured) {
    loadLeaderboard();
} else {
    document.getElementById('leaderboardList').innerHTML = '<div class="no-scores">Firebase not configured.<br>See setup guide.</div>';
}
