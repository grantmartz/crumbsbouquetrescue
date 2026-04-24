/* ============================================
   AUDIO ENGINE
   Web Audio API — procedural 8-bit sound
   Crumb's Bouquet Rescue
   ============================================ */

import { S as _S } from '../shared/config.js';

// ============================================
// STATE
// ============================================

let ctx = null;
let masterGain = null;
let isMuted = false;
let volume = 0.8; // current unmuted volume level
let lastChompTime = -1;
let bgmSource = null;
let bgmBuffer = null;
let bgmGain = null;
let chompNoiseBuffer = null;

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
    masterGain.gain.value = volume;
    masterGain.connect(ctx.destination);
}

// ============================================
// MUTE
// ============================================

export function toggleMute() {
    isMuted = !isMuted;
    const v = isMuted ? 0 : volume;
    if (masterGain) masterGain.gain.value = v;
    if (bgmGain) bgmGain.gain.value = v;
    return isMuted;
}

export function getMuted() {
    return isMuted;
}

export function adjustVolume(delta) {
    if (!masterGain) return;
    volume = Math.min(1, Math.max(0, volume + delta));
    isMuted = false;
    masterGain.gain.value = volume;
    if (bgmGain) bgmGain.gain.value = volume;
}

// ============================================
// BGM (AudioBuffer — sample-accurate looping)
// ============================================

async function loadBgm() {
    if (bgmBuffer) return;
    try {
        const response = await fetch('assets/CrumbSong_Loop.ogg');
        const arrayBuffer = await response.arrayBuffer();
        bgmBuffer = await ctx.decodeAudioData(arrayBuffer);
    } catch (e) {
        console.warn('BGM load failed:', e);
    }
}

function playBgmBuffer() {
    if (!bgmBuffer || !ctx) return;
    bgmGain = ctx.createGain();
    bgmGain.gain.value = isMuted ? 0 : masterGain.gain.value;
    bgmGain.connect(ctx.destination);

    bgmSource = ctx.createBufferSource();
    bgmSource.buffer = bgmBuffer;
    bgmSource.loop = true;
    bgmSource.connect(bgmGain);
    bgmSource.start(0);
}

export async function startMusic() {
    initAudio();
    stopMusic();
    await loadBgm();
    playBgmBuffer();
}

