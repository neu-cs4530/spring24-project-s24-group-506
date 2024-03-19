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

function preload() {
    this.load.image("ball", "/assets/pong_images/ball.png");
    this.load.image("paddle", "/assets/pong_images/paddle.png");
}

function create() {
    ball = this.physics.add.sprite(
        this.physics.world.bounds.width / 2,
        this.physics.world.bounds.height / 2,
        "ball"
    );
    ball.setCollideWorldBounds(true);
    ball.setBounce(1, 1);

    player1 = this.physics.add.sprite(
        this.physics.world.bounds.width - (ball.body.width / 2 + 1),
        this.physics.world.bounds.height / 2,
        "paddle"
    );
    player1.setCollideWorldBounds(true);

    player2 = this.physics.add.sprite(
        (ball.body.width / 2 + 1),
        this.physics.world.bounds.height / 2,
        "paddle"
    );
    player2.setCollideWorldBounds(true);

}

function update() {
    if (!gameInitialized) {
        initializeGame();
    }
    if (this.input.keyboard.checkDown(this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W), 500)) {
        player1.setVelocity(0, -300);
    } else if (this.input.keyboard.checkDown(this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S), 500)) {
        player1.setVelocity(0, 300);
    } else {
        player1.setVelocity(0, 0);
    }
    if (this.input.keyboard.checkDown(this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP), 500)) {
        player2.setVelocity(0, -300);
    } else if (this.input.keyboard.checkDown(this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN), 500)) {
        player2.setVelocity(0, 300);
    } else {
        player2.setVelocity(0, 0);
    }
}

function initializeGame() {
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