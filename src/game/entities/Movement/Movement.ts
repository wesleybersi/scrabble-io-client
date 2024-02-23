import MainScene from "../../scenes/Main/MainScene";
import { CELL_HEIGHT, CELL_WIDTH } from "../../scenes/Main/constants";

export default class Movement extends Phaser.GameObjects.Rectangle {
  scene: MainScene;
  row: number;
  col: number;
  color: number;

  constructor(scene: MainScene, row: number, col: number) {
    const color = 0x489ad9;

    super(
      scene as MainScene,
      col * CELL_WIDTH + CELL_WIDTH / 2,
      row * CELL_HEIGHT + CELL_HEIGHT / 2,
      CELL_WIDTH + 8,
      CELL_HEIGHT + 8,
      color,
      0.25
    );
    this.scene = scene;
    this.setStrokeStyle(8, color);
    this.preFX?.addGlow(color, 4, 0, true, 0.5, 10);
    // this.scene.tweens.add({
    //   targets: this,
    //   scale: 1.1,
    //   duration: 1000,
    //   yoyo: true,
    //   repeat: Infinity,
    // });
    this.row = row;
    this.col = col;
    this.color = color;
    this.setOrigin(0.5, 0.5);
    this.scene.add.existing(this);

    this.setDepth(row + 2);
    this.setAlpha(0);
  }
  remove() {
    this.destroy();
  }
}
