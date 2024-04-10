import Phaser from 'phaser';

export class StartingScene extends Phaser.Scene {
  constructor() {
    super('StartingScene');
  }

  create() {
    this.add.text(
      this.physics.world.bounds.width / 2,
      this.physics.world.bounds.height / 2,
      'Press SPACE to start',
      { fontSize: '32px', fill: '#fff' },
    );
    this.input.keyboard.on('keydown-SPACE', () => {
      this.scene.start('PlayingScene');
    });
  }
}
