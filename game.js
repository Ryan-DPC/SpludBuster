// Configuration du jeu (sera initialisée après la définition des scènes)

// ==================== SCÈNE MENU ====================
class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    preload() {
        // Charger les assets nécessaires pour le menu
        this.load.image('background', 'assets/background.png');

        // Barre de chargement
        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(240, 270, 320, 50);

        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        const loadingText = this.make.text({
            x: width / 2,
            y: height / 2 - 50,
            text: 'Chargement...',
            style: {
                font: '20px monospace',
                fill: '#ffffff'
            }
        });
        loadingText.setOrigin(0.5, 0.5);

        const percentText = this.make.text({
            x: width / 2,
            y: height / 2,
            text: '0%',
            style: {
                font: '18px monospace',
                fill: '#ffffff'
            }
        });
        percentText.setOrigin(0.5, 0.5);

        // Gestion du chargement
        this.load.on('progress', (value) => {
            progressBar.clear();
            progressBar.fillStyle(0x4a90e2, 1);
            progressBar.fillRect(250, 280, 300 * value, 30);
            percentText.setText(parseInt(value * 100) + '%');
        });

        this.load.on('filecomplete', (key, type, data) => {
            console.log('Asset chargé:', key);
        });

        this.load.on('loaderror', (file) => {
            console.error('Erreur de chargement:', file.key);
        });

        this.load.on('complete', () => {
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
            percentText.destroy();
        });
    }

    create() {
        // Vérifier si le background est chargé
        if (this.textures.exists('background')) {
            this.background = this.add.tileSprite(0, 0, 960, 720, 'background');
            this.background.setOrigin(0, 0);
            this.background.setTileScale(1.5, 1.5);
        } else {
            // Fond de secours si l'image n'est pas chargée
            console.warn('Background non chargé, utilisation du fond de secours');
            this.add.rectangle(0, 0, 960, 720, 0x1b1f23).setOrigin(0, 0);
        }

        // Titre du jeu
        const { width, height } = this.scale;
        this.title = this.add.text(width * 0.5, height * 0.15, 'SPUD BLASTER', {
            fontSize: '72px',
            fill: '#4a90e2',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 8
        }).setOrigin(0.5);

        // Animation du titre
        this.tweens.add({
            targets: title,
            scaleX: 1.1,
            scaleY: 1.1,
            duration: 1000,
        }).setOrigin(0.5);

        // Bouton Jouer
        this.playButton = this.add.rectangle(width * 0.5, height * 0.45, 300, 60, 0x4a90e2)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => { this.scene.start('CharacterSelectScene'); })
            .on('pointerover', () => { this.playButton.setFillStyle(0x5aa0f2); this.playButton.setScale(1.05); })
            .on('pointerout', () => { this.playButton.setFillStyle(0x4a90e2); this.playButton.setScale(1); });

        this.add.text(width * 0.5, height * 0.45, 'JOUER', { fontSize: '32px', fill: '#ffffff', fontStyle: 'bold', stroke: '#000000', strokeThickness: 4 }).setOrigin(0.5);

        // Bouton Options
        this.optionsButton = this.add.rectangle(width * 0.5, height * 0.55, 300, 60, 0x8b6f47)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => { this.scene.start('OptionsScene'); })
            .on('pointerover', () => { this.optionsButton.setFillStyle(0x9b7f57); this.optionsButton.setScale(1.05); })
            .on('pointerout', () => { this.optionsButton.setFillStyle(0x8b6f47); this.optionsButton.setScale(1); });

        this.add.text(width * 0.5, height * 0.55, 'OPTIONS', { fontSize: '32px', fill: '#ffffff', fontStyle: 'bold', stroke: '#000000', strokeThickness: 4 }).setOrigin(0.5);

        // Bouton Quitter
        this.quitButton = this.add.rectangle(width * 0.5, height * 0.65, 300, 60, 0x666666)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                try { const { app } = require('electron'); app.quit(); } catch (e) { if (window.close) { window.close(); } }
            })
            .on('pointerover', () => { this.quitButton.setFillStyle(0x777777); this.quitButton.setScale(1.05); })
            .on('pointerout', () => { this.quitButton.setFillStyle(0x666666); this.quitButton.setScale(1); });

        this.add.text(width * 0.5, height * 0.65, 'QUITTER', { fontSize: '32px', fill: '#ffffff', fontStyle: 'bold', stroke: '#000000', strokeThickness: 4 }).setOrigin(0.5);

        // Instructions
        this.add.text(width * 0.5, height * 0.85, 'Contrôles: Flèches ou ZQSD pour se déplacer', { fontSize: '18px', fill: '#aaaaaa', fontStyle: 'italic' }).setOrigin(0.5);

        this.add.text(width * 0.5, height * 0.9, 'Tir automatique toutes les 200ms', { fontSize: '18px', fill: '#aaaaaa', fontStyle: 'italic' }).setOrigin(0.5);

        // Touche Espace ou Entrée pour jouer
        this.input.keyboard.on('keydown-SPACE', () => { this.scene.start('CharacterSelectScene'); });
        this.input.keyboard.on('keydown-ENTER', () => { this.scene.start('CharacterSelectScene'); });
    }

    update() {
        // Animation du fond
        this.background.tilePositionX += 0.5;
        this.background.tilePositionY += 0.5;
    }
}

// ==================== SCÈNE OPTIONS ====================
class OptionsScene extends Phaser.Scene {
    constructor() {
        super({ key: 'OptionsScene' });
    }

