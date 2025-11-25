// Ce fichier contient toutes les notes sur les modifications à appliquer
// Ne pas exécuter - juste documentation
//
// MODIFICATIONS À APPLIQUER SUR game.js:
//
// 1. Dans create() - déjà fait:
//    - worldWidth = 2400, worldHeight = 1800 ✓
//    - this.totalExp = 0, this.totalGold = 0 ✓
//
// 2. À AJOUTER dans create() après player:
//    - Caméra: this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
//    - Caméra: this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
//    - Taille joueur: setScale(0.8) au lieu de 0.7
//
// 3. TOUS les éléments UI doivent avoir:
//    - .setScrollFactor(0) - pour rester fixés à l'écran
//    - .setDepth(100) - pour être au-dessus du jeu
//
// 4. AJOUTER nouveaux textes UI:
//    - this.expText = EXP counter en cyan
//    - this.goldText = Gold counter en jaune
//
// 5. GameOver doit avoir setDepth(1000) + ajouter gameStatsText
//
// 6. Dans spawnEnemy():
//    - Spawn autour du joueur avec angle et distance
//    - const spawnDistance = 600;
//    - Renommer angle en spawnAngle pour éviter conflits
//
// 7. Dans hitEnemy():
//    - Calculer expGained et goldGained
//    - Appeler showFloatingText() deux fois
//    - Mettre à jour this.expText et this.goldText
//
// 8. AJOUTER nouvelle méthode showFloatingText(x, y, text, color)
//
// 9. Dans endGame():
//    - Afficher gameStatsText avec score, exp, gold
