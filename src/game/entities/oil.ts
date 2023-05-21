import MainScene from "../scenes/MainScene";

export default class OilSpill extends Phaser.GameObjects.Sprite {
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
    super(scene as MainScene, x, y, "oil", Math.floor(Math.random() * 3));
    this.scene = scene;
    this.row = row;
    this.col = col;
    this.setOrigin(0.5, 0.5);
    this.setDepth(0);

    const angles = [0, 90, 180, 270];
    this.angle = angles[Math.floor(Math.random() * angles.length)];

    this.alpha = 0.85;

    this.scene.add.existing(this);
  }
}