    init() {
        // Charger les options depuis localStorage
        this.settings = {
            volume: parseFloat(localStorage.getItem('gameVolume') || '0.3'),
            difficulty: localStorage.getItem('gameDifficulty') || 'normal',
            playerSpeed: parseFloat(localStorage.getItem('playerSpeed') || '200')
        };
    }

    preload() {
        this.load.image('background', 'assets/background.png');
    }

    create() {
        // Fond animé
        this.background = this.add.tileSprite(0, 0, 960, 720, 'background');
        this.background.setOrigin(0, 0);
        this.background.setTileScale(0.5, 0.5);

        // Titre
        this.add.text(480, 80, 'OPTIONS', {
            fontSize: '64px',
            fill: '#4a90e2',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 8
        }).setOrigin(0.5);

        // ========== VOLUME ==========
        this.add.text(480, 180, 'Volume', {
            fontSize: '28px',
            fill: '#ffffff',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        // Barre de volume (fond)
        this.volumeBarBg = this.add.rectangle(480, 230, 400, 30, 0x333333);
        this.volumeBarBg.setOrigin(0.5);
        this.volumeBarBg.setInteractive({ useHandCursor: true })
            .on('pointerdown', (pointer) => {
                this.updateVolume(pointer.x);
            })
            .on('pointermove', (pointer) => {
                if (pointer.isDown) {
                    this.updateVolume(pointer.x);
                }
            });

        // Barre de volume (actuelle)
        this.volumeBar = this.add.rectangle(280, 230, 200, 30, 0x4a90e2);
        this.volumeBar.setOrigin(0, 0.5);

        // Texte du volume
        this.volumeText = this.add.text(480, 270, Math.round(this.settings.volume * 100) + '%', {
            fontSize: '24px',
            fill: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Boutons +/- pour le volume
        const volMinus = this.add.rectangle(350, 230, 40, 40, 0x4a90e2)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                this.settings.volume = Math.max(0, this.settings.volume - 0.1);
                this.updateVolumeDisplay();
            });

        this.add.text(350, 230, '-', {
            fontSize: '32px',
            fill: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        const volPlus = this.add.rectangle(610, 230, 40, 40, 0x4a90e2)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                this.settings.volume = Math.min(1, this.settings.volume + 0.1);
                this.updateVolumeDisplay();
            });

        this.add.text(610, 230, '+', {
            fontSize: '32px',
            fill: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // ========== DIFFICULTÉ ==========
        this.add.text(480, 340, 'Difficulté', {
            fontSize: '28px',
            fill: '#ffffff',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        const difficulties = ['Facile', 'Normal', 'Difficile'];
        const difficultyColors = [0x00ff00, 0xffff00, 0xff0000];
        const difficultyValues = ['easy', 'normal', 'hard'];

        this.difficultyButtons = [];
        difficulties.forEach((diff, index) => {
            const x = 280 + index * 200;
            const isSelected = difficultyValues[index] === this.settings.difficulty;
            const button = this.add.rectangle(x, 400, 150, 50,
                isSelected ? difficultyColors[index] : 0x666666)
                .setInteractive({ useHandCursor: true })
                .on('pointerdown', () => {
                    this.settings.difficulty = difficultyValues[index];
                    this.updateDifficultyButtons();
                });

            this.add.text(x, 400, diff, {
                fontSize: '24px',
                fill: '#ffffff',
                fontStyle: 'bold',
                stroke: '#000000',
                strokeThickness: 3
            }).setOrigin(0.5);

            this.difficultyButtons.push({ button, color: difficultyColors[index], value: difficultyValues[index] });
        });

        // ========== VITESSE DU JOUEUR ==========
        this.add.text(480, 480, 'Vitesse du joueur', {
            fontSize: '28px',
            fill: '#ffffff',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        this.speedText = this.add.text(480, 520, this.settings.playerSpeed, {
            fontSize: '32px',
            fill: '#4a90e2',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        const speedMinus = this.add.rectangle(350, 520, 50, 50, 0x4a90e2)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                this.settings.playerSpeed = Math.max(100, this.settings.playerSpeed - 25);
                this.speedText.setText(this.settings.playerSpeed);
                localStorage.setItem('playerSpeed', this.settings.playerSpeed);
            });

        this.add.text(350, 520, '−', {
            fontSize: '40px',
            fill: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        const speedPlus = this.add.rectangle(610, 520, 50, 50, 0x4a90e2)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                this.settings.playerSpeed = Math.min(400, this.settings.playerSpeed + 25);
                this.speedText.setText(this.settings.playerSpeed);
                localStorage.setItem('playerSpeed', this.settings.playerSpeed);
            });

        this.add.text(610, 520, '+', {
            fontSize: '40px',
            fill: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Bouton Retour
        const backButton = this.add.rectangle(480, 620, 250, 50, 0x666666)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                this.saveSettings();
                this.scene.start('MenuScene');
            })
            .on('pointerover', () => {
                backButton.setFillStyle(0x777777);
                backButton.setScale(1.05);
            })
            .on('pointerout', () => {
                backButton.setFillStyle(0x666666);
                backButton.setScale(1);
            });

        this.add.text(480, 620, 'RETOUR', {
            fontSize: '28px',
            fill: '#ffffff',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        // Touche Échap pour retourner
        this.input.keyboard.on('keydown-ESC', () => {
            this.saveSettings();
            this.scene.start('MenuScene');
        });

        // Initialiser l'affichage
        this.updateVolumeDisplay();
        this.updateDifficultyButtons();
    }

    updateVolume(x) {
        const barX = this.volumeBarBg.x - this.volumeBarBg.width / 2;
        const percent = Math.max(0, Math.min(1, (x - barX) / this.volumeBarBg.width));
        this.settings.volume = percent;
        this.updateVolumeDisplay();
    }

    updateVolumeDisplay() {
        const width = this.volumeBarBg.width * this.settings.volume;
        this.volumeBar.width = width;
        this.volumeBar.x = this.volumeBarBg.x - this.volumeBarBg.width / 2;
        this.volumeText.setText(Math.round(this.settings.volume * 100) + '%');
        localStorage.setItem('gameVolume', this.settings.volume);
    }

    updateDifficultyButtons() {
        this.difficultyButtons.forEach(({ button, color, value }) => {
            if (value === this.settings.difficulty) {
                button.setFillStyle(color);
            } else {
                button.setFillStyle(0x666666);
            }
        });
        localStorage.setItem('gameDifficulty', this.settings.difficulty);
    }

    saveSettings() {
        localStorage.setItem('gameVolume', this.settings.volume);
        localStorage.setItem('gameDifficulty', this.settings.difficulty);
        localStorage.setItem('playerSpeed', this.settings.playerSpeed);
    }

    update() {
        // Animation du fond
        this.background.tilePositionX += 0.5;
        this.background.tilePositionY += 0.5;
    }
}

// ==================== SCÈNE SÉLECTION PERSONNAGE/ARME ====================
const WEAPONS = [
    'Bow02', 'Club01', 'EnergySword01', 'Hammer01', 'Knife01',
    'Mace01', 'Scimitar01', 'Scythe01', 'Shuriken01', 'Sling01',
    'Spear01', 'Staff01', 'Sword01', 'ThrowingAxe01', 'Wand01'
];
class CharacterSelectScene extends Phaser.Scene {
    constructor() {
        super({ key: 'CharacterSelectScene' });
    }

    preload() {
        this.load.image('background', 'assets/background.png');
        this.load.image('characterPortrait', 'assets/character/SPRITE_PORTRAIT.png');
        this.load.spritesheet('characterSheet', 'assets/character/SPRITE_SHEET.png', {
            frameWidth: 32,
            frameHeight: 32
        });

        // Charger toutes les armes
        const weapons = WEAPONS;

        weapons.forEach(weapon => {
            this.load.image(`weapon_${weapon}`, `assets/weapon/${weapon}.png`);
            this.load.image(`weaponIcon_${weapon}`, `assets/weapon/Icons/${weapon}.png`);
        });
    }

    create() {
        // Fond animé
        this.background = this.add.tileSprite(0, 0, 960, 720, 'background');
        this.background.setOrigin(0, 0);
        this.background.setTileScale(0.5, 0.5);

        // Titre
        // Title
        this.title = this.add.text(width * 0.5, height * 0.1, 'SÉLECTION', {
            fontSize: '56px',
            fill: '#4a90e2',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 8
        }).setOrigin(0.5);
        fontSize: '56px',
            fill: '#4a90e2',
                fontStyle: 'bold',
                    stroke: '#000000',
                        strokeThickness: 8
    }).setOrigin(0.5);

        // Portrait du personnage
        // Portrait label
        this.add.text(width * 0.5, height * 0.22, 'Personnage', {
        fontSize: '28px',
        fill: '#ffffff',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 4
    }).setOrigin(0.5);
fontSize: '28px',
    fill: '#ffffff',
        fontStyle: 'bold',
            stroke: '#000000',
                strokeThickness: 4
        }).setOrigin(0.5);

const portrait = this.add.image(width * 0.5, height * 0.28, 'characterPortrait');
portrait.setScale(2);
portrait.setScale(2);

// Aperçu animé du personnage
const characterPreview = this.add.sprite(width * 0.5, height * 0.39, 'characterSheet', 0);
characterPreview.setScale(2);
characterPreview.play('characterIdle');
characterPreview.setScale(2);

// Animation du personnage
this.anims.create({
    key: 'characterIdle',
    frames: this.anims.generateFrameNumbers('characterSheet', { start: 0, end: 3 }),
    frameRate: 6,
    repeat: -1
});
characterPreview.play('characterIdle');

// Sélection d'arme
this.add.text(480, 360, 'Choisissez votre arme', {
    fontSize: '28px',
    fill: '#ffffff',
    fontStyle: 'bold',
    stroke: '#000000',
    strokeThickness: 4
}).setOrigin(0.5);

// Liste des armes
const weapons = WEAPONS;

this.selectedWeapon = localStorage.getItem('selectedWeapon') || 'Sword01';
this.weaponButtons = [];

// Créer une grille d'icônes d'armes
const cols = 5;
const width = this.scale.width;
const height = this.scale.height;
const startX = width * 0.3;
const startY = height * 0.58;
const spacing = width * 0.083;
const startX = 280;
const startY = 420;
const spacing = 80;

weapons.forEach((weapon, index) => {
    const col = index % cols;
    const row = Math.floor(index / cols);
    const x = startX + col * spacing;
    const y = startY + row * spacing;

    const isSelected = weapon === this.selectedWeapon;
    const button = this.add.image(x, y, `weaponIcon_${weapon}`)
        .setInteractive({ useHandCursor: true })
        .setScale(isSelected ? 1.2 : 1.0)
        .setTint(isSelected ? 0xffffff : 0x888888)
        .on('pointerdown', () => {
            this.selectWeapon(weapon);
        })
        .on('pointerover', () => {
            button.setScale(1.1);
        })
        .on('pointerout', () => {
            const scale = weapon === this.selectedWeapon ? 1.2 : 1.0;
            button.setScale(scale);
        });

    // Bordure pour l'arme sélectionnée
    if (isSelected) {
        const border = this.add.rectangle(x, y, 48, 48, 0x000000, 0);
        border.setStrokeStyle(3, 0x4a90e2);
        button.border = border;
    }

    this.weaponButtons.push({ weapon, button, x, y });
});

// Afficher le nom de l'arme sélectionnée
this.weaponNameText = this.add.text(width * 0.5, height * 0.8, this.getWeaponName(this.selectedWeapon), {
    fontSize: '24px',
    fill: '#4a90e2',
    fontStyle: 'bold',
    stroke: '#000000',
    strokeThickness: 4
}).setOrigin(0.5);
fontSize: '24px',
    fill: '#4a90e2',
        fontStyle: 'bold',
            stroke: '#000000',
                strokeThickness: 4
        }).setOrigin(0.5);

// Bouton Commencer
// Start button
this.startButton = this.add.rectangle(width * 0.5, height * 0.9, 300, 50, 0x4a90e2)
    .setInteractive({ useHandCursor: true })
    .on('pointerdown', () => { this.startGame(); })
    .on('pointerover', () => { this.startButton.setFillStyle(0x5aa0f2); this.startButton.setScale(1.05); })
    .on('pointerout', () => { this.startButton.setFillStyle(0x4a90e2); this.startButton.setScale(1); });
            .setInteractive({ useHandCursor: true })
    .on('pointerdown', () => {
        this.startGame();
    })
    .on('pointerover', () => {
        startButton.setFillStyle(0x5aa0f2);
        startButton.setScale(1.05);
    })
    .on('pointerout', () => {
        startButton.setFillStyle(0x4a90e2);
        startButton.setScale(1);
    });

this.add.text(width * 0.5, height * 0.9, 'COMMENCER', {
    fontSize: '28px',
    fill: '#ffffff',
    fontStyle: 'bold',
    stroke: '#000000',
    strokeThickness: 4
}).setOrigin(0.5);
fontSize: '28px',
    fill: '#ffffff',
        fontStyle: 'bold',
            stroke: '#000000',
                strokeThickness: 4
        }).setOrigin(0.5);

// Bouton Retour
// Back button
this.backButton = this.add.rectangle(width * 0.104, height * 0.9, 150, 40, 0x666666)
    .setInteractive({ useHandCursor: true })
    .on('pointerdown', () => { this.scene.start('MenuScene'); })
    .on('pointerover', () => { this.backButton.setFillStyle(0x777777); this.backButton.setScale(1.05); })
    .on('pointerout', () => { this.backButton.setFillStyle(0x666666); this.backButton.setScale(1); });
            .setInteractive({ useHandCursor: true })
    .on('pointerdown', () => {
        this.scene.start('MenuScene');
    })
    .on('pointerover', () => {
        backButton.setFillStyle(0x777777);
        backButton.setScale(1.05);
    })
    .on('pointerout', () => {
        backButton.setFillStyle(0x666666);
        backButton.setScale(1);
    });

this.add.text(width * 0.104, height * 0.9, 'RETOUR', {
    fontSize: '20px',
    fill: '#ffffff',
    fontStyle: 'bold',
    stroke: '#000000',
    strokeThickness: 3
}).setOrigin(0.5);
fontSize: '20px',
    fill: '#ffffff',
        fontStyle: 'bold',
            stroke: '#000000',
                strokeThickness: 3
        }).setOrigin(0.5);

// Touche Entrée pour commencer
this.input.keyboard.on('keydown-ENTER', () => {
    this.startGame();
});
this.input.keyboard.on('keydown-SPACE', () => {
    this.startGame();
});
    }

selectWeapon(weapon) {
    this.selectedWeapon = weapon;
    localStorage.setItem('selectedWeapon', weapon);

    // Mettre à jour les boutons
    this.weaponButtons.forEach(({ weapon: w, button, x, y }) => {
        const isSelected = w === weapon;
        button.setScale(isSelected ? 1.2 : 1.0);
        button.setTint(isSelected ? 0xffffff : 0x888888);

        // Mettre à jour la bordure
        if (button.border) {
            button.border.destroy();
            button.border = null;
        }
        if (isSelected) {
            const border = this.add.rectangle(x, y, 48, 48, 0x000000, 0);
            border.setStrokeStyle(3, 0x4a90e2);
            button.border = border;
        }
    });

    // Mettre à jour le nom
    this.weaponNameText.setText(this.getWeaponName(weapon));
}

getWeaponName(weapon) {
    const names = {
        'Bow02': 'Arc',
        'Club01': 'Massue',
        'EnergySword01': 'Épée Énergétique',
        'Hammer01': 'Marteau',
        'Knife01': 'Couteau',
        'Mace01': 'Fléau',
        'Scimitar01': 'Cimeterre',
        'Scythe01': 'Faux',
        'Shuriken01': 'Shuriken',
        'Sling01': 'Fronde',
        'Spear01': 'Lance',
        'Staff01': 'Bâton',
        'Sword01': 'Épée',
        'ThrowingAxe01': 'Hache de Lancer',
        'Wand01': 'Baguette'
    };
    return names[weapon] || weapon;
}

startGame() {
    this.scene.start('GameScene');
}

update() {
    // Animation du fond
    this.background.tilePositionX += 0.5;
    this.background.tilePositionY += 0.5;
}
}

