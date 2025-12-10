/* ============================================
   GAME PHYSICS & LOGIC
   Collision detection, update loop, spawning
   ============================================ */

import { gameState, inputState, flowerSpawnInterval, saveHighScore } from './state.js';
import {
    player,
    flowers,
    eaters,
    particles,
    clouds,
    incrementFlowerTypeCounter
} from './entities.js';
import { canvas } from './renderer.js';
import { FLOWER_COLORS, FINCH_COLOR } from '../shared/config.js';
import { database, isTopTen, submitScore } from '../shared/firebase.js';

// ============================================
// CLOUD PHYSICS
// ============================================

/**
 * Update cloud positions with parallax scrolling
 */
export function updateClouds() {
    clouds.forEach(cloud => {
        cloud.x += cloud.speed;
        if (cloud.x - cloud.width/2 > canvas.width) {
            cloud.x = -cloud.width/2;
            cloud.y = Math.random() * (canvas.height * 0.4);
        }
    });
}

// ============================================
// COLLISION DETECTION
// ============================================

/**
 * Check collision between player and flower
 * @param {Object} flower - Flower object to check
 * @returns {boolean}
 */
export function checkCollision(flower) {
    const playerBottom = player.y + player.height/2;
    const flowerTop = flower.y - flower.height/2;

    // Wider hitbox - add 10px padding on each side
    const hitboxPadding = 10;

    // Check if player is moving downward and overlapping with flower
    if (player.velocityY > 0 &&
        playerBottom >= flowerTop &&
        playerBottom <= flowerTop + 20 &&
        player.x > flower.x - flower.width/2 - hitboxPadding &&
        player.x < flower.x + flower.width/2 + hitboxPadding) {
        return true;
    }
    return false;
}

// ============================================
// SPAWNING FUNCTIONS
// ============================================

/**
 * Spawn a new flower (or finch!)
 */
export function spawnFlower() {
    // 1 in 50 chance to spawn a finch instead
    const isFinch = Math.random() < 0.02;

    // Progressive difficulty - flowers rise faster as score increases
    const baseRiseSpeed = 2;
    const speedIncrease = Math.floor(gameState.score / 20) * 0.3; // +0.3 speed every 20 points
    const riseSpeed = Math.min(baseRiseSpeed + speedIncrease, 4); // Cap at 4

    const flower = {
        x: Math.random() * (canvas.width - 80) + 40,
        y: canvas.height,
        width: isFinch ? 60 : 50,  // Finches are wider
        height: isFinch ? 50 : 50,
        riseSpeed: riseSpeed,
        bounced: false,
        type: isFinch ? 'finch' : Math.floor(Math.random() * 4), // Random flower type 0-3
        isFinch: isFinch
    };
    flowers.push(flower);
}

/**
 * Spawn particles on flower bounce
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {string} color - Particle color
 */
export function spawnParticles(x, y, color) {
    const particleCount = 8;
    for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 * i) / particleCount;
        const speed = 2 + Math.random() * 2;
        particles.push({
            x: x,
            y: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 2, // Slight upward bias
            size: 3 + Math.random() * 3,
            color: color,
            life: 1.0, // 1.0 = fully visible, 0.0 = gone
            decay: 0.015 + Math.random() * 0.01
        });
    }
}

// ============================================
// MAIN UPDATE LOOP
// ============================================

/**
 * Update game state (main game loop logic)
 * @param {number} deltaTime - Time delta for frame-rate independent updates
 */
