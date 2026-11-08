/**
 * Audio Track Synthesizer for Klaket Studio
 * Generates 9 distinct, loopable, studio-quality stereo WAV soundtracks (44.1kHz 16-bit).
 */
const fs = require('fs');
const path = require('path');

const sampleRate = 44100;

function writeStereoWav(filepath, samplesL, samplesR) {
  const numSamples = samplesL.length;
  const numChannels = 2;
  const bytesPerSample = 2;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = numSamples * blockAlign;
  const buf = Buffer.alloc(44 + dataSize);

  buf.write('RIFF', 0);
  buf.writeUInt32LE(36 + dataSize, 4);
  buf.write('WAVE', 8);
  buf.write('fmt ', 12);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20); // PCM
  buf.writeUInt16LE(numChannels, 22);
  buf.writeUInt32LE(sampleRate, 24);
  buf.writeUInt32LE(byteRate, 28);
  buf.writeUInt16LE(blockAlign, 32);
  buf.writeUInt16LE(16, 34);
  buf.write('data', 36);
  buf.writeUInt32LE(dataSize, 40);

  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    const sL = Math.max(-0.98, Math.min(0.98, samplesL[i]));
    const sR = Math.max(-0.98, Math.min(0.98, samplesR[i]));
    buf.writeInt16LE(Math.floor(sL * 32767), offset);
    buf.writeInt16LE(Math.floor(sR * 32767), offset + 2);
    offset += 4;
  }

  const dir = path.dirname(filepath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filepath, buf);
  console.log('Generated:', filepath, `(${(buf.length / 1024 / 1024).toFixed(2)} MB)`);
}

// Note frequencies (Hz)
const NOTE = {
  C2: 65.41, D2: 73.42, E2: 82.41, F2: 87.31, G2: 98.00, A2: 110.00, B2: 123.47,
  C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.00, A3: 220.00, B3: 246.94,
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.00, B5: 987.77,
  C6: 1046.50
};

// Instrument synthesis primitives
function pianoNote(freq, t, duration) {
  if (t < 0 || t > duration) return 0;
  const env = Math.exp(-t * 2.8) * Math.min(1, t * 150);
  const harm1 = Math.sin(2 * Math.PI * freq * t);
  const harm2 = 0.5 * Math.sin(2 * Math.PI * freq * 2 * t) * Math.exp(-t * 4);
  const harm3 = 0.25 * Math.sin(2 * Math.PI * freq * 3 * t) * Math.exp(-t * 6);
  const harm4 = 0.12 * Math.sin(2 * Math.PI * freq * 4 * t) * Math.exp(-t * 8);
  return (harm1 + harm2 + harm3 + harm4) * env * 0.7;
}

function stringPad(freq, t, pan = 0) {
  const detune1 = freq * 0.997;
  const detune2 = freq * 1.003;
  const vib = Math.sin(2 * Math.PI * 4.5 * t) * 0.004;
  const o1 = Math.sin(2 * Math.PI * (freq * (1 + vib)) * t);
  const o2 = 0.6 * Math.sin(2 * Math.PI * detune1 * t);
  const o3 = 0.6 * Math.sin(2 * Math.PI * detune2 * t);
  return (o1 + o2 + o3) * 0.35;
}

function warmRhodes(freq, t, duration) {
  if (t < 0 || t > duration) return 0;
  const env = Math.exp(-t * 1.8) * Math.min(1, t * 80);
  const tremolo = 1 + 0.15 * Math.sin(2 * Math.PI * 4.0 * t);
  const f1 = Math.sin(2 * Math.PI * freq * t);
  const f2 = 0.35 * Math.sin(2 * Math.PI * freq * 2 * t);
  const f3 = 0.15 * Math.sin(2 * Math.PI * freq * 3 * t);
  return (f1 + f2 + f3) * env * tremolo * 0.6;
}

function acousticPluck(freq, t, duration) {
  if (t < 0 || t > duration) return 0;
  const env = Math.exp(-t * 3.5) * Math.min(1, t * 300);
  const o1 = Math.sin(2 * Math.PI * freq * t);
  const o2 = 0.45 * Math.sin(2 * Math.PI * freq * 2 * t);
  const o3 = 0.2 * Math.sin(2 * Math.PI * freq * 3 * t);
  const o4 = 0.1 * Math.sin(2 * Math.PI * freq * 4 * t);
  return (o1 + o2 + o3 + o4) * env * 0.65;
}

