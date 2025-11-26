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

        weapons.forEach(weapon => {
            this.load.image(`weapon_${weapon}`, `assets/weapon/${weapon}.png`);
        });
    }

    create() {
        // Charger les paramètres depuis localStorage
        this.settings = {
            volume: parseFloat(localStorage.getItem('gameVolume') || '0.3'),
            difficulty: localStorage.getItem('gameDifficulty') || 'normal',
            playerSpeed: parseFloat(localStorage.getItem('playerSpeed') || '150'),
            selectedWeapon: localStorage.getItem('selectedWeapon') || 'Sword01'
        };

        // Réinitialiser les variables
        this.score = 0;
        this.totalExp = 0;
        this.totalGold = 0;
        this.playerLevel = 1;
        this.expForNextLevel = 50;
        this.gameOver = false;

        // Système d'Inventaire (Max 4 armes)
        // Chaque arme : { key: 'Sword01', tier: 0, lastShot: 0, cooldown: 1200 }
        this.inventory = [];

        // Ajouter l'arme de départ
        this.addWeaponToInventory(this.settings.selectedWeapon, 0);

        // Système de Vagues
        this.currentWave = 1;
        this.waveDuration = 60;
        this.waveTimer = this.waveDuration;
        this.isWaveActive = true;
        this.playerStats = {
            damage: 0,
            speed: this.settings.playerSpeed,
            maxHealth: 20,
            regen: 0,
            critChance: 0
        };

        // Définir un monde plus grand (Brotato-style)
        const worldWidth = 2400;
        const worldHeight = 1800;
        this.physics.world.setBounds(0, 0, worldWidth, worldHeight);

        // Fond
        this.background = this.add.image(worldWidth / 2, worldHeight / 2, 'background');
        this.background.setDisplaySize(worldWidth, worldHeight);
        this.background.setOrigin(0.5, 0.5);
        this.background.setDepth(-1);

        // Joueur
        this.player = this.physics.add.sprite(worldWidth / 2, worldHeight / 2, 'characterSheet', 0);
        this.player.setCollideWorldBounds(true);
        this.player.setScale(6.0);
        this.player.body.setSize(28, 28);
        this.player.health = 20;

        // Animations
        this.anims.create({
            key: 'characterIdle',
            frames: this.anims.generateFrameNumbers('characterSheet', { start: 0, end: 7 }),
            frameRate: 6,
            repeat: -1
        });
        this.anims.create({
            key: 'characterWalk',
            frames: this.anims.generateFrameNumbers('characterSheet', { start: 8, end: 15 }),
            frameRate: 8,
            repeat: -1
        });
        this.player.play('characterIdle');

        // Caméra
        this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
        this.cameras.main.setZoom(0.6);

        // Groupes
        this.bullets = this.physics.add.group({ maxSize: 200 });
        this.enemies = this.physics.add.group();

        // Contrôles
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasdKeys = this.input.keyboard.addKeys('W,S,A,D');

        // Collisions
        this.physics.add.overlap(this.bullets, this.enemies, this.hitEnemy, null, this);
        this.physics.add.overlap(this.enemies, this.player, this.hitPlayer, null, this);

        // UI
        this.scene.launch('UIScene');

        // Son
        this.hitSound = this.sound.add('hit', { volume: this.settings.volume });

        // Spawn
        this.spawnEvent = this.time.addEvent({
            delay: 1500,
            callback: this.spawnEnemy,
            callbackScope: this,
            loop: true
        });

        // Inputs
        this.input.keyboard.on('keydown-R', () => { if (this.gameOver) { this.scene.stop('UIScene'); this.scene.restart(); } });
        this.input.keyboard.on('keydown-M', () => { if (this.gameOver) { this.scene.stop('UIScene'); this.scene.start('MenuScene'); } });
        this.input.keyboard.on('keydown-ESC', () => { if (!this.gameOver) { this.scene.pause(); this.scene.launch('PauseScene'); } });
    }

    addWeaponToInventory(key, tier) {
        if (this.inventory.length >= MAX_WEAPONS) return false;

        this.inventory.push({
            key: key,
            tier: tier,
            lastShot: 0,
            cooldown: 1200 // Peut varier selon l'arme plus tard
        });
        return true;
    }

    update(time, delta) {
        if (this.gameOver) return;

        // Timer Vague
        if (this.isWaveActive) {
            this.waveTimer -= delta / 1000;
            if (this.waveTimer <= 0) this.endWave();
            else this.events.emit('updateWaveTime', Math.ceil(this.waveTimer));
        }

        // Mouvement
        let speed = this.settings.playerSpeed;
        let velocityX = 0;
        let velocityY = 0;

        if (this.cursors.left.isDown || this.wasdKeys.A.isDown) velocityX = -speed;
        else if (this.cursors.right.isDown || this.wasdKeys.D.isDown) velocityX = speed;

        if (this.cursors.up.isDown || this.wasdKeys.W.isDown) velocityY = -speed;
        else if (this.cursors.down.isDown || this.wasdKeys.S.isDown) velocityY = speed;

        if (velocityX !== 0 && velocityY !== 0) {
            velocityX *= 0.707;
            velocityY *= 0.707;
        }

        this.player.setVelocity(velocityX, velocityY);

        if (velocityX < -10) this.player.flipX = true;
        else if (velocityX > 10) this.player.flipX = false;

        const actualSpeed = Math.abs(this.player.body.velocity.x) + Math.abs(this.player.body.velocity.y);
        if (actualSpeed > 10) {
            if (this.player.anims.currentAnim?.key !== 'characterWalk') this.player.play('characterWalk');
        } else {
            if (this.player.anims.currentAnim?.key !== 'characterIdle') this.player.play('characterIdle');
        }

        // Tir automatique pour CHAQUE arme
        this.inventory.forEach(weapon => {
            if (time - weapon.lastShot > weapon.cooldown) {
                this.shoot(weapon);
                weapon.lastShot = time;
            }
        });
    }

    shoot(weapon) {
        if (this.gameOver) return;

        // Trouver l'ennemi le plus proche
        let closestEnemy = null;
        let closestDistance = Infinity;

        this.enemies.children.entries.forEach(enemy => {
            let distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, enemy.x, enemy.y);
            if (distance < closestDistance) {
                closestDistance = distance;
                closestEnemy = enemy;
            }
        });

        let angle = 0;
        if (closestEnemy) {
            angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, closestEnemy.x, closestEnemy.y);
        } else {
            // Tir aléatoire si pas d'ennemi
            angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
        }

        let bullet = this.bullets.get(this.player.x, this.player.y);
        if (!bullet) {
            bullet = this.physics.add.sprite(this.player.x, this.player.y, `weapon_${weapon.key}`);
            this.bullets.add(bullet);
        }

        if (bullet) {
            bullet.setTexture(`weapon_${weapon.key}`);
            bullet.setActive(true);
            bullet.setVisible(true);
            bullet.body.enable = true;
            bullet.setScale(2.5);

            // Appliquer la couleur du tier
            const tierInfo = WEAPON_TIERS[weapon.tier];
            bullet.setTint(tierInfo.color);

            // Stocker les dégâts dans la balle pour hitEnemy
            bullet.damageMultiplier = tierInfo.multiplier;

            let speed = 400;
            bullet.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);

            // Rotation de la balle
            bullet.rotation = angle;
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
        this.events.emit('updateGold', this.totalGold);
        this.events.emit('updateXP', this.totalExp % this.expForNextLevel, this.expForNextLevel);

        // Vérifier montée de niveau
        this.checkLevelUp();

        // Détruire l'ennemi
        enemy.destroy();

        // Augmenter le score
        this.score += 10;
        this.events.emit('updateScore', this.score);
    }

    hitPlayer(player, enemy) {
        // Réduire la vie - RÉDUIT à 2 dégâts au lieu de 10 (vie max = 20)
        player.health = (player.health || 20) - 2;
        this.events.emit('updateHP', player.health, 20);

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

    // updateHealthBar et updateExpBar supprimés (déplacés dans UIScene)

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
            this.events.emit('levelUp', this.playerLevel);
            this.events.emit('updateHP', this.player.health, 20);

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

    endWave() {
        this.isWaveActive = false;

        // Tuer tous les ennemis
        this.enemies.clear(true, true);

        // Arrêter le spawn
        if (this.spawnEvent) this.spawnEvent.remove();

        // Ouvrir le shop
        this.scene.pause();
        this.scene.launch('ShopScene', {
            gameScene: this,
            wave: this.currentWave,
            gold: this.totalGold,
            inventory: this.inventory
        });
    }

    startNextWave() {
        this.scene.resume();
        this.scene.stop('ShopScene');

        this.currentWave++;
        this.waveTimer = 60; // Reset timer
        this.isWaveActive = true;

        this.events.emit('updateWaveNumber', this.currentWave);

        // Relancer le spawn
        this.spawnEvent = this.time.addEvent({
            delay: Math.max(500, 1500 - (this.currentWave * 100)), // Plus rapide chaque vague
            callback: this.spawnEnemy,
            callbackScope: this,
            loop: true
        });
    }

    endGame() {
        this.gameOver = true;
        this.player.setVelocity(0, 0);
        // Afficher les statistiques
        this.events.emit('gameOver', {
            score: this.score,
            totalExp: this.totalExp,
            totalGold: this.totalGold
        });

        // Arrêter tous les ennemis
        this.enemies.children.entries.forEach(enemy => {
            enemy.setVelocity(0, 0);
        });
    }
}