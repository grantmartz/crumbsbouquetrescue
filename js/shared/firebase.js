/* ============================================
   FIREBASE SERVICE
   Handles Firebase initialization and leaderboard operations
   ============================================ */

import { FIREBASE_CONFIG } from './config.js';

// ============================================
// FIREBASE INITIALIZATION
// ============================================

let database = null;
const isFirebaseConfigured = FIREBASE_CONFIG.apiKey !== "YOUR_API_KEY_HERE";

if (isFirebaseConfigured) {
    firebase.initializeApp(FIREBASE_CONFIG);
    database = firebase.database();
    console.log("Firebase initialized successfully");
} else {
    console.log("Firebase not configured - using localStorage only");
}

export { database };

// Internal cache of top scores
let topScoresCache = [];

// ============================================
// LEADERBOARD FUNCTIONS
// ============================================

/**
 * Load top scores from Firebase
 * @param {Function} callback - Called with scores array when loaded
 */
export function loadLeaderboard(callback) {
    if (!database) {
        console.log("Firebase not available, skipping leaderboard load");
        if (callback) callback([]);
        return;
    }

    database.ref('scores').orderByChild('score').limitToLast(10).on('value', (snapshot) => {
        topScoresCache = [];
        snapshot.forEach((childSnapshot) => {
            topScoresCache.push({
                id: childSnapshot.key,
                ...childSnapshot.val()
            });
        });
        // Reverse to show highest first
        topScoresCache.reverse();
        console.log("Leaderboard loaded:", topScoresCache);

        if (callback) {
            callback(topScoresCache);
        }
    });
}

/**
 * Check if score makes top 10
 * @param {number} currentScore - Score to check
 * @param {Array} topScores - Current top scores array
 * @returns {boolean}
 */
export function isTopTen(currentScore, topScores = topScoresCache) {
    if (!database) return false;
    if (topScores.length < 10) return true;
    return currentScore > topScores[topScores.length - 1].score;
}

/**
 * Sanitize a name for storage to prevent duplicate entries via spacing tricks
 * - Trims leading/trailing whitespace
 * - Collapses multiple consecutive spaces into single space
 * - Only allows alphanumeric and single spaces
 * - Limits to 15 characters
 * @param {string} name - Name to sanitize
 * @returns {string}
 */
export function sanitizeName(name) {
    return name
        .trim()                           // Remove leading/trailing spaces
        .replace(/\s+/g, ' ')             // Collapse multiple spaces to single space
        .replace(/[^a-zA-Z0-9 ]/g, '')    // Remove non-alphanumeric except spaces
        .slice(0, 15);                    // Limit to 15 characters
}

/**
 * Normalize name for comparison (remove spaces, punctuation, lowercase)
 * @param {string} name - Name to normalize
 * @returns {string}
 */
export function normalizeName(name) {
    return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Submit score to Firebase
 * @param {string} name - Player name
 * @param {number} scoreValue - Score value
 * @param {Function} onSuccess - Called when submission succeeds
 * @param {Function} onError - Called when submission fails
 */
export function submitScore(name, scoreValue, onSuccess, onError) {
    if (!database) {
        console.log("Firebase not available, score not submitted");
        if (onError) onError(new Error("Firebase not available"));
        return;
    }

    // Sanitize name to prevent spacing exploits
    const sanitizedName = sanitizeName(name);
    const normalizedNewName = normalizeName(sanitizedName);

    // Check for existing scores with same normalized name
    database.ref('scores').once('value', (snapshot) => {
        let existingScoreId = null;
        let existingScore = null;

        snapshot.forEach((childSnapshot) => {
            const scoreData = childSnapshot.val();
            const normalizedExistingName = normalizeName(scoreData.name);

            // If same person exists
            if (normalizedExistingName === normalizedNewName) {
                // If their old score is lower, mark it for deletion
                if (scoreData.score < scoreValue) {
                    existingScoreId = childSnapshot.key;
                    existingScore = scoreData.score;
                } else {
                    // Their old score is higher, don't submit new one
                    console.log("Existing higher score found, not submitting");
                    if (onError) onError(new Error("Higher score exists"));
                    return;
                }
            }
        });

        // Delete old lower score if found
        if (existingScoreId) {
            database.ref('scores/' + existingScoreId).remove()
                .then(() => {
                    console.log("Removed old lower score:", existingScore);
                });
        }

        // Submit new score
        const newScore = {
            name: sanitizedName,
            score: scoreValue,
            timestamp: Date.now()
        };

        database.ref('scores').push(newScore)
            .then(() => {
                console.log("Score submitted successfully");
                if (onSuccess) onSuccess();
            })
            .catch((error) => {
                console.error("Error submitting score:", error);
                if (onError) onError(error);
            });
    });
}