function subBass(freq, t) {
  const env = 1 + 0.1 * Math.sin(2 * Math.PI * 0.5 * t);
  return Math.sin(2 * Math.PI * freq * t) * 0.5 * env;
}

// 1. 🎻 Sinema & Duygusal Piyano (cinema_emotional_piano.wav)
function generateCinemaEmotional() {
  const duration = 24.0;
  const numSamples = Math.floor(sampleRate * duration);
  const L = new Float32Array(numSamples);
  const R = new Float32Array(numSamples);

  // Am -> F -> C -> G (6s each chord)
  const chords = [
    { root: NOTE.A2, notes: [NOTE.A3, NOTE.C4, NOTE.E4, NOTE.A4] },
    { root: NOTE.F2, notes: [NOTE.F3, NOTE.A3, NOTE.C4, NOTE.F4] },
    { root: NOTE.C2, notes: [NOTE.C3, NOTE.E3, NOTE.G3, NOTE.C4] },
    { root: NOTE.G2, notes: [NOTE.G3, NOTE.B3, NOTE.D4, NOTE.G4] }
  ];

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const chordIdx = Math.floor(t / 6.0) % 4;
    const chordTime = t % 6.0;
    const chord = chords[chordIdx];

    // Strings Pad
    let stringsL = 0;
    let stringsR = 0;
    chord.notes.forEach((n, idx) => {
      const pan = (idx % 2 === 0 ? -0.3 : 0.3);
      const s = stringPad(n, t);
      stringsL += s * (1 - pan);
      stringsR += s * (1 + pan);
    });

    // Cello / Bass
    const bass = subBass(chord.root, t);
    stringsL += bass * 0.4;
    stringsR += bass * 0.4;

    // Piano Arpeggio
    let pianoL = 0;
    let pianoR = 0;
    const arpInterval = 0.5; // Every 0.5s a note
    const arpNoteIdx = Math.floor(chordTime / arpInterval) % chord.notes.length;
    const noteTime = chordTime % arpInterval;
    const noteFreq = chord.notes[arpNoteIdx];
    const p = pianoNote(noteFreq, noteTime, 1.2);
    const arpPan = (arpNoteIdx / chord.notes.length) * 0.8 - 0.4;
    pianoL += p * (1 - arpPan);
    pianoR += p * (1 + arpPan);

    // Master Mix
    L[i] = stringsL * 0.35 + pianoL * 0.45;
    R[i] = stringsR * 0.35 + pianoR * 0.45;
  }

  writeStereoWav(path.join(process.cwd(), 'public', 'audio_assets', 'cinema_emotional_piano.wav'), L, R);
}

// 2. 🌘 Karanlık Gizem & Gerilim (mystery_thriller_pulse.wav)
function generateMysteryThriller() {
  const duration = 20.0;
  const numSamples = Math.floor(sampleRate * duration);
  const L = new Float32Array(numSamples);
  const R = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    // Ominous D minor root
    const root = NOTE.D2;
    const sub = subBass(root, t) * 0.5;

    // 8th note heartbeat pulse
    const pulseTime = t % 0.6;
    const pulseEnv = Math.exp(-pulseTime * 8) * Math.sin(2 * Math.PI * 65 * pulseTime);

    // Eerie high cluster strings
    const eerie1 = Math.sin(2 * Math.PI * (NOTE.D5 + Math.sin(t * 0.8) * 4) * t) * 0.12;
    const eerie2 = Math.sin(2 * Math.PI * (NOTE.F5 + Math.cos(t * 0.5) * 3) * t) * 0.09;
    const eerie3 = Math.sin(2 * Math.PI * (NOTE.A5 + Math.sin(t * 1.1) * 5) * t) * 0.08;

    // Subtle metallic tick
    const tickTime = t % 0.3;
    const tick = Math.exp(-tickTime * 45) * (Math.random() - 0.5) * 0.06;

    L[i] = sub * 0.6 + pulseEnv * 0.35 + (eerie1 + eerie2) * 0.3 + tick;
    R[i] = sub * 0.6 + pulseEnv * 0.35 + (eerie2 + eerie3) * 0.3 + tick * 0.8;
  }

  writeStereoWav(path.join(process.cwd(), 'public', 'audio_assets', 'mystery_thriller_pulse.wav'), L, R);
}

