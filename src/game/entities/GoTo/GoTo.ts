import MainScene from "../../scenes/Main/MainScene";
import { CELL_HEIGHT, CELL_WIDTH } from "../../scenes/Main/constants";

export default class GoTo extends Phaser.GameObjects.Rectangle {
  scene: MainScene;
  row: number;
  col: number;
  color: number;

  constructor(scene: MainScene, row: number, col: number) {
    super(
      scene as MainScene,
      col * CELL_WIDTH + CELL_WIDTH / 2,
      row * CELL_HEIGHT + CELL_HEIGHT / 2,
      CELL_WIDTH + 8,
      CELL_HEIGHT + 8,
      scene.player.color,
      0.25
    );
    this.scene = scene;
    this.setStrokeStyle(8, scene.player.color);

    this.row = row;
    this.col = col;
    this.color = scene.player.color;
    this.setOrigin(0.5, 0.5);
    this.scene.add.existing(this);

    this.setDepth(row + 2);
    this.setAlpha(0.5);
    this.remove();
  }
  place(row: number, col: number) {
    this.setPosition(
      col * CELL_WIDTH + CELL_WIDTH / 2,
      row * CELL_HEIGHT + CELL_HEIGHT / 2
    );
  }
  remove() {
    delete this.scene.goto;
    this.destroy();
  }
}
