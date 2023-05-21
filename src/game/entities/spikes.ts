import MainScene from "../scenes/MainScene";

export default class Spikes extends Phaser.GameObjects.Sprite {
  scene: MainScene;
  row: number;
  col: number;
  xOffset = 0;
  yOffset = 0;
  facing: "up" | "down" | "left" | "right";
  constructor(
    scene: MainScene,
    x: number,
    y: number,
    row: number,
    col: number,
    facing: "up" | "down" | "left" | "right"
  ) {
    super(scene as MainScene, x, y, "spikes");
    this.scene = scene;
    this.row = row;
    this.col = col;
    this.facing = facing;
    this.setOrigin(0.5, 0.5);
    this.setDepth(200);

    const { cellSize } = this.scene;
    switch (this.facing) {
      case "up":
        this.angle = 0;
        this.yOffset = -cellSize;
        break;
      case "down":
        this.angle = 180;
        this.yOffset = cellSize;
        break;
      case "left":
        this.angle = 270;
        this.xOffset = -cellSize;
        break;
      case "right":
        this.angle = 90;
        this.xOffset = cellSize;
        break;
    }

    this.scene.add.existing(this);
  }
  update(x: number, y: number) {
    this.x = x + this.xOffset;
    this.y = y + this.yOffset;
  }
}