// 3. 🌍 Belgesel & Doğa Keşfi (documentary_ambient_earth.wav)
function generateDocumentaryAmbient() {
  const duration = 24.0;
  const numSamples = Math.floor(sampleRate * duration);
  const L = new Float32Array(numSamples);
  const R = new Float32Array(numSamples);

  const ambientChords = [
    [NOTE.E3, NOTE.G3, NOTE.B3, NOTE.D4, NOTE.E4],
    [NOTE.C3, NOTE.G3, NOTE.C4, NOTE.E4, NOTE.G4],
    [NOTE.D3, NOTE.A3, NOTE.D4, NOTE.F4, NOTE.A4],
    [NOTE.B2, NOTE.F3, NOTE.B3, NOTE.D4, NOTE.F4]
  ];

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const chordIdx = Math.floor(t / 6.0) % 4;
    const chord = ambientChords[chordIdx];

    let padL = 0;
    let padR = 0;
    chord.forEach((freq, idx) => {
      const slowPhase = Math.sin(t * 0.4 + idx) * 0.3;
      const o1 = Math.sin(2 * Math.PI * freq * t);
      const o2 = 0.5 * Math.sin(2 * Math.PI * freq * 1.5 * t);
      const pan = (idx / chord.length) * 0.6 - 0.3;
      padL += (o1 + o2) * (1 - pan + slowPhase);
      padR += (o1 + o2) * (1 + pan - slowPhase);
    });

    // Deep warm drone
    const drone = Math.sin(2 * Math.PI * 55 * t) * 0.3;

    // Organic chime every 3 seconds
    const chimeTime = t % 3.0;
    const chime = Math.exp(-chimeTime * 3.0) * Math.sin(2 * Math.PI * 1320 * chimeTime) * 0.08;

    L[i] = (padL * 0.12 + drone * 0.3 + chime * 0.4);
    R[i] = (padR * 0.12 + drone * 0.3 + chime * 0.2);
  }

  writeStereoWav(path.join(process.cwd(), 'public', 'audio_assets', 'documentary_ambient_earth.wav'), L, R);
}

// 4. ⚡ Modern Upbeat & Dinamik Vibe (youtube_upbeat_future.wav)
function generateYouTubeUpbeat() {
  const duration = 20.0;
  const numSamples = Math.floor(sampleRate * duration);
  const L = new Float32Array(numSamples);
  const R = new Float32Array(numSamples);
  const bpm = 124;
  const beatDur = 60 / bpm; // ~0.483s

  const chordProg = [
    [NOTE.C3, NOTE.E4, NOTE.G4, NOTE.B4],
    [NOTE.G3, NOTE.D4, NOTE.G4, NOTE.B4],
    [NOTE.A3, NOTE.C4, NOTE.E4, NOTE.A4],
    [NOTE.F3, NOTE.C4, NOTE.F4, NOTE.A4]
  ];

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const beat = t / beatDur;
    const chordIdx = Math.floor(beat / 4) % 4;
    const chord = chordProg[chordIdx];

    // Kick on beats 0, 1, 2, 3
    const kickTime = t % beatDur;
    const kick = Math.exp(-kickTime * 18) * Math.sin(2 * Math.PI * (120 - kickTime * 150) * kickTime) * 0.55;

    // Clap on beats 1 and 3 (0-indexed: 1, 3)
    const subBeat = Math.floor(beat) % 2;
    let clap = 0;
    if (subBeat === 1 && kickTime < 0.15) {
      clap = Math.exp(-kickTime * 35) * (Math.random() - 0.5) * 0.45;
    }

    // Hi-hat on 16th notes
    const sixteenth = t % (beatDur / 4);
    const hihat = Math.exp(-sixteenth * 50) * (Math.random() - 0.5) * 0.15;

    // Bass groove
    const bassFreq = chord[0];
    const bass = subBass(bassFreq, t) * 0.4;

    // Upbeat synth chord stabs on off-beats
    const offBeat = (t + beatDur * 0.5) % beatDur;
    let synth = 0;
    if (offBeat < 0.25) {
      const sEnv = Math.exp(-offBeat * 7);
      chord.forEach(n => {
        synth += (Math.sin(2 * Math.PI * n * t) + 0.4 * Math.sin(2 * Math.PI * n * 2 * t)) * sEnv * 0.08;
      });
    }

    L[i] = kick * 0.6 + clap * 0.5 + hihat * 0.3 + bass * 0.5 + synth * 0.5;
    R[i] = kick * 0.6 + clap * 0.5 + hihat * 0.35 + bass * 0.5 + synth * 0.5;
  }

  writeStereoWav(path.join(process.cwd(), 'public', 'audio_assets', 'youtube_upbeat_future.wav'), L, R);
}

