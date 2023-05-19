import { GridObject } from "../types";

class Button extends Phaser.GameObjects.Graphics {
  graphic!: Phaser.GameObjects.Graphics;
  row!: number;
  col!: number;
  direction!: "Horizontal" | "Vertical";
  cellSize!: number;
  color!: number;
  x: number;
  y: number;
  allObjects!: Map<string, GridObject>;
  constructor(
    scene: Phaser.Scene,
    direction: "Horizontal" | "Vertical",
    row: number,
    col: number,
    allObjects: Map<string, GridObject>
  ) {
    super(scene);
    this.name = "Button";
    this.allObjects = allObjects;
    this.direction = direction;
    this.row = row;
    this.col = col;
    this.cellSize = this.scene.registry.get("cellSize");
    this.x = col * this.cellSize;
    this.y = row * this.cellSize;
    this.color = 0xff2200;
    this.graphic = this.scene.add.graphics();

    this.allObjects.set(`${this.row},${this.col}`, this);
    this.draw();
    this.scene.add.existing(this);
    console.log("Drawing remover");
  }
  draw() {
    this.graphic.clear();
    this.graphic.fillStyle(this.color);
    this.graphic.arc(this.x, this.y, this.cellSize, 0, 360);
  }
  remove() {
    this.graphic.destroy();
    this.destroy();
  }
}
export default Button;
