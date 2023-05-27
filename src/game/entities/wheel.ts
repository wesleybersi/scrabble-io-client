import MainScene from "../scenes/Main/MainScene";

export default class Wheel extends Phaser.GameObjects.Sprite {
  scene: MainScene;
  row: number;
  col: number;
  floor: number;
  constructor(scene: MainScene, row: number, col: number, floor: number) {
    super(
      scene as MainScene,
      col * scene.cellWidth + scene.cellWidth / 2,
      row * scene.cellHeight + scene.cellHeight / 2,
      "wheel"
    );
    this.scene = scene;
    this.row = row;
    this.col = col;
    this.floor = floor;
    this.setOrigin(0.5, 0.5);
    this.setDepth(200);

    const angles = [0, 90, 180, 270];
    this.angle = angles[Math.floor(Math.random() * angles.length)];

    this.scene.add.existing(this);
  }
}
