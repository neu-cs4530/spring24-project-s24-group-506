import { useEffect } from 'react';
import { PlayingScene } from './PongScenes/PlayingScene';
import { StartingScene } from './PongScenes/StartingScene';

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
