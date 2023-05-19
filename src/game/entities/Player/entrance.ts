import MainScene from "../../scenes/MainScene";

export default class Entrance extends Phaser.GameObjects.Graphics {
  scene: MainScene;
  row: number;
  col: number;
  isUnderThreat = false;
  constructor(scene: MainScene, row: number, col: number) {
    super(scene as MainScene);
    this.scene = scene;
    this.row = row;
    this.col = col;
    this.x = col * scene.cellSize;
    this.y = row * scene.cellSize;

    this.setDepth(1);

    this.draw();

    scene.add.existing(this);
  }
  draw() {
    const { cellSize } = this.scene;
    this.x = this.col * cellSize;
    this.y = this.row * cellSize;

    this.clear();

    this.fillStyle(0x000000, 0.25);

    this.fillRect(0, 0, cellSize, cellSize);

    const fontSize = cellSize * 0.6;
    const offsetX = (cellSize - fontSize) / 2;
    const offsetY = (cellSize - fontSize) / 2 + fontSize;
  }
}
