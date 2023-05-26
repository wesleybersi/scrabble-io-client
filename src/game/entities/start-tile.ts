import MainScene from "../scenes/Main/MainScene";

export default class Start extends Phaser.GameObjects.Sprite {
  scene: MainScene;
  row!: number;
  col!: number;
  floor!: number;
  constructor(scene: MainScene, row: number, col: number, floor: number) {
    super(
      scene as MainScene,
      col * scene.cellWidth + scene.cellWidth / 2,
      row * scene.cellHeight + scene.cellHeight / 2 - floor * scene.floorHeight,
      "entrance"
    );
    this.row = row;
    this.col = col;
    this.floor = floor;
    this.x = col * scene.cellWidth + scene.cellWidth / 2;
    this.y = row * scene.cellHeight + scene.cellHeight / 2;
    this.scene = scene;
    this.setDepth(1);
    scene.add.existing(this);
  }
  update() {
    const { cellHeight, cellWidth, floorHeight } = this.scene;
    this.x = this.col * cellWidth + cellWidth / 2;
    this.y = this.row * cellHeight + cellHeight / 2 - this.floor * floorHeight;
    this.z = this.floor * floorHeight;
  }
}