// 5. 🎧 Lo-Fi Beats & Chill Story (youtube_lofi_chill.wav)
function generateYouTubeLoFi() {
  const duration = 24.0;
  const numSamples = Math.floor(sampleRate * duration);
  const L = new Float32Array(numSamples);
  const R = new Float32Array(numSamples);
  const bpm = 76;
  const beatDur = 60 / bpm; // ~0.789s

  const lofiChords = [
    [NOTE.F3, NOTE.A3, NOTE.C4, NOTE.E4],   // Fmaj7
    [NOTE.D3, NOTE.F3, NOTE.A3, NOTE.C4],   // Dm7
    [NOTE.G3, NOTE.B3, NOTE.D4, NOTE.F4],   // G7
    [NOTE.C3, NOTE.E3, NOTE.G3, NOTE.B3]    // Cmaj7
  ];

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const beat = t / beatDur;
    const chordIdx = Math.floor(beat / 4) % 4;
    const chord = lofiChords[chordIdx];

    // Vinyl crackle noise
    const crackle = (Math.random() > 0.994 ? (Math.random() - 0.5) * 0.12 : 0) + (Math.random() - 0.5) * 0.012;

    // Rhodes chords
    const chordTime = t % (beatDur * 4);
    let rhodesL = 0;
    let rhodesR = 0;
    chord.forEach((freq, idx) => {
      const pan = (idx % 2 === 0 ? -0.2 : 0.2);
      const r = warmRhodes(freq, chordTime, beatDur * 3.8);
      rhodesL += r * (1 - pan);
      rhodesR += r * (1 + pan);
    });

    // Mellow boom-bap kick on beat 0 and 2.5
    const kTime1 = t % (beatDur * 4);
    const kTime2 = (t + beatDur * 1.5) % (beatDur * 2);
    let lofiKick = 0;
    if (kTime1 < 0.25) {
      lofiKick += Math.exp(-kTime1 * 14) * Math.sin(2 * Math.PI * 65 * kTime1) * 0.45;
    }

    // Soft snare / rimshot on beat 2
    const sTime = (t + beatDur * 2) % (beatDur * 4);
    let rimshot = 0;
    if (sTime < 0.15) {
      rimshot = Math.exp(-sTime * 25) * (Math.sin(2 * Math.PI * 340 * sTime) * 0.2 + (Math.random() - 0.5) * 0.15);
    }

    // Sub bass
    const bass = subBass(chord[0] * 0.5, t) * 0.35;

    L[i] = rhodesL * 0.35 + lofiKick * 0.5 + rimshot * 0.35 + bass * 0.4 + crackle;
    R[i] = rhodesR * 0.35 + lofiKick * 0.5 + rimshot * 0.35 + bass * 0.4 + crackle;
  }

  writeStereoWav(path.join(process.cwd(), 'public', 'audio_assets', 'youtube_lofi_chill.wav'), L, R);
}

