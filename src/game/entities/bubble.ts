import MainScene from "../scenes/MainScene";
import { Direction } from "../types";

export default class Bubble extends Phaser.GameObjects.Sprite {
  scene: MainScene;
  row: number;
  col: number;
  direction: Direction;
  constructor(
    scene: MainScene,
    x: number,
    y: number,
    row: number,
    col: number,
    direction: Direction
  ) {
    super(scene as MainScene, x, y, "bubble");
    this.scene = scene;
    this.row = row;
    this.col = col;
    this.direction = direction;
    this.setOrigin(0.5, 0.5);
    this.setDepth(200);

    scene.tweens.add({
      targets: [this],
      duration: 750,
      ease: "Sine.InOut",
      scale: 1.25,
      yoyo: true,
      repeat: -1,
    });

    this.scene.add.existing(this);
  }
  update() {
    if (this.direction === "left") this.x--;
  }
}
