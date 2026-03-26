/* ============================================
   LOCAL LEADERBOARD
   localStorage-based leaderboard for kiosk mode
   ============================================ */

const STORAGE_KEY = 'crumbs_leaderboard';
const MAX_SCORES = 10;

// ============================================
// LEADERBOARD FUNCTIONS
// ============================================

/**
 * Load leaderboard from localStorage
 * @returns {Array} Array of {name: string, score: number, timestamp: number}
 */
export function loadLeaderboard() {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch (e) {
        console.error('Error loading leaderboard:', e);
        return [];
    }
}

/**
 * Save a new score to the leaderboard
 * @param {string} name - Player name (3 letters)
 * @param {number} score - Score value
 * @returns {Array} Updated leaderboard array
 */
export function saveScore(name, score) {
    const scores = loadLeaderboard();

    // Add new score
    scores.push({
        name: name.toUpperCase().substring(0, 3),
        score: score,
        timestamp: Date.now()
    });

    // Sort by score descending
    scores.sort((a, b) => b.score - a.score);

    // Keep only top 10
    scores.splice(MAX_SCORES);

    // Save to localStorage
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(scores));
    } catch (e) {
        console.error('Error saving leaderboard:', e);
    }

    return scores;
}

/**
 * Check if a score qualifies for top 10
 * @param {number} score - Score to check
 * @returns {boolean} True if score makes top 10
 */
export function isTopTen(score) {
    // Zero scores don't qualify
    if (score <= 0) {
        return false;
    }

    const scores = loadLeaderboard();

    // Always qualifies if less than 10 scores
    if (scores.length < MAX_SCORES) {
        return true;
    }

    // Check if score beats the lowest top 10 score
    return score > scores[scores.length - 1].score;
}

/**
 * Clear the leaderboard (for testing)
 */
export function clearLeaderboard() {
    localStorage.removeItem(STORAGE_KEY);
}