// 6. 🚀 Cyberpunk & Fütüristik Elektronik (tech_cyber_synthwave.wav)
function generateTechCyberSynthwave() {
  const duration = 20.0;
  const numSamples = Math.floor(sampleRate * duration);
  const L = new Float32Array(numSamples);
  const R = new Float32Array(numSamples);
  const bpm = 118;
  const beatDur = 60 / bpm; // ~0.508s
  const stepDur = beatDur / 4; // 16th note ~0.127s

  // Synthwave bassline progression
  const bassNotes = [NOTE.F2, NOTE.F2, NOTE.D2, NOTE.D2, NOTE.E2, NOTE.E2, NOTE.C2, NOTE.C2];

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const step = Math.floor(t / stepDur);
    const stepTime = t % stepDur;
    const note = bassNotes[Math.floor(step / 4) % bassNotes.length];

    // Driving 16th note synthwave rolling bass
    const bassEnv = Math.exp(-stepTime * 16);
    const bassOsc = (Math.sin(2 * Math.PI * note * t) + 0.5 * Math.sin(2 * Math.PI * note * 2 * t)) * bassEnv;

    // Four on the floor kick
    const kickTime = t % beatDur;
    const kick = Math.exp(-kickTime * 20) * Math.sin(2 * Math.PI * (130 - kickTime * 170) * kickTime) * 0.6;

    // Snare on beat 2 & 4
    const snareTime = (t + beatDur) % (beatDur * 2);
    let snare = 0;
    if (snareTime < 0.2) {
      snare = Math.exp(-snareTime * 20) * (Math.sin(2 * Math.PI * 220 * snareTime) * 0.3 + (Math.random() - 0.5) * 0.35);
    }

    // Neon poly-synth arp
    const arpNotes = [NOTE.F4, NOTE.A4, NOTE.C5, NOTE.E5];
    const arpIdx = step % arpNotes.length;
    const arpFreq = arpNotes[arpIdx];
    const arpEnv = Math.exp(-stepTime * 12);
    const arp = (Math.sin(2 * Math.PI * arpFreq * t) + 0.3 * Math.sin(2 * Math.PI * arpFreq * 2 * t)) * arpEnv * 0.2;
    const arpPan = (arpIdx % 2 === 0 ? -0.35 : 0.35);

    L[i] = kick * 0.55 + snare * 0.45 + bassOsc * 0.4 + arp * (1 - arpPan);
    R[i] = kick * 0.55 + snare * 0.45 + bassOsc * 0.4 + arp * (1 + arpPan);
  }

  writeStereoWav(path.join(process.cwd(), 'public', 'audio_assets', 'tech_cyber_synthwave.wav'), L, R);
}

// 7. 💼 Lüks & Prestij & Kurumsal Güven (corporate_prestige_luxury.wav)
function generateCorporateLuxury() {
  const duration = 24.0;
  const numSamples = Math.floor(sampleRate * duration);
  const L = new Float32Array(numSamples);
  const R = new Float32Array(numSamples);
  const bpm = 95;
  const beatDur = 60 / bpm;

  const luxuryChords = [
    [NOTE.D3, NOTE.F3, NOTE.A3, NOTE.D4],
    [NOTE.G3, NOTE.B3, NOTE.D4, NOTE.G4],
    [NOTE.B2, NOTE.D3, NOTE.F3, NOTE.B3],
    [NOTE.A2, NOTE.C3, NOTE.E3, NOTE.A3]
  ];

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const chordIdx = Math.floor(t / 6.0) % 4;
    const chord = luxuryChords[chordIdx];

    // Elegant minimal grand piano
    const pianoTime = t % 1.5;
    const p1 = pianoNote(chord[2], pianoTime, 1.4) * 0.35;
    const p2 = pianoNote(chord[3], (t + 0.75) % 1.5, 1.4) * 0.3;

    // Refined acoustic bass
    const bass = subBass(chord[0], t) * 0.35;

    // Marimba/bell sparkle
    const bellTime = (t + 0.375) % 0.75;
    const bell = Math.exp(-bellTime * 12) * Math.sin(2 * Math.PI * chord[3] * 2 * bellTime) * 0.12;

    // Soft warm strings
    let strL = 0;
    let strR = 0;
    chord.forEach((n, idx) => {
      const s = stringPad(n, t);
      strL += s * 0.08;
      strR += s * 0.08;
    });

    L[i] = p1 * 0.5 + p2 * 0.4 + bass * 0.4 + bell * 0.3 + strL;
    R[i] = p1 * 0.4 + p2 * 0.5 + bass * 0.4 + bell * 0.3 + strR;
  }

  writeStereoWav(path.join(process.cwd(), 'public', 'audio_assets', 'corporate_prestige_luxury.wav'), L, R);
}

