import { useEffect } from 'react';
import { PlayingScene } from './PongScenes/PlayingScene';
import { StartingScene } from './PongScenes/StartingScene';

export const SCREEN_WIDTH = 800;
export const SCREEN_HEIGHT = 640;
export const BALL_SIZE = 32;
export const PADDLE_WIDTH = 32;
export const PADDLE_HEIGHT = 128;

const config = {
  type: Phaser.AUTO,
  parent: 'phaser-example',
  width: 800,
  height: 640,
  scene: [StartingScene, PlayingScene],
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
};

export function PongGame() {
  useEffect(() => {
    const game = new Phaser.Game(config);
  }, []);

  return <div id='phaser-example'></div>;
}