export function update(deltaTime = 1) {
    // Handle countdown
    if (gameState.countdown > 0) {
        gameState.countdownTimer += deltaTime;
        if (gameState.countdownTimer >= 60) { // 60 frames = 1 second
            gameState.countdown--;
            gameState.countdownTimer = 0;
            if (gameState.countdown === 0) {
                gameState.gameActive = true; // Start game after countdown
            }
        }
        return; // Don't update game during countdown
    }

    // Handle game over sequence (BEFORE checking gameActive)
    if (gameState.gameOverPhase === 'eating') {
        gameState.gameOverTimer += deltaTime;

        // Check if there's a current flower being eaten
        if (!gameState.currentEatingFlower && flowers.length > 0) {
            // Find topmost flower (lowest y value)
            let topFlower = flowers[0];
            let topIndex = 0;
            for (let i = 1; i < flowers.length; i++) {
                if (flowers[i].y < topFlower.y) {
                    topFlower = flowers[i];
                    topIndex = i;
                }
            }

            // Convert this flower to an eater animation
            gameState.currentEatingFlower = {
                x: topFlower.x,
                y: topFlower.y,
                width: 60,
                height: 60,
                animationFrame: 0,
                phase: 'chomp1_open'
            };

            // Remove the flower
            flowers.splice(topIndex, 1);
        }

        // Update current eating animation
        if (gameState.currentEatingFlower) {
            gameState.currentEatingFlower.animationFrame += deltaTime;
            const chompDuration = 6;

            if (gameState.currentEatingFlower.phase === 'chomp1_open') {
                if (gameState.currentEatingFlower.animationFrame >= chompDuration) {
                    gameState.currentEatingFlower.phase = 'chomp1_close';
                    gameState.currentEatingFlower.animationFrame = 0;
                }
            } else if (gameState.currentEatingFlower.phase === 'chomp1_close') {
                if (gameState.currentEatingFlower.animationFrame >= chompDuration) {
                    gameState.currentEatingFlower.phase = 'chomp2_open';
                    gameState.currentEatingFlower.animationFrame = 0;
                }
            } else if (gameState.currentEatingFlower.phase === 'chomp2_open') {
                if (gameState.currentEatingFlower.animationFrame >= chompDuration) {
                    gameState.currentEatingFlower.phase = 'chomp2_close';
                    gameState.currentEatingFlower.animationFrame = 0;
                }
            } else if (gameState.currentEatingFlower.phase === 'chomp2_close') {
                if (gameState.currentEatingFlower.animationFrame >= chompDuration) {
                    // Done with this flower
                    gameState.currentEatingFlower = null;
                }
            }
        }

        // When all flowers eaten, move to scolding
        if (flowers.length === 0 && !gameState.currentEatingFlower) {
            gameState.gameOverPhase = 'scolding';
            gameState.gameOverTimer = 0;
        }
        return; // Don't process normal game logic
    } else if (gameState.gameOverPhase === 'scolding') {
        gameState.gameOverTimer += deltaTime;

        // Show scolding for 90 frames (1.5 seconds)
        if (gameState.gameOverTimer >= 90) {
            // Check if we should show name entry for top 10
            if (gameState.isTopTenScore && database) {
                gameState.gameOverPhase = 'nameentry';
                gameState.showNameEntry = true;
                gameState.gameOverTimer = 0;

                // On mobile, use prompt dialog instead of keyboard input
                if ('ontouchstart' in window) {
                    setTimeout(() => {
                        const name = prompt('TOP 10 SCORE!\n\nEnter your name:\n(or leave blank to skip)');
                        // Handle both Cancel (null) and empty string as skip
                        if (name !== null && name.trim().length > 0) {
                            submitScore(name, gameState.score,
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
                            // Skip name entry
                            gameState.showNameEntry = false;
                            gameState.playerName = '';
                            gameState.gameOverPhase = 'gameover';
                        }
                    }, 100);
                }
            } else {
                gameState.gameOverPhase = 'gameover';
                gameState.gameOverTimer = 0;
            }
        }
        return; // Don't process normal game logic
    } else if (gameState.gameOverPhase === 'nameentry') {
        // Wait for player to enter name
        return; // Don't process normal game logic
    }

    if (!gameState.gameActive) return;

    // Update player horizontal movement
    if (inputState.keys['ArrowLeft'] || inputState.keys['a'] || inputState.keys['A'] || inputState.leftButtonPressed) {
        player.velocityX = -player.moveSpeed;
    } else if (inputState.keys['ArrowRight'] || inputState.keys['d'] || inputState.keys['D'] || inputState.rightButtonPressed) {
        player.velocityX = player.moveSpeed;
    } else if (inputState.isTouching) {
        const touchDelta = inputState.touchCurrentX - inputState.touchStartX;
        player.velocityX = touchDelta * 0.2;
    } else {
        player.velocityX *= Math.pow(0.85, deltaTime); // Friction with delta time
    }

    player.x += player.velocityX * deltaTime;

    // Keep player in bounds
    if (player.x < player.width/2) {
        player.x = player.width/2;
        player.velocityX = 0;
    }
    if (player.x > canvas.width - player.width/2) {
        player.x = canvas.width - player.width/2;
        player.velocityX = 0;
    }

    // Apply gravity (dynamic based on height)
    if (player.y < 50) {
        // Floaty zone - reduced gravity for more air control
        player.velocityY += player.gravity * 0.5 * deltaTime;
    } else {
        // Normal zone - standard gravity
        player.velocityY += player.gravity * deltaTime;
    }

    player.y += player.velocityY * deltaTime;

    // Soft ceiling - prevent going above y=50
    if (player.y < 50) {
        player.y = 50;
        // Absorb excess upward velocity
        if (player.velocityY < 0) {
            player.velocityY = 0;
        }
    }

    // Update clouds
    updateClouds();

    // Spawn flowers continuously (faster as score increases)
    gameState.flowerSpawnTimer += deltaTime;
    const baseSpawnInterval = 60;
    const spawnSpeedUp = Math.floor(gameState.score / 30) * 5; // -5 frames every 30 points
    const currentSpawnInterval = Math.max(baseSpawnInterval - spawnSpeedUp, 35); // Min 35 frames

    if (gameState.flowerSpawnTimer >= currentSpawnInterval) {
        spawnFlower();
        gameState.flowerSpawnTimer = 0;
    }

    // Update flowers
    for (let i = flowers.length - 1; i >= 0; i--) {
        const flower = flowers[i];

        // Don't update flowers during game over sequence
        if (gameState.gameOverPhase === 'eating' || gameState.gameOverPhase === 'scolding') {
            continue;
        }

        // Move flower up
        if (!flower.bounced) {
            flower.y -= flower.riseSpeed * deltaTime;
        }

        // Check collision
        if (!flower.bounced && checkCollision(flower)) {
            player.velocityY = player.bounceStrength;
            flower.bounced = true;

            // Check if same color as last bounce (only for regular flowers)
            if (!flower.isFinch) {
                // Regular flower - check combo
                if (flower.type === gameState.lastFlowerColor) {
                    gameState.comboStreak++; // Increase streak
                } else {
                    gameState.comboStreak = 1; // Reset to 1 (first of this color)
                }
                // Update last color (only for regular flowers, not birds)
                gameState.lastFlowerColor = flower.type;
            }
            // If it's a finch, don't update lastFlowerColor or comboStreak

            // Calculate points based on streak
            const pointsAwarded = flower.isFinch ? 10 : gameState.comboStreak;
            gameState.score += pointsAwarded;
            document.getElementById('score').textContent = 'Score: ' + gameState.score;

            // Spawn particles based on flower type
            const particleColor = flower.isFinch ? FINCH_COLOR : FLOWER_COLORS[flower.type];
            spawnParticles(flower.x, flower.y, particleColor);

            // Show bonus text
            if (flower.isFinch) {
                gameState.bonusText = {
                    text: 'Bird! +10!',
                    x: flower.x,
                    y: flower.y - 30,
                    timer: 0
                };
            } else if (gameState.comboStreak > 1) {
                // Show combo bonus for streaks
                gameState.bonusText = {
                    text: '+' + gameState.comboStreak + '!',
                    x: flower.x,
                    y: flower.y - 30,
                    timer: 0
                };
            }

            // Update high score if needed
            if (gameState.score > gameState.highScore) {
                saveHighScore(gameState.score);
                document.getElementById('highScore').textContent = 'High Score: ' + gameState.highScore;
            }
        }

        // Spawn eater if flower reaches top without being bounced
        if (!flower.bounced && !flower.eaterSpawned && flower.y < 50) {
            // Spawn an eater at the top to "eat" this flower
            const eater = {
                x: flower.x,
                y: -50,
                targetY: 20, // Stop at y=20
                width: 60,
                height: 60,
                speed: 3,
                animationFrame: 0,
                phase: 'descending',
                isGameOverEater: false
            };
            eaters.push(eater);
            flower.eaterSpawned = true; // Mark so we don't spawn multiple eaters
        }

        // Remove flowers that were bounced or went way off screen
        if (flower.bounced || flower.y < -100) {
            flowers.splice(i, 1);
        }
    }

    // Update eaters
    for (let i = eaters.length - 1; i >= 0; i--) {
        const eater = eaters[i];
        eater.animationFrame += deltaTime;

        // Use faster animation for game over eaters
        const chompDuration = eater.isGameOverEater ? 6 : 10;

        if (eater.phase === 'descending') {
            // Move eater down toward target
            eater.y += eater.speed * deltaTime;

            // When reaching target, start chomping animation
            if (eater.y >= eater.targetY) {
                eater.phase = 'chomp1_open';
                eater.animationFrame = 0;
            }
        } else if (eater.phase === 'chomp1_open') {
            if (eater.animationFrame >= chompDuration) {
                eater.phase = 'chomp1_close';
                eater.animationFrame = 0;
            }
        } else if (eater.phase === 'chomp1_close') {
            if (eater.animationFrame >= chompDuration) {
                eater.phase = 'chomp2_open';
                eater.animationFrame = 0;
            }
        } else if (eater.phase === 'chomp2_open') {
            if (eater.animationFrame >= chompDuration) {
                eater.phase = 'chomp2_close';
                eater.animationFrame = 0;
            }
        } else if (eater.phase === 'chomp2_close') {
            if (eater.animationFrame >= chompDuration) {
                eater.phase = 'leaving';
                eater.animationFrame = 0;
            }
        } else if (eater.phase === 'leaving') {
            // Slide back up
            eater.y -= 5 * deltaTime;

            // Remove when off screen
            if (eater.y < -eater.height - 20) {
                eaters.splice(i, 1);
            }
        }
    }

    // Game over if player falls off bottom
    if (player.y > canvas.height + player.height) {
        // Game over will be triggered from game.js
        return 'gameover';
    }

    // Update bonus text timer
    if (gameState.bonusText) {
        gameState.bonusText.timer += deltaTime;
        gameState.bonusText.y -= 1 * deltaTime; // Float upward
        if (gameState.bonusText.timer >= 60) { // Show for 1 second
            gameState.bonusText = null;
        }
    }

    // Update particles
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx * deltaTime;
        p.y += p.vy * deltaTime;
        p.vy += 0.1 * deltaTime; // Gravity
        p.life -= p.decay * deltaTime;

        if (p.life <= 0) {
            particles.splice(i, 1);
        }
    }
}
