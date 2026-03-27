/* ============================================
   AUDIO ENGINE
   Web Audio API — procedural 8-bit sound
   Crumb's Bouquet Rescue
   ============================================ */

// ============================================
// STATE
// ============================================

let ctx = null;
let masterGain = null;
let isMuted = false;
let lastChompTime = -1;
let bgm = null;

// ============================================
// AUDIO CONTEXT INIT (lazy — call on gesture)
// ============================================

export function initAudio() {
    if (ctx) {
        if (ctx.state === 'suspended') ctx.resume();
        return;
    }
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = ctx.createGain();
    masterGain.gain.value = 0.4;
    masterGain.connect(ctx.destination);
}

// ============================================
// MUTE
// ============================================

export function toggleMute() {
    isMuted = !isMuted;
    if (masterGain) {
        masterGain.gain.value = isMuted ? 0 : 0.4;
    }
    if (bgm) {
        bgm.volume = isMuted ? 0 : 0.5;
    }
    return isMuted;
}

export function getMuted() {
    return isMuted;
}

// ============================================
// BGM (user-supplied audio file)
// ============================================

export function startMusic() {
    if (!bgm) {
        bgm = new Audio('assets/CrumbSong_Loop.ogg');
        bgm.loop = true;
        bgm.volume = isMuted ? 0 : 0.5;
    }
    bgm.currentTime = 0;
    bgm.play().catch(() => {});
}

export function stopMusic() {
    if (bgm) {
        bgm.pause();
        bgm.currentTime = 0;
    }
}

// ============================================
// SFX HELPER
// ============================================

function makeOsc(type, freq, gainVal, startTime, duration) {
    if (!ctx || !masterGain) return;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    g.gain.setValueAtTime(0.001, startTime);
    g.gain.linearRampToValueAtTime(gainVal, startTime + 0.01);
    g.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
    osc.connect(g);
    g.connect(masterGain);
    osc.start(startTime);
    osc.stop(startTime + duration + 0.05);
}

// ============================================
// SOUND EFFECTS
// ============================================

// C major 9th chord built note by note with each combo level
const COMBO_CHORD = [
    523.25,  // 1: C5  (root)
    659.25,  // 2: E5  (major third)
    783.99,  // 3: G5  (fifth)
    987.77,  // 4: B5  (major seventh)
    1174.66, // 5: D6  (ninth)
    1318.51, // 6: E6  (tenth / octave third)
];

/** Bounce — each combo level adds a new note to build a chord (up to 6) */
export function playBounce(comboStreak) {
    initAudio();
    if (isMuted || !ctx) return;
    const t = ctx.currentTime;
    const count = Math.min(comboStreak || 1, COMBO_CHORD.length);
    const gainPerNote = 0.20 / count; // keep total volume consistent
    for (let i = 0; i < count; i++) {
        makeOsc('square', COMBO_CHORD[i], gainPerNote, t, 0.10);
    }
}

/** Finch/bird bonus — 3-note ascending chirp arpeggio */
export function playFinchHit() {
    initAudio();
    if (isMuted || !ctx) return;
    const notes = [659.25, 783.99, 1046.50]; // E5 G5 C6
    const t = ctx.currentTime;
    notes.forEach((freq, i) => {
        makeOsc('sine', freq, 0.25, t + i * 0.06, 0.12);
    });
}

/** Cricket chomp — soft low sawtooth + gentle noise, debounced */
export function playChomp() {
    initAudio();
    if (isMuted || !ctx) return;
    const now = ctx.currentTime;
    if (now - lastChompTime < 0.08) return;
    lastChompTime = now;

    // Low sawtooth with slow attack and long decay — less punchy
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(150, now + 0.25);
    g.gain.setValueAtTime(0.001, now);
    g.gain.linearRampToValueAtTime(0.02, now + 0.04);  // slow attack
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.30);
    osc.connect(g);
    g.connect(masterGain);
    osc.start(now);
    osc.stop(now + 0.32);

    // Soft noise layer — low gain, slow fade in
    const bufferSize = ctx.sampleRate * 0.25;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.001, now);
    noiseGain.gain.linearRampToValueAtTime(0.08, now + 0.04);  // slow attack, lower ceiling
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    noise.connect(noiseGain);
    noiseGain.connect(masterGain);
    noise.start(now);
    noise.stop(now + 0.25);
}

/** Countdown beep — 3→220Hz, 2→440Hz, 1→880Hz */
export function playCountdownBeep(number) {
    initAudio();
    if (isMuted || !ctx) return;
    const pitches = { 3: 220, 2: 440, 1: 880 };
    const freq = pitches[number] || 440;
    const t = ctx.currentTime;
    makeOsc('square', freq, 0.22, t, 0.24);
    makeOsc('square', freq * 1.003, 0.08, t, 0.24); // slight chorus
}

/** Game over — descending 5-note jingle with pitch droop */
export function playGameOver() {
    initAudio();
    if (isMuted || !ctx) return;
    const notes = [392.00, 349.23, 329.63, 293.66, 261.63]; // G4 F4 E4 D4 C4
    const t = ctx.currentTime;
    notes.forEach((freq, i) => {
        makeOsc('sawtooth', freq, 0.18, t + i * 0.20, i === 4 ? 0.5 : 0.15);
    });
    // Extra pitch droop on final note
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(261.63, t + 0.80);
    osc.frequency.exponentialRampToValueAtTime(130, t + 1.30);
    g.gain.setValueAtTime(0.001, t + 0.80);
    g.gain.linearRampToValueAtTime(0.15, t + 0.82);
    g.gain.exponentialRampToValueAtTime(0.001, t + 1.30);
    osc.connect(g);
    g.connect(masterGain);
    osc.start(t + 0.80);
    osc.stop(t + 1.35);
}

/** Name entry letter scroll blip */
export function playMenuBlip() {
    initAudio();
    if (isMuted || !ctx) return;
    makeOsc('square', 783.99, 0.15, ctx.currentTime, 0.04);
}

/** Name entry cursor move (softer, different pitch) */
export function playCursorMove() {
    initAudio();
    if (isMuted || !ctx) return;
    makeOsc('square', 659.25, 0.12, ctx.currentTime, 0.04);
}

/** Name entry confirm — chord + shimmer */
export function playConfirm() {
    initAudio();
    if (isMuted || !ctx) return;
    const t = ctx.currentTime;
    makeOsc('triangle', 523.25, 0.18, t, 0.30);        // C5
    makeOsc('triangle', 659.25, 0.18, t, 0.30);        // E5
    makeOsc('sine', 1046.50, 0.10, t + 0.05, 0.25);    // C6 shimmer
}

// ============================================
// MUTE INDICATOR
// ============================================

/** Draw small red dot in top-left corner when muted */
export function drawMuteIndicator(ctx2d) {
    if (!isMuted) return;
    ctx2d.save();
    ctx2d.beginPath();
    ctx2d.arc(16, 16, 8, 0, Math.PI * 2);
    ctx2d.fillStyle = '#e03030';
    ctx2d.fill();
    ctx2d.restore();
}
