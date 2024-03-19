import { useEffect } from "react";

const config = {
    type: Phaser.AUTO,
    parent: "phaser-example",
    width: 800,
    height: 640,
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
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

function preload() {
    this.load.image("ball", "../../public/assets/ball.png");
    this.load.image("paddle", "../../public/assets/paddle.png");
}

function create() {
}

function update() {
}

export function PongGame() {
    useEffect(() => {
        const game = new Phaser.Game(config);
    }, []);

    return (
        <div id="phaser-example"></div>
    );
}