// ==================== SCÈNE JEU ====================
class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {
        // Charger tous les assets
        this.load.spritesheet('characterSheet', 'assets/character/SPRITE_SHEET.png', {
            frameWidth: 32,
            frameHeight: 32
        });
        this.load.image('bullet', 'assets/bullet.png');
        this.load.image('enemy', 'assets/enemy.png');
        this.load.image('background', 'assets/background.png');
        this.load.audio('hit', 'assets/hit.wav');

        // Charger toutes les armes pour les projectiles
        const weapons = WEAPONS;
        'Bow02', 'Club01', 'EnergySword01', 'Hammer01', 'Knife01',
            'Mace01', 'Scimitar01', 'Scythe01', 'Shuriken01', 'Sling01',
            'Spear01', 'Staff01', 'Sword01', 'ThrowingAxe01', 'Wand01'
        ];

        weapons.forEach(weapon => {
            this.load.image(`weapon_${weapon}`, `assets/weapon/${weapon}.png`);
        });
    }

    create() {
        // Charger les paramètres depuis localStorage
        this.settings = {
            volume: parseFloat(localStorage.getItem('gameVolume') || '0.3'),
            difficulty: localStorage.getItem('gameDifficulty') || 'normal',
            playerSpeed: parseFloat(localStorage.getItem('playerSpeed') || '150'), // Plus lent au début
            selectedWeapon: localStorage.getItem('selectedWeapon') || 'Sword01'
        };

        // Réinitialiser les variables
        this.score = 0;
        this.totalExp = 0;
        this.totalGold = 0;
        this.playerLevel = 1;
        this.expForNextLevel = 50; // XP nécessaire pour niveau 2
        this.lastShotTime = 0;
        this.gameOver = false;

        // Définir un monde plus grand (Brotato-style)
        const worldWidth = 2400;
        const worldHeight = 1800;
        this.physics.world.setBounds(0, 0, worldWidth, worldHeight);

        // Fond - utiliser une image unique étirée pour couvrir le monde entier
        this.background = this.add.image(worldWidth / 2, worldHeight / 2, 'background');
        this.background.setDisplaySize(worldWidth, worldHeight);
        this.background.setOrigin(0.5, 0.5);
        this.background.setDepth(-1);

        // Joueur avec sprite sheet - PLUS GRAND (style Brotato)
        this.player = this.physics.add.sprite(worldWidth / 2, worldHeight / 2, 'characterSheet', 0);
        this.player.setCollideWorldBounds(true);
        this.player.setScale(6.0); // TRÈS TRÈS grand sprite
        this.player.body.setSize(28, 28);
        this.player.health = 20; // Brotato commence avec peu de vie

        // Créer les animations du personnage
        this.anims.create({
            key: 'characterIdle',
            frames: this.anims.generateFrameNumbers('characterSheet', { start: 0, end: 3 }),
            frameRate: 6,
            repeat: -1
        });
        this.anims.create({
            key: 'characterWalk',
            frames: this.anims.generateFrameNumbers('characterSheet', { start: 4, end: 7 }),
            frameRate: 8,
            repeat: -1
        });
        this.player.play('characterIdle');

        // CAMÉRA - Suivre le joueur (Brotato-style)
        this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
        this.cameras.main.setZoom(0.6); // Zoom arrière pour voir plus de map

        // Groupe de balles (utilise l'arme sélectionnée)
        this.bullets = this.physics.add.group({
            defaultKey: `weapon_${this.settings.selectedWeapon}`,
            maxSize: 100
        });

        // Groupe d'ennemis
        this.enemies = this.physics.add.group();

        // Contrôles
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasdKeys = this.input.keyboard.addKeys('W,S,A,D');

        // Collisions balle ↔ ennemi
        this.physics.add.overlap(this.bullets, this.enemies, this.hitEnemy, null, this);

        // Collisions ennemi ↔ joueur
        this.physics.add.overlap(this.enemies, this.player, this.hitPlayer, null, this);

        // UI - Score en haut à gauche (même position que Gold)
        this.scoreText = this.add.text(10, 10, 'Score: 0', {
            fontSize: '22px',
            fill: '#ffffff',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 3
        });
        this.scoreText.setScrollFactor(0);
        this.scoreText.setDepth(100);

        // UI - Gold en haut à gauche sous le score
        this.goldText = this.add.text(10, 35, 'Gold: 0', {
            fontSize: '22px',
            fill: '#ffff00',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 3
        });
        this.goldText.setScrollFactor(0);
        this.goldText.setDepth(100);

        // ===== BARRE D'EXPÉRIENCE (horizontale en haut au centre) =====
        const expBarWidth = 400;
        const expBarHeight = 24;
        const expBarX = 480; // Centre du canvas (960/2)
        const expBarY = 15;

        // Fond de la barre d'XP
        this.expBarBg = this.add.rectangle(expBarX, expBarY, expBarWidth, expBarHeight, 0x1a1a2e);
        this.expBarBg.setStrokeStyle(3, 0x16213e);
        this.expBarBg.setScrollFactor(0);
        this.expBarBg.setDepth(100);

        // Barre d'XP remplie (cyan/bleu)
        this.expBar = this.add.rectangle(
            expBarX - expBarWidth / 2,
            expBarY,
            0, // Commence vide
            expBarHeight - 4,
            0x0f4c75
        );
        this.expBar.setOrigin(0, 0.5);
        this.expBar.setScrollFactor(0);
        this.expBar.setDepth(101);

        // Indicateurs de paliers (niveaux) - 10 segments
        this.expLevelMarkers = [];
        for (let i = 1; i < 10; i++) {
            const markerX = expBarX - expBarWidth / 2 + (expBarWidth / 10) * i;
            const marker = this.add.rectangle(markerX, expBarY, 2, expBarHeight, 0x3282b8);
            marker.setScrollFactor(0);
            marker.setDepth(102);
            this.expLevelMarkers.push(marker);
        }

        // Texte niveau au centre de la barre
        this.levelText = this.add.text(expBarX, expBarY, `LVL ${this.playerLevel}`, {
            fontSize: '16px',
            fill: '#bbe1fa',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);
        this.levelText.setScrollFactor(0);
        this.levelText.setDepth(103);

        // ===== BARRE DE VIE (rouge, sous la barre d'XP) =====
        const healthBarWidth = 400;
        const healthBarHeight = 20;
        const healthBarX = 480; // Centre du canvas (960/2)
        const healthBarY = 45; // Juste en dessous de l'XP

        // Fond de la barre de vie
        this.healthBarBg = this.add.rectangle(healthBarX, healthBarY, healthBarWidth, healthBarHeight, 0x2d0a0a);
        this.healthBarBg.setStrokeStyle(2, 0x4a0e0e);
        this.healthBarBg.setScrollFactor(0);
        this.healthBarBg.setDepth(100);

        // Barre de vie remplie (rouge → vert selon %)
        this.healthBar = this.add.rectangle(
            healthBarX - healthBarWidth / 2,
            healthBarY,
            healthBarWidth - 4,
            healthBarHeight - 4,
            0xff0000
        );
        this.healthBar.setOrigin(0, 0.5);
        this.healthBar.setScrollFactor(0);
        this.healthBar.setDepth(101);

        // Texte HP sur la barre
        this.healthText = this.add.text(healthBarX, healthBarY, '20 / 20', {
            fontSize: '14px',
            fill: '#ffffff',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);
        this.healthText.setScrollFactor(0);
        this.healthText.setDepth(102);

        // Son avec volume sauvegardé
        this.hitSound = this.sound.add('hit', { volume: this.settings.volume });

        // Spawn d'ennemis plus lent au début (premier niveau)
        this.time.addEvent({
            delay: 1500, // Toutes les 1.5 secondes - moins overwhelming
            callback: this.spawnEnemy,
            callbackScope: this,
            loop: true
        });

        // UI - Game Over (caché initialement, fixé à la caméra, au-dessus de tout)
        this.gameOverText = this.add.text(480, 300, 'GAME OVER', {
            fontSize: '64px',
            fill: '#ff0000',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5).setVisible(false);
        this.gameOverText.setScrollFactor(0);
        this.gameOverText.setDepth(1000); // Z-index élevé

        this.gameStatsText = this.add.text(480, 380, '', {
            fontSize: '20px',
            fill: '#ffffff',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4,
            align: 'center'
        }).setOrigin(0.5).setVisible(false);
        this.gameStatsText.setScrollFactor(0);
        this.gameStatsText.setDepth(1000);

        this.restartText = this.add.text(480, 450, 'Appuyez sur R pour recommencer\nou M pour le menu', {
            fontSize: '24px',
            fill: '#ffffff',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4,
            align: 'center'
        }).setOrigin(0.5).setVisible(false);
        this.restartText.setScrollFactor(0);
        this.restartText.setDepth(1000);

        // Touche R pour redémarrer
        this.input.keyboard.on('keydown-R', () => {
            if (this.gameOver) {
                this.scene.restart();
            }
        });

        // Touche M pour retour au menu
        this.input.keyboard.on('keydown-M', () => {
            if (this.gameOver) {
                this.scene.start('MenuScene');
            }
        });

        // Touche Échap pour pause (optionnel)
        this.input.keyboard.on('keydown-ESC', () => {
            if (!this.gameOver) {
                this.scene.pause();
                this.scene.launch('PauseScene');
            }
        });
    }

    update(time) {
        if (this.gameOver) return;

        // Mouvement du joueur avec vitesse sauvegardée
        let speed = this.settings.playerSpeed;
        let velocityX = 0;
        let velocityY = 0;

        if (this.cursors.left.isDown || this.wasdKeys.A.isDown) {
            velocityX = -speed;
        } else if (this.cursors.right.isDown || this.wasdKeys.D.isDown) {
            velocityX = speed;
        }

        if (this.cursors.up.isDown || this.wasdKeys.W.isDown) {
            velocityY = -speed;
        } else if (this.cursors.down.isDown || this.wasdKeys.S.isDown) {
            velocityY = speed;
        }

        // Normaliser la vitesse diagonale
        if (velocityX !== 0 && velocityY !== 0) {
            velocityX *= 0.707;
            velocityY *= 0.707;
        }

        this.player.setVelocity(velocityX, velocityY);

        // Animation du personnage selon le mouvement
        if (velocityX !== 0 || velocityY !== 0) {
            if (this.player.anims.currentAnim.key !== 'characterWalk') {
                this.player.play('characterWalk');
            }
        } else {
            if (this.player.anims.currentAnim.key !== 'characterIdle') {
                this.player.play('characterIdle');
            }
        }

        // Pas d'animation pour le fond (image statique)

        // Tir automatique TRÈS LENT - seulement toutes les 1.2 secondes
        if (time - this.lastShotTime > 1200) {
            this.shoot();
            this.lastShotTime = time;
        }

        // Mise à jour de la barre de vie
        this.updateHealthBar();
    }

    shoot() {
        if (this.gameOver) return;

        // Trouver l'ennemi le plus proche
        let closestEnemy = null;
        let closestDistance = Infinity;

        this.enemies.children.entries.forEach(enemy => {
            let distance = Phaser.Math.Distance.Between(
                this.player.x, this.player.y,
                enemy.x, enemy.y
            );
            if (distance < closestDistance) {
                closestDistance = distance;
                closestEnemy = enemy;
            }
        });

        // Si pas d'ennemi, tirer vers le haut
        let angle = 0;
        if (closestEnemy) {
            angle = Phaser.Math.Angle.Between(
                this.player.x, this.player.y,
                closestEnemy.x, closestEnemy.y
            );
        }

        // Créer un projectile avec l'arme sélectionnée
        let bullet = this.bullets.get(this.player.x, this.player.y);
        if (!bullet) {
            // Créer un nouveau projectile si le groupe est vide
            bullet = this.physics.add.sprite(this.player.x, this.player.y, `weapon_${this.settings.selectedWeapon}`);
            this.bullets.add(bullet);
        }

        if (bullet) {
            bullet.setTexture(`weapon_${this.settings.selectedWeapon}`);
            bullet.setActive(true);
            bullet.setVisible(true);
            bullet.body.enable = true;
            bullet.setScale(0.4);

            let speed = 400;
            bullet.setVelocity(
                Math.cos(angle) * speed,
                Math.sin(angle) * speed
            );
        }
    }

    spawnEnemy() {
        if (this.gameOver) return;

        // Spawn autour du joueur à distance visible (Brotato-style)
        const spawnDistance = 600;
        const spawnAngle = Phaser.Math.FloatBetween(0, Math.PI * 2);
        const x = this.player.x + Math.cos(spawnAngle) * spawnDistance;
        const y = this.player.y + Math.sin(spawnAngle) * spawnDistance;

        let enemy = this.enemies.create(x, y, 'enemy');
        enemy.setCollideWorldBounds(true);
        enemy.setScale(0.3); // Minuscules
        enemy.body.setSize(25, 25);

        // Vitesse de l'ennemi RÉDUITE (Brotato commence facile)
        let baseSpeed = 60; // Réduit de 80
        let difficultyMultiplier = 1;

        switch (this.settings.difficulty) {
            case 'easy':
                difficultyMultiplier = 0.5;
                break;
            case 'normal':
                difficultyMultiplier = 0.7;
                break;
            case 'hard':
                difficultyMultiplier = 1.0;
                break;
        }

        let speed = (baseSpeed + (this.score * 0.3)) * difficultyMultiplier;
        let enemyAngle = Phaser.Math.Angle.Between(x, y, this.player.x, this.player.y);
        enemy.setVelocity(
            Math.cos(enemyAngle) * speed,
            Math.sin(enemyAngle) * speed
        );
    }

    hitEnemy(bullet, enemy) {
        // Désactiver la balle
        bullet.setActive(false);
        bullet.setVisible(false);
        bullet.body.enable = false;
        bullet.setVelocity(0, 0);

        // Particules d'explosion
        this.createExplosion(enemy.x, enemy.y);

        // Son avec volume actuel
        this.hitSound.setVolume(this.settings.volume);
        this.hitSound.play();

        // Calculer les gains - RÉDUITS pour niveau 1
        const expGained = Phaser.Math.Between(2, 5); // Réduit de 5-15
        const goldGained = Phaser.Math.Between(1, 2); // Réduit de 1-5
        this.totalExp += expGained;
        this.totalGold += goldGained;

        // Afficher texte flottant EXP (cyan)
        this.showFloatingText(enemy.x - 15, enemy.y - 30, `+${expGained} EXP`, '#00ffff');
        // Afficher texte flottant Gold (jaune)
        this.showFloatingText(enemy.x + 15, enemy.y - 30, `+${goldGained} G`, '#ffff00');

        // Mettre à jour l'UI
        this.goldText.setText('Gold: ' + this.totalGold);
        this.updateExpBar();

        // Vérifier montée de niveau
        this.checkLevelUp();

        // Détruire l'ennemi
        enemy.destroy();

        // Augmenter le score
        this.score += 10;
        this.scoreText.setText('Score: ' + this.score);
    }

    hitPlayer(player, enemy) {
        // Réduire la vie - RÉDUIT à 2 dégâts au lieu de 10 (vie max = 20)
        player.health = (player.health || 20) - 2;
        if (player.health <= 0) {
            player.health = 0;
            this.endGame();
        }

        // Détruire l'ennemi
        enemy.destroy();

        // Flash rouge
        player.setTint(0xff0000);
        this.time.delayedCall(100, () => {
            if (player && player.active) {
                player.clearTint();
            }
        });
    }

    createExplosion(x, y) {
        // Créer quelques particules simples
        for (let i = 0; i < 8; i++) {
            let particle = this.add.circle(
                x, y,
                Phaser.Math.Between(2, 5),
                0xffaa00
            );
            let particleAngle = (Math.PI * 2 * i) / 8;
            let particleSpeed = Phaser.Math.Between(50, 150);
            this.tweens.add({
                targets: particle,
                x: x + Math.cos(particleAngle) * particleSpeed,
                y: y + Math.sin(particleAngle) * particleSpeed,
                alpha: 0,
                duration: 300,
                onComplete: () => particle.destroy()
            });
        }
    }

    updateHealthBar() {
        let health = this.player.health || 20;
        let healthPercent = Math.max(0, health / 20); // Max 20 HP
        const maxWidth = 396; // 400 - 4 pour le padding
        this.healthBar.width = maxWidth * healthPercent;

        // Changer la couleur selon la vie (rouge → jaune → vert)
        if (healthPercent > 0.6) {
            this.healthBar.setFillStyle(0x00ff00); // Vert
        } else if (healthPercent > 0.3) {
            this.healthBar.setFillStyle(0xff9900); // Orange
        } else {
            this.healthBar.setFillStyle(0xff0000); // Rouge
        }

        // Mettre à jour le texte HP
        this.healthText.setText(`${Math.max(0, Math.round(health))} / 20`);
    }

    updateExpBar() {
        // Calculer le pourcentage d'XP pour le niveau actuel
        const expInCurrentLevel = this.totalExp % this.expForNextLevel;
        const expPercent = expInCurrentLevel / this.expForNextLevel;
        const maxWidth = 396; // 400 - 4 pour le padding

        this.expBar.width = maxWidth * expPercent;
    }

    checkLevelUp() {
        // Vérifier si le joueur monte de niveau
        while (this.totalExp >= this.expForNextLevel * this.playerLevel) {
            this.playerLevel++;

            // Effet visuel de montée de niveau
            this.cameras.main.flash(200, 0, 150, 255);
            this.showFloatingText(this.player.x, this.player.y - 50, `LEVEL UP!\nLVL ${this.playerLevel}`, '#00ff00');

            // Augmenter légèrement les stats du joueur
            this.player.health = Math.min(20, this.player.health + 2);
            this.settings.playerSpeed += 5;

            // Mettre à jour le texte de niveau
            this.levelText.setText(`LVL ${this.playerLevel}`);

            // Le prochain niveau nécessite plus d'XP
            this.expForNextLevel = ~~(this.expForNextLevel * 1.5);
        }
    }

    showFloatingText(x, y, text, color) {
        const floatingText = this.add.text(x, y, text, {
            fontSize: '16px',
            fill: color,
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);

        // Animation de montée et disparition
        this.tweens.add({
            targets: floatingText,
            y: y - 50,
            alpha: 0,
            duration: 1000,
            ease: 'Power2',
            onComplete: () => floatingText.destroy()
        });
    }

    endGame() {
        this.gameOver = true;
        this.player.setVelocity(0, 0);
        this.gameOverText.setVisible(true);

        // Afficher les statistiques
        this.gameStatsText.setText(
            `Score: ${this.score}\n` +
            `EXP Totale: ${this.totalExp}\n` +
            `Gold Total: ${this.totalGold}`
        );
        this.gameStatsText.setVisible(true);
        this.restartText.setVisible(true);

        // Arrêter tous les ennemis
        this.enemies.children.entries.forEach(enemy => {
            enemy.setVelocity(0, 0);
        });
    }
}

// ==================== SCÈNE PAUSE (Optionnelle) ====================
class PauseScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PauseScene' });
    }

    create() {
        // Overlay semi-transparent
        this.add.rectangle(480, 360, 960, 720, 0x000000, 0.7);

        // Texte PAUSE
        this.add.text(480, 300, 'PAUSE', {
            fontSize: '64px',
            fill: '#ffffff',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5);

        // Instructions
        this.add.text(480, 400, 'Appuyez sur Échap pour reprendre', {
            fontSize: '24px',
            fill: '#ffffff',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        // Reprendre avec Échap
        this.input.keyboard.on('keydown-ESC', () => {
            this.scene.stop();
            this.scene.resume('GameScene');
        });
    }
}

// ==================== INITIALISATION DU JEU ====================
// Configuration du jeu
const config = {
    type: Phaser.AUTO,
    width: 960,
    height: 720,
    parent: 'phaser-game',
    backgroundColor: '#1b1f23',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 960,
        height: 720
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: [MenuScene, OptionsScene, CharacterSelectScene, GameScene, PauseScene]
};

// Cr\u00e9er le jeu Phaser apr\u00e8s que toutes les sc\u00e8nes soient d\u00e9finies
let game;
if (typeof Phaser !== 'undefined') {
    console.log('Initialisation du jeu Phaser...');
    game = new Phaser.Game(config);

    // Cacher/afficher le titre selon la sc\u00e8ne
    game.events.on('ready', () => {
        const titleElement = document.querySelector('h1');

        // \u00c9couter les changements de sc\u00e8ne pour toutes les sc\u00e8nes
        ['MenuScene', 'OptionsScene', 'CharacterSelectScene', 'GameScene', 'PauseScene'].forEach(sceneName => {
            const scene = game.scene.getScene(sceneName);
            if (scene) {
                scene.events.on('start', () => {
                    if (sceneName === 'GameScene') {
                        // Cacher le titre pendant le jeu
                        if (titleElement) titleElement.style.display = 'none';
                    } else {
                        // Afficher le titre dans les autres sc\u00e8nes
                        if (titleElement) titleElement.style.display = 'block';
                    }
                });
            }
        });
    });
} else {
    console.error('Phaser n\'est pas charg\u00e9 !');
    // Afficher un message d'erreur dans le DOM
    if (document.getElementById('phaser-game')) {
        document.getElementById('phaser-game').innerHTML = '<p style="color: white; text-align: center; padding: 20px;">Erreur: Phaser n\'est pas charg\u00e9. V\u00e9rifiez que node_modules/phaser existe.</p>';
    }
}
