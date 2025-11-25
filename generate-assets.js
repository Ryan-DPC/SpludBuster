const fs = require('fs');
const path = require('path');

// Créer le dossier assets s'il n'existe pas
const assetsDir = path.join(__dirname, 'assets');
if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir);
}

// Fonction pour créer un PNG simple (1x1 pixel étiré)
// On va créer des fichiers SVG que Phaser peut charger
function createSVGImage(width, height, color, shape = 'rect') {
    if (shape === 'rect') {
        return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${width}" height="${height}" fill="${color}"/>
</svg>`;
    } else if (shape === 'circle') {
        const radius = Math.min(width, height) / 2;
        return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <circle cx="${width/2}" cy="${height/2}" r="${radius}" fill="${color}"/>
</svg>`;
    }
}

// Créer player.png (patate bleue 32x32 - forme arrondie)
const playerSVG = `<svg width="32" height="32" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="16" cy="16" rx="14" ry="12" fill="#4a90e2"/>
  <ellipse cx="12" cy="12" rx="3" ry="3" fill="#ffffff" opacity="0.6"/>
  <ellipse cx="20" cy="12" rx="3" ry="3" fill="#ffffff" opacity="0.6"/>
  <ellipse cx="16" cy="18" rx="4" ry="2" fill="#2a5a8a"/>
</svg>`;
fs.writeFileSync(path.join(assetsDir, 'player.png'), playerSVG);

// Créer bullet.png (carré blanc 8x8)
const bulletSVG = createSVGImage(8, 8, '#ffffff', 'rect');
fs.writeFileSync(path.join(assetsDir, 'bullet.png'), bulletSVG);

// Créer enemy.png (carré rouge 32x32)
const enemySVG = `<svg width="32" height="32" xmlns="http://www.w3.org/2000/svg">
  <rect width="32" height="32" fill="#ff0000"/>
  <rect x="4" y="4" width="24" height="24" fill="#cc0000"/>
  <circle cx="16" cy="16" r="4" fill="#ff6666"/>
</svg>`;
fs.writeFileSync(path.join(assetsDir, 'enemy.png'), enemySVG);

// Créer background.png (texture gris foncé avec grille)
const backgroundSVG = `<svg width="64" height="64" xmlns="http://www.w3.org/2000/svg">
  <rect width="64" height="64" fill="#2a2d35"/>
  <line x1="0" y1="0" x2="64" y2="0" stroke="#3a3d45" stroke-width="1"/>
  <line x1="0" y1="0" x2="0" y2="64" stroke="#3a3d45" stroke-width="1"/>
  <line x1="32" y1="0" x2="32" y2="64" stroke="#3a3d45" stroke-width="0.5" opacity="0.5"/>
  <line x1="0" y1="32" x2="64" y2="32" stroke="#3a3d45" stroke-width="0.5" opacity="0.5"/>
</svg>`;
fs.writeFileSync(path.join(assetsDir, 'background.png'), backgroundSVG);

// Créer hit.wav (son simple "pop")
function createSimpleWAV() {
    const sampleRate = 44100;
    const duration = 0.1; // 100ms
    const frequency = 600; // Note plus aiguë pour un "pop"
    const samples = Math.floor(sampleRate * duration);
    const buffer = Buffer.alloc(44 + samples * 2); // Header 44 bytes + données
    
    // Header WAV
    buffer.write('RIFF', 0);
    buffer.writeUInt32LE(36 + samples * 2, 4);
    buffer.write('WAVE', 8);
    buffer.write('fmt ', 12);
    buffer.writeUInt32LE(16, 16); // Taille du format
    buffer.writeUInt16LE(1, 20); // PCM
    buffer.writeUInt16LE(1, 22); // Mono
    buffer.writeUInt32LE(sampleRate, 24);
    buffer.writeUInt32LE(sampleRate * 2, 28); // Byte rate
    buffer.writeUInt16LE(2, 32); // Block align
    buffer.writeUInt16LE(16, 34); // Bits per sample
    buffer.write('data', 36);
    buffer.writeUInt32LE(samples * 2, 40);
    
    // Générer le son (sine wave avec fade out rapide)
    for (let i = 0; i < samples; i++) {
        const t = i / sampleRate;
        const fade = Math.pow(1 - (i / samples), 2); // Fade out exponentiel
        const sample = Math.sin(2 * Math.PI * frequency * t) * fade * 0.4;
        const intSample = Math.floor(sample * 32767);
        buffer.writeInt16LE(intSample, 44 + i * 2);
    }
    
    return buffer;
}

fs.writeFileSync(path.join(assetsDir, 'hit.wav'), createSimpleWAV());

console.log('✅ Assets générés avec succès dans le dossier assets/');
