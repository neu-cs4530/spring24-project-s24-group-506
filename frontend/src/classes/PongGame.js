import { useEffect } from "react";

const config = {
    type: Phaser.AUTO,
    parent: "phaser-example",
    width: 800,
    height: 640,
    scene: {
        preload: preload,
        create: create,
        update: update
    },
    physics: {
        default: "arcade",
        arcade: {
            gravity: { x: 0, y: 0 },
            debug: false
        }
    }
};


let ball;
let player1;
let player2;
let gameInitialized = false;
let cursors;
let keys = {};
let p1VictoryText;
let p2VictoryText;
let p1Score = 0;
let p2Score = 0;
let winningScore = 5;
let p1ScoreText;
let p2ScoreText;

function preload() {
    this.load.image("ball", "/assets/pong_images/ball.png");
    this.load.image("paddle", "/assets/pong_images/paddle.png");
}

function createBall() {
    ball = this.physics.add.sprite(
        this.physics.world.bounds.width / 2,
        this.physics.world.bounds.height / 2,
        "ball"
    );
    ball.setCollideWorldBounds(true);
    ball.setBounce(1, 1);
}

function createPlayer1(x, y) {
    player1 = this.physics.add.sprite(x, y, "paddle");
    player1.setCollideWorldBounds(true);
    player1.setBounce(1, 1);
    player1.setImmovable(true);
}

function createPlayer2(x, y) {
    player2 = this.physics.add.sprite(x, y, "paddle");
    player2.setCollideWorldBounds(true);
    player2.setBounce(1, 1);
    player2.setImmovable(true);
}

function addKeyboardInput() {
    cursors = this.input.keyboard.createCursorKeys();
    keys.w = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    keys.s = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    keys.space = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
}

function initializeVictoryText() {
    p1VictoryText = this.add.text(this.physics.world.bounds.width / 2,
        this.physics.world.bounds.height / 2, "Player 1 wins!", { fontSize: "32px", fill: "#fff" });
    p2VictoryText = this.add.text(this.physics.world.bounds.width / 2,
        this.physics.world.bounds.height / 2, "Player 2 wins!", { fontSize: "32px", fill: "#fff" });
    p1VictoryText.setOrigin(0.5, 0.5);
    p2VictoryText.setOrigin(0.5, 0.5);
    p1VictoryText.setVisible(false);
    p2VictoryText.setVisible(false);
}

function ballCollision(ball, player) {
    ball.setVelocityX(ball.body.velocity.x * 1.1);
}

function create() {
    createBall.call(this);

    createPlayer1.call(this,
        this.physics.world.bounds.width - (ball.body.width / 2 + 1),
        this.physics.world.bounds.height / 2);
    createPlayer2.call(this,
        (ball.body.width / 2 + 1),
        this.physics.world.bounds.height / 2);

    this.physics.add.collider(ball, player1, ballCollision);
    this.physics.add.collider(ball, player2, ballCollision);
    console.log(this);

    addKeyboardInput.call(this);

    initializeVictoryText.call(this);

    p1ScoreText = this.add.text(0, 16, "Player 1: 0", { fontSize: "32px", fill: "#fff" });
    p2ScoreText = this.add.text(this.physics.world.bounds.width, 16, "Player 2: 0", { fontSize: "32px", fill: "#fff" });
    p2ScoreText.setOrigin(1, 0);
}

function update() {
    if (!gameInitialized) {
        initializeGame.call(this);
    }

    p1ScoreText.setText(`Player 1: ${p1Score}`);
    p2ScoreText.setText(`Player 2: ${p2Score}`);

    if (p1Score >= winningScore || p2Score >= winningScore) {
        if (p1Score >= winningScore) {
            p1VictoryText.setVisible(true);
        } else {
            p2VictoryText.setVisible(true);
        }
    } else {
        if (ball.body.x > player1.body.x) {
            p1Score++;
            initializeGame.call(this);
            return;
        } else if (ball.body.x < player2.body.x) {
            p2Score++;
            initializeGame.call(this);
            return;
        }

        if (cursors.up.isDown) {
            player1.setVelocityY(-300);
        } else if (cursors.down.isDown) {
            player1.setVelocityY(300);
        } else {
            player1.setVelocityY(0);
        }

        if (keys.w.isDown) {
            player2.setVelocityY(-300);
        } else if (keys.s.isDown) {
            player2.setVelocityY(300);
        } else {
            player2.setVelocityY(0);
        }
    }
}

function initializeGame() {
    ball.setPosition(this.physics.world.bounds.width / 2, this.physics.world.bounds.height / 2);
    ball.setVelocity(100, 100);
    gameInitialized = true;
}

export function PongGame() {
    useEffect(() => {
        const game = new Phaser.Game(config);
    }, []);

    return (
        <div id="phaser-example"></div>
    );
}