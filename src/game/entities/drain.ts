import MainScene from "../scenes/MainScene";

export default class Drain extends Phaser.GameObjects.Sprite {
  scene: MainScene;
  row: number;
  col: number;
  constructor(
    scene: MainScene,
    x: number,
    y: number,
    row: number,
    col: number
  ) {
    super(scene as MainScene, x, y, "cracks");
    this.scene = scene;
    this.row = row;
    this.col = col;
    this.setOrigin(0.5, 0.5);
    this.setDepth(200);

    const angles = [0, 90, 180, 270];
    this.angle = angles[Math.floor(Math.random() * angles.length)];

    this.scene.add.existing(this);
  }
}
