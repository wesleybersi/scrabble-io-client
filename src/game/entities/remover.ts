import { Cardinal } from "../types";
import MainScene from "../scenes/MainScene";

class Remover extends Phaser.GameObjects.Graphics {
  scene: MainScene;
  graphic!: Phaser.GameObjects.Graphics;
  row!: number;
  col!: number;
  placement: Cardinal;
  color!: number;
  x: number;
  y: number;
  constructor(scene: MainScene, placement: Cardinal, row: number, col: number) {
    super(scene as MainScene);
    this.scene = scene;
    this.name = "Remover";
    this.placement = placement;
    this.row = row;
    this.col = col;
    this.x = col * scene.cellSize;
    this.y = row * scene.cellSize;
    this.color = 0x5565ff;
    this.graphic = scene.add.graphics();

    scene.allObjects.set(`${this.row},${this.col}`, this);
    this.draw();
    scene.add.existing(this);
  }
  draw() {
    const { cellSize } = this.scene;
    const size = cellSize / 6;
    this.graphic.clear();
    this.graphic.fillStyle(this.color);
    if (this.placement === "top") {
      this.graphic.fillRoundedRect(this.x, this.y, cellSize, size, 0);
    } else if (this.placement === "bottom") {
      this.graphic.fillRoundedRect(
        this.x,
        this.y + cellSize - size,
        cellSize,
        size,
        0
      );
    } else if (this.placement === "left") {
      this.graphic.fillRoundedRect(this.x, this.y, size, cellSize, 0);
    } else if (this.placement === "right") {
      this.graphic.fillRoundedRect(
        this.x + cellSize - size,
        this.y,
        size,
        cellSize,
        0
      );
    }
    this.setDepth(100);
  }
  rotate() {
    if (this.placement === "top") this.placement = "right";
    else if (this.placement === "right") this.placement = "bottom";
    else if (this.placement === "bottom") this.placement = "left";
    else if (this.placement === "left") this.placement = "top";
    this.draw();
  }
  remove() {
    const { allObjects } = this.scene;
    allObjects.delete(`${this.row},${this.col}`);
    this.graphic.destroy();
    this.destroy();
  }
}
export default Remover;
