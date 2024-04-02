import { useEffect } from 'react';
import { PlayingScene } from './TargetShooterScenes/PlayingScene';
import { StartingScene } from './TargetShooterScenes/StartingScene';
import Phaser from 'phaser';

const config = {
  type: Phaser.AUTO,
  parent: 'phaser-example',
  width: 800,
  height: 600,
  scene: [StartingScene, PlayingScene],
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
};

export function TargetShooterGame() {
  useEffect(() => {
    new Phaser.Game(config);
  }, []);

  return <div id='phaser-example' />;
}
