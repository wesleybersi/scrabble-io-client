import MainScene from "../../scenes/Main/MainScene";
import { CELL_HEIGHT, CELL_WIDTH } from "../../scenes/Main/constants";

export default class Flag extends Phaser.GameObjects.Rectangle {
  scene: MainScene;
  row: number;
  col: number;
  color: number;
  key: "a" | "b" | "c";
  constructor(
    scene: MainScene,
    row: number,
    col: number,
    key: "a" | "b" | "c"
  ) {
    let color = 0;
    if (key === "a") {
      color = 0xad4052;
    } else if (key === "b") {
      color = 0x489ad9;
    } else if (key === "c") {
      color = 0x6de36b;
    }
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
    this.key = key;
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
  }
  remove() {
    this.scene.flags[this.key] = null;
    this.destroy();
  }
}