// 8. 📢 Yüksek Enerji Ticari Satış & Reklam (sales_dynamic_drive.wav)
function generateSalesDynamicDrive() {
  const duration = 20.0;
  const numSamples = Math.floor(sampleRate * duration);
  const L = new Float32Array(numSamples);
  const R = new Float32Array(numSamples);
  const bpm = 126;
  const beatDur = 60 / bpm;

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const beat = t / beatDur;

    // Big commercial stomp on beats 0 and 2
    const stompTime = t % beatDur;
    const stomp = Math.exp(-stompTime * 15) * Math.sin(2 * Math.PI * (100 - stompTime * 130) * stompTime) * 0.6;

    // Crisp handclap on beat 1 & 3
    const clapTime = (t + beatDur * 0.5) % beatDur;
    let clap = 0;
    if (clapTime < 0.14) {
      clap = Math.exp(-clapTime * 30) * (Math.random() - 0.5) * 0.45;
    }

    // Acoustic rhythm strum
    const strumTime = t % (beatDur * 0.5);
    const strum = acousticPluck(NOTE.A3, strumTime, 0.4) * 0.35 + acousticPluck(NOTE.E4, strumTime, 0.4) * 0.25;

    // Driving bass
    const bass = subBass(NOTE.A2, t) * 0.4;

    L[i] = stomp * 0.55 + clap * 0.45 + strum * 0.4 + bass * 0.4;
    R[i] = stomp * 0.55 + clap * 0.45 + strum * 0.45 + bass * 0.4;
  }

  writeStereoWav(path.join(process.cwd(), 'public', 'audio_assets', 'sales_dynamic_drive.wav'), L, R);
}

// 9. 🌿 Sıcak Akustik & Organik Yaşam (acoustic_warmth_life.wav)
function generateAcousticWarmth() {
  const duration = 24.0;
  const numSamples = Math.floor(sampleRate * duration);
  const L = new Float32Array(numSamples);
  const R = new Float32Array(numSamples);

  // G -> Em -> C -> D
  const chords = [
    [NOTE.G2, NOTE.G3, NOTE.B3, NOTE.D4, NOTE.G4],
    [NOTE.E2, NOTE.E3, NOTE.G3, NOTE.B3, NOTE.E4],
    [NOTE.C2, NOTE.C3, NOTE.E3, NOTE.G3, NOTE.C4],
    [NOTE.D2, NOTE.D3, NOTE.F3, NOTE.A3, NOTE.D4]
  ];

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const chordIdx = Math.floor(t / 6.0) % 4;
    const chordTime = t % 6.0;
    const chord = chords[chordIdx];

    // Acoustic fingerpicking arpeggio (every 0.35s)
    const pickInterval = 0.35;
    const noteIdx = Math.floor(chordTime / pickInterval) % chord.length;
    const noteTime = chordTime % pickInterval;
    const pickFreq = chord[noteIdx];
    const pick = acousticPluck(pickFreq, noteTime, 0.8) * 0.5;
    const pan = (noteIdx / chord.length) * 0.7 - 0.35;

    // Gentle cello backing
    const cello = stringPad(chord[0], t) * 0.25;

    // Soft organic shaker
    const shakerTime = t % 0.25;
    const shaker = Math.exp(-shakerTime * 45) * (Math.random() - 0.5) * 0.05;

    L[i] = pick * (1 - pan) + cello * 0.5 + shaker;
    R[i] = pick * (1 + pan) + cello * 0.5 + shaker * 0.8;
  }

  writeStereoWav(path.join(process.cwd(), 'public', 'audio_assets', 'acoustic_warmth_life.wav'), L, R);
}

console.log('Synthesizing 9 studio-quality soundtracks...');
generateCinemaEmotional();
generateMysteryThriller();
generateDocumentaryAmbient();
generateYouTubeUpbeat();
generateYouTubeLoFi();
generateTechCyberSynthwave();
generateCorporateLuxury();
generateSalesDynamicDrive();
generateAcousticWarmth();
console.log('✅ All soundtracks synthesized successfully!');

