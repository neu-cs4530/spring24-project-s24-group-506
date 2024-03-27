export class PlayingScene extends Phaser.Scene {

  constructor() {
    super('PlayingScene');
    this.ball = null;
    this.player1 = null;
    this.player2 = null;
    this.cursors = null;
    this.keys = {};
    this.p1Score = 0;
    this.p2Score = 0;
    this.p1ScoreText = null;
    this.p2ScoreText = null;
    this.p1VictoryText = null;
    this.p2VictoryText = null;
    this.winningScore = 5;
  }

  preload() {
    this.load.image('ball', '/assets/pong_images/ball.png');
    this.load.image('paddle', '/assets/pong_images/paddle.png');
  }

  createBall() {
    this.ball = this.physics.add.sprite(
      this.physics.world.bounds.width / 2,
      this.physics.world.bounds.height / 2,
      'ball',
    );
    this.ball.setCollideWorldBounds(true);
    this.ball.setBounce(1, 1);
    console.log(this.ball.body.width, this.ball.body.height)
  }

  createPlayer1(x, y) {
    this.player1 = this.physics.add.sprite(x, y, 'paddle');
    this.player1.setCollideWorldBounds(true);
    this.player1.setBounce(1, 1);
    this.player1.setImmovable(true);
    console.log(this.player1.body.width, this.player1.body.height)
  }

  createPlayer2(x, y) {
    this.player2 = this.physics.add.sprite(x, y, 'paddle');
    this.player2.setCollideWorldBounds(true);
    this.player2.setBounce(1, 1);
    this.player2.setImmovable(true);
  }

  addKeyboardInput() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys.w = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keys.s = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.keys.space = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  }

  initializeVictoryText() {
    this.p1VictoryText = this.add.text(
      this.physics.world.bounds.width / 2,
      this.physics.world.bounds.height / 2,
      'Player 1 wins!',
      { fontSize: '32px', fill: '#fff' },
    );
    this.p2VictoryText = this.add.text(
      this.physics.world.bounds.width / 2,
      this.physics.world.bounds.height / 2,
      'Player 2 wins!',
      { fontSize: '32px', fill: '#fff' },
    );
    this.p1VictoryText.setOrigin(0.5, 0.5);
    this.p2VictoryText.setOrigin(0.5, 0.5);
    this.p1VictoryText.setVisible(false);
    this.p2VictoryText.setVisible(false);
  }

  ballCollision(ball, player) {
    ball.setVelocityX(ball.body.velocity.x + 50 * (ball.body.velocity.x > 0 ? 1 : -1));
    if (Phaser.Math.Between(0, 1) === 1) {
        ball.setVelocityY(ball.body.velocity.y * Phaser.Math.FloatBetween(-1.3, -0.9));
    } else {
        ball.setVelocityY(ball.body.velocity.y * Phaser.Math.FloatBetween(0.9, 1.3));
    }
  }

  create() {
    this.createBall();

    this.createPlayer1(this.ball.body.width / 2 + 1, this.physics.world.bounds.height / 2);
    this.createPlayer2(
      this.physics.world.bounds.width - (this.ball.body.width / 2 + 1),
      this.physics.world.bounds.height / 2,
    );

    this.physics.add.collider(this.ball, this.player1, this.ballCollision);
    this.physics.add.collider(this.ball, this.player2, this.ballCollision);

    this.addKeyboardInput();

    this.initializeVictoryText();

    this.p1ScoreText = this.add.text(0, 16, 'Player 1: 0', { fontSize: '32px', fill: '#fff' });
    this.p2ScoreText = this.add.text(this.physics.world.bounds.width, 16, 'Player 2: 0', {
      fontSize: '32px',
      fill: '#fff',
    });
    this.p2ScoreText.setOrigin(1, 0);

    this.initializeGame();
  }

  update() {
    this.p1ScoreText.setText(`Player 1: ${this.p1Score}`);
    this.p2ScoreText.setText(`Player 2: ${this.p2Score}`);

    if (this.p1Score >= this.winningScore || this.p2Score >= this.winningScore) {
      if (this.p1Score >= this.winningScore) {
        this.endScene(1);
      } else {
        this.endScene(2);
      }
    } else {
      if (this.ball.body.x < this.player1.body.x) {
        this.p2Score++;
        this.initializeGame(1);
        return;
      } else if (this.ball.body.x > this.player2.body.x) {
        this.p1Score++;
        this.initializeGame(-1);
        return;
      }

      if (this.cursors.up.isDown) {
        this.player2.setVelocityY(-350);
      } else if (this.cursors.down.isDown) {
        this.player2.setVelocityY(350);
      } else {
        this.player2.setVelocityY(0);
      }

      if (this.keys.w.isDown) {
        this.player1.setVelocityY(-300);
      } else if (this.keys.s.isDown) {
        this.player1.setVelocityY(300);
      } else {
        this.player1.setVelocityY(0);
      }
    }
  }

  initializeGame(direction = 1) {
    this.ball.setPosition(this.physics.world.bounds.width / 2, this.physics.world.bounds.height / 2);
    let verticalDirection = Phaser.Math.Between(0, 1) === 1 ? 1 : -1;
    this.ball.setVelocity(Phaser.Math.Between(200,250) * direction, Phaser.Math.Between(100,200) * verticalDirection);
    this.gameInitialized = true;
  }

  endScene(winner) {
    this.ball.setVelocity(0, 0);
    this.ball.setVisible(false);
    this.player1.setVelocity(0, 0);
    this.player2.setVelocity(0, 0);
    if (winner === 1) {
      this.p1VictoryText.setVisible(true);
    } else {
      this.p2VictoryText.setVisible(true);
    }

    this.time.delayedCall(3000, () => {
        this.resetValues();
        this.scene.start('StartingScene');
    }, [], this);
  }

  resetValues() {
    this.p1Score = 0;
    this.p2Score = 0;
    this.p1VictoryText.setVisible(false);
    this.p2VictoryText.setVisible(false);
  }
}