export function stopMusic() {
    if (bgmSource) {
        try { bgmSource.stop(); } catch (e) {}
        bgmSource = null;
    }
    if (bgmGain) {
        bgmGain.disconnect();
        bgmGain = null;
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

/** Bounce — each combo level plays one more note in a fast arpeggio (up to 6) */
export function playBounce(comboStreak) {
    initAudio();
    if (isMuted || !ctx) return;
    const t = ctx.currentTime;
    const count = Math.min(comboStreak || 1, COMBO_CHORD.length);
    const noteSpacing = 0.045;
    for (let i = 0; i < count; i++) {
        makeOsc('square', COMBO_CHORD[i], 0.20, t + i * noteSpacing, 0.08);
    }
}

/** Finch/bird bonus — bird 1: 1 arpeggio, bird 2: all 3, bird 3-4: all 4, bird 5+: random phrase from curated library */
export function playFinchHit(birdCombo = 1) {
    initAudio();
    if (isMuted || !ctx) return;
    const t = ctx.currentTime;
    const noteSpacing = 0.09;

    if (birdCombo >= 4) {
        // Pick a random phrase from the curated library and play it
        const phrases = [
            // -- Chord arpeggios (diatonic chords of C major, up then back down) --
            [349.23, 440.00, 587.33, 698.46, 880.00, 1174.66, 1396.91, 1174.66], // Dm: F4 A4 D5 F5 A5 D6 F6 D6
            [392.00, 493.88, 659.25, 783.99, 987.77, 1318.51, 987.77, 783.99],   // Em: G4 B4 E5 G5 B5 E6 B5 G5
            [349.23, 440.00, 523.25, 698.46, 880.00, 1046.50, 880.00, 698.46],   // F:  F4 A4 C5 F5 A5 C6 A5 F5
            [392.00, 493.88, 587.33, 783.99, 987.77, 1174.66, 987.77, 783.99],   // G:  G4 B4 D5 G5 B5 D6 B5 G5
            [440.00, 523.25, 659.25, 880.00, 1046.50, 1318.51, 1046.50, 880.00], // Am: A4 C5 E5 A5 C6 E6 C6 A5
            [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98, 1318.51, 1046.50], // C: C5 E5 G5 C6 E6 G6 E6 C6
            // -- Scale runs --
            [523.25, 587.33, 659.25, 698.46, 783.99, 880.00, 987.77, 1046.50], // C major C5–C6
            [392.00, 440.00, 493.88, 523.25, 587.33, 659.25, 698.46, 783.99],  // C major G4–G5
            [783.99, 880.00, 987.77, 1046.50, 1174.66, 1318.51, 1396.91, 1567.98], // C major G5–G6
            [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50, 1318.51, 1567.98], // C pentatonic C5–G6
            // -- Fanfare figures --
            [523.25, 659.25, 783.99, 659.25, 783.99, 1046.50, 783.99, 1046.50], // C bounce fanfare
            [392.00, 523.25, 659.25, 783.99, 1046.50, 1318.51, 1046.50, 783.99], // leaping fourths
            // -- Melodies (with repeated notes) --
            [659.25, 783.99, 880.00, 783.99, 659.25, 523.25, 587.33, 659.25],   // playful bounce E5–E5
            [523.25, 587.33, 659.25, 783.99, 880.00, 783.99, 659.25, 523.25],   // rise and fall C5–C5
            [523.25, 587.33, 659.25, 698.46, 783.99, 659.25, 1046.50, 783.99],  // stepwise with leap
            [523.25, 659.25, 587.33, 783.99, 698.46, 880.00, 783.99, 1046.50],  // weaving up C5–C6
            [783.99, 880.00, 987.77, 880.00, 783.99, 659.25, 587.33, 523.25],   // high descent G5–C5
            [523.25, 659.25, 783.99, 1046.50, 987.77, 783.99, 659.25, 523.25],  // call and response
            [392.00, 440.00, 493.88, 523.25, 659.25, 783.99, 659.25, 523.25],   // gentle climb G4–C5
            [523.25, 659.25, 783.99, 987.77, 1046.50, 987.77, 783.99, 659.25],  // Cmaj7 arch
            [659.25, 783.99, 1046.50, 987.77, 880.00, 783.99, 698.46, 659.25],  // peak and step down
            [523.25, 783.99, 659.25, 523.25, 783.99, 1046.50, 1318.51, 1046.50], // skipping up
        ];
        const phrase = phrases[Math.floor(Math.random() * phrases.length)];
        phrase.forEach((freq, i) => {
            makeOsc('sine', freq, 0.22, t + i * noteSpacing, 0.14);
        });
        return;
    }

    const arpeggios = [
        [659.25, 783.99, 1046.50], // E5 G5 C6
        [698.46, 880.00, 1174.66], // F5 A5 D6
        [783.99, 987.77, 1318.51], // G5 B5 E6
        [880.00, 1046.50, 1396.91], // A5 C6 F6
    ];
    const count = birdCombo === 3 ? 4 : birdCombo === 2 ? 3 : 1;
    let noteIndex = 0;
    for (let b = 0; b < count; b++) {
        arpeggios[b].forEach(freq => {
            makeOsc('sine', freq, 0.22, t + noteIndex * noteSpacing, 0.14);
            noteIndex++;
        });
    }
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

    // Soft noise layer — low gain, slow fade in (buffer reused across calls)
    if (!chompNoiseBuffer) {
        const bufferSize = ctx.sampleRate * 0.25;
        chompNoiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = chompNoiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
    }
    const noise = ctx.createBufferSource();
    noise.buffer = chompNoiseBuffer;

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
    const chords = {
        3: [523.25, 659.25], // C5 E5
        2: [659.25, 783.99], // E5 G5
        1: [587.33, 698.46], // D5 F5
    };
    const t = ctx.currentTime;
    (chords[number] || chords[2]).forEach(freq => {
        makeOsc('square', freq, 0.15, t, 0.24);
    });
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
// WHITE NOISE BLAST
// ============================================

let whiteNoiseSource = null;

export function triggerWhiteNoise() {
    initAudio();
    if (!ctx) return;
    if (whiteNoiseSource) return; // already playing

    const fadeIn  = 0.5;
    const hold    = 3.0;
    const fadeOut = 0.5;
    const total   = fadeIn + hold + fadeOut;

    const bufferSize = ctx.sampleRate * total;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

    whiteNoiseSource = ctx.createBufferSource();
    whiteNoiseSource.buffer = buffer;

    const g = ctx.createGain();
    const t = ctx.currentTime;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(masterGain.gain.value, t + fadeIn);
    g.gain.setValueAtTime(masterGain.gain.value, t + fadeIn + hold);
    g.gain.linearRampToValueAtTime(0, t + total);

    whiteNoiseSource.connect(g);
    g.connect(ctx.destination);
    whiteNoiseSource.start(t);
    whiteNoiseSource.stop(t + total);
    whiteNoiseSource.onended = () => { whiteNoiseSource = null; };
}

// ============================================
// MUTE INDICATOR
// ============================================

/** Draw small red dot in top-left corner when muted */
export function drawMuteIndicator(ctx2d) {
    if (!isMuted) return;
    ctx2d.save();
    ctx2d.beginPath();
    ctx2d.arc(Math.round(16 * _S), Math.round(16 * _S), Math.round(8 * _S), 0, Math.PI * 2);
    ctx2d.fillStyle = '#e03030';
    ctx2d.fill();
    ctx2d.restore();
}
