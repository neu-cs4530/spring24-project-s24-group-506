import Phaser from 'phaser';

export class PlayingScene extends Phaser.Scene {
  constructor() {
    super('PlayingScene');
    this.player = null;
    this.target = null;
    this.click = null;
    this.accuracy = 50;
    this.score = 0;
    this.scoreText = null;
    this.gameOver = false;
    this.winningScore = 5;
  }

  preload() {
    this.load.image('player', 'assets/player.png');
    this.load.image('target', 'assets/target.png');
    this.load.image('background', 'assets/background.png');
  }

  create() {
    this.target = this.physics.add.sprite(400, 300, 'target');
    this.target.setRandomPosition(0, 0, 800, 600);
    //this.target.setPosition(400, 300);
    this.target.setInteractive();

    this.scoreText = this.add.text(0, 16, 'Player 1 Score: 0', { fontSize: '32px', fill: '#fff' });

    // Draw cursor
    this.graphics = this.add.graphics();
    this.graphics.lineStyle(2, 0x00ff00);
    this.graphics.strokeCircle(0, 0, 30);
    this.graphics.lineBetween(-30, 0, 30, 0);
    this.graphics.lineBetween(0, -30, 0, 30);

    this.input.on('pointermove', pointer => {
      this.graphics.x = pointer.x;
      this.graphics.y = pointer.y;
    });

    this.input.on(
      'gameobjectdown',
      function (pointer, gameObject) {
        gameObject.destroy();
        this.spawnTarget();
        this.addScore();
      },
      this,
    );
  }

  update() {
    // Check if the game is over
    if (this.gameOver) return;
  }

  addScore() {
    // Increase score and update the score text
    this.score++;
    this.scoreText.setText('Player 1 Score: ' + this.score);

    // Check for winning condition
    if (this.score >= this.winningScore) {
      this.gameOver = true;
      alert('Player 1 wins!');
    }
  }

  spawnTarget() {
    const x = Phaser.Math.Between(0, 800);
    const y = Phaser.Math.Between(0, 600);
    this.target = this.physics.add.sprite(x, y, 'target');
    this.target.setInteractive();
  }
}
