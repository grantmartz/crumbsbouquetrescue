# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Crumb's Bouquet Rescue is a wedding-themed HTML5 canvas game built with vanilla JavaScript. The game features a bouncing mechanic where the player (Crumb) saves flowers from being eaten by Cricket, using Firebase Realtime Database for leaderboard functionality.

## Development

This is a static site with no build process. Simply open the HTML files in a browser:

- **Main game**: `index.html`
- **Instructions page**: `instructions.html`
- **Leaderboard page**: `leaderboard.html`

To test locally, use a simple HTTP server:
```bash
python3 -m http.server 8000
# Then open http://localhost:8000
```

## Architecture

### File Structure
- `index.html` - Main game with embedded game logic, styles, and Firebase integration
- `instructions.html` - Standalone instructions page (embeddable via iframe)
- `leaderboard.html` - Standalone leaderboard display (embeddable via iframe)
- `assets/` - Image assets (Crumb_Small.png, Cricket_Small_Left.png, Cricket_Small_Right.png)

### Game Engine (index.html)

The game uses a custom canvas-based game loop running at 60 FPS:

**Core Systems**:
1. **Game Loop** (`gameLoop()`) - Uses `requestAnimationFrame` with delta time calculation to handle frame rate consistency
2. **Physics** - Simple gravity-based physics with bounce mechanics on flower collision
3. **Collision Detection** (`checkCollision()`) - Checks player bottom vs flower top with hitbox padding
4. **Scoring System** - Combo-based scoring (bouncing same color flowers increases streak)
5. **Progressive Difficulty** - Flower spawn rate and rise speed increase with score

**Key Game Objects**:
- `player` - Main character sprite with position, velocity, and physics properties
- `flowers[]` - Array of rising flowers with different types (0-3) and special "finch" type
- `eaters[]` - Enemy sprites that descend to eat missed flowers
- `particles[]` - Visual effects spawned on flower bounce

**Game States**:
- Initial: Shows START button overlay on canvas
- Countdown: 3-2-1 countdown before gameplay
- Active: Main gameplay loop
- Game Over Sequence:
  1. 'eating' phase - Cricket eats remaining flowers with chomp animation
  2. 'scolding' phase - Shows "No, Cricket! Bad!" message
  3. 'nameentry' phase - Top 10 score name entry (desktop keyboard, mobile prompt)
  4. 'gameover' phase - Shows RESTART button overlay

### Firebase Integration

Both `index.html` and `leaderboard.html` share the same Firebase configuration:
- **Database**: Firebase Realtime Database stores top scores at `/scores`
- **Config Location**: Inline in `<script>` section (lines 1572-1580 in index.html, lines 200-208 in leaderboard.html)
- **Leaderboard Logic**:
  - Stores top 10 scores only
  - Prevents duplicate names (normalized comparison, keeps highest score)
  - Real-time updates using Firebase listeners

### Customization Points

The game is designed to be customizable via image URLs at the top of the main script:
- `SPRITE_IMAGE` - Main character sprite
- `FLOWER_IMAGE_1/2/3/4` - Four flower types
- `EATER_MOUTH_OPEN/CLOSED` - Enemy chomping animation frames
- `CLOUD_IMAGE` - Background clouds
- `FINCH_IMAGE` - Special bonus sprite (1 in 50 chance)
- `TREE_SKYLINE_IMAGE` - Bottom edge decoration

When images are `null`, the game renders placeholder shapes using canvas drawing primitives.

### Controls

- **Desktop**: Arrow keys (or A/D) for horizontal movement
- **Mobile**:
  - Touch and drag on canvas for movement
  - On-screen left/right arrow buttons with expanded hitboxes
- **Responsive**: Game container adapts to viewport with max-width constraints

## Common Tasks

### Updating Firebase Configuration
Edit the `firebaseConfig` object in both `index.html` (line ~1572) and `leaderboard.html` (line ~200).

### Changing Game Colors/Theme
Color constants are defined at the top of the game script:
- `SPRITE_COLOR`, `FLOWER_COLORS[]`, `CLOUD_COLOR`, `EATER_COLOR`, `FINCH_COLOR`, `TREE_COLOR`
- CSS colors in `<style>` section (lines 7-152)

### Adjusting Game Difficulty
Key balance variables in `index.html`:
- `player.gravity` (line 294) - Fall speed
- `player.bounceStrength` (line 295) - Bounce height
- `flowerSpawnInterval` (line 367) - Time between flower spawns
- Progressive difficulty calculation (lines 750-753, 972-973)

### Testing Leaderboard Without Firebase
The game falls back to `localStorage` for high scores when Firebase is not configured. Set `firebaseConfig.apiKey` to `"YOUR_API_KEY_HERE"` to disable Firebase.

## Code Organization Notes

- All game logic is self-contained in a single `<script>` tag in index.html (lines 235-1594)
- No external dependencies except Firebase SDK (loaded via CDN)
- Event listeners are attached after game initialization (lines 1378-1558)
- Name sanitization uses `normalizeName()` function to prevent duplicate leaderboard entries with slightly different formatting
