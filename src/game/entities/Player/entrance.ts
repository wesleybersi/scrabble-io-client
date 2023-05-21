import MainScene from "../../scenes/MainScene";

export default class Entrance extends Phaser.GameObjects.Sprite {
  scene: MainScene;
  row: number;
  col: number;
  isUnderThreat = false;
  constructor(scene: MainScene, row: number, col: number) {
    super(
      scene as MainScene,
      row * scene.cellHeight + scene.cellHeight / 2,
      col * scene.cellWidth + scene.cellWidth / 2,
      "entrance"
    );
    this.scene = scene;
    this.row = row;
    this.col = col;
    this.x = col * scene.cellWidth + scene.cellWidth / 2;
    this.y = row * scene.cellHeight + scene.cellHeight / 2;

    this.setDepth(1);
    this.alpha = 0;
    this.draw();

    scene.add.existing(this);
  }
  draw() {
    const { cellHeight, cellWidth } = this.scene;
    this.x = this.col * cellWidth + cellWidth / 2;
    this.y = this.row * cellHeight + cellHeight / 2;
  }
}
