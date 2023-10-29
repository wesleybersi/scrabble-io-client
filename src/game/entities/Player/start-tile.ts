import MainScene from "../../scenes/Main/MainScene";
import { CELL_HEIGHT, CELL_WIDTH } from "../../scenes/Main/constants";

export default class Start extends Phaser.GameObjects.Sprite {
  scene: MainScene;
  row!: number;
  col!: number;
  constructor(scene: MainScene, row: number, col: number) {
    super(
      scene as MainScene,
      col * CELL_WIDTH + CELL_WIDTH / 2,
      row * CELL_HEIGHT + CELL_HEIGHT / 2,
      "alphabet-inverted",
      26
    );
    this.alpha = 0.5;
    this.row = row;
    this.col = col;
    this.x = col * CELL_WIDTH + CELL_WIDTH / 2;
    this.y = row * CELL_HEIGHT + CELL_HEIGHT / 2;
    this.scene = scene;
    this.setOrigin(0.5, 0.5);
    this.setDepth(1);
    scene.add.existing(this);
  }
  update() {
    this.x = this.col * CELL_WIDTH + CELL_WIDTH / 2;
    this.y = this.row * CELL_HEIGHT + CELL_HEIGHT / 2;
  }
}
