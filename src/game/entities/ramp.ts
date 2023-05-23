import MainScene from "../scenes/MainScene";
import { Direction } from "../types";

export default class Ramp extends Phaser.GameObjects.Sprite {
  scene: MainScene;
  shadow!: Phaser.GameObjects.Image;
  row: number;
  col: number;
  floor: number;
  direction: Direction;
  low!: { row: number; col: number; zValue: number };
  high!: { row: number; col: number; zValue: number };

  constructor(
    scene: MainScene,
    direction: Direction,
    row: number,
    col: number,
    floor: number
  ) {
    super(
      scene as MainScene,
      direction === "left" || direction === "right"
        ? col * scene.cellWidth + scene.cellWidth
        : col * scene.cellWidth + scene.cellWidth / 2,
      direction === "left" || direction === "right"
        ? row * scene.cellHeight + 4
        : row * scene.cellHeight - 8,
      direction === "left" || direction === "right"
        ? "ramp-horizontal"
        : "ramp-vertical",
      direction === "down" ? 1 : 0
    );
    this.scene = scene;
    this.direction = direction;
    this.row = row;
    this.col = col;
    this.floor = floor;
    const zValues = { low: 7, high: 14 };

    switch (direction) {
      case "right":
        this.low = { row: this.row, col: this.col, zValue: zValues.low };
        this.high = { row: this.row, col: this.col + 1, zValue: zValues.high };
        break;
      case "left":
        this.setScale(-1, 1);
        this.low = { row: this.row, col: this.col + 1, zValue: zValues.low };
        this.high = { row: this.row, col: this.col, zValue: zValues.high };
        break;
      case "up":
        this.low = { row: this.row, col: this.col, zValue: zValues.low };
        this.high = { row: this.row - 1, col: this.col, zValue: zValues.high };
        break;
      case "down":
        this.low = { row: this.row, col: this.col, zValue: zValues.low };
        this.high = { row: this.row + 1, col: this.col, zValue: zValues.high };
        this.y += 40;
        break;
      default:
        return;
    }
    this.setOrigin(0.5, 0.5);
    this.setDepth(row + floor);
    this.shadow = this.scene.add.image(
      this.x + scene.shadowOffset.x,
      this.y + scene.shadowOffset.y,
      direction === "left" || direction === "right"
        ? "ramp-horizontal"
        : "ramp-vertical",
      direction === "down" ? 1 : 0
    );
    this.shadow.setDepth(row + floor);

    this.y -= floor * scene.floorHeight;

    this.generateShadow();
    scene.allRamps.set(`${this.low.row},${this.low.col}`, this);
    scene.allRamps.set(`${this.high.row},${this.high.col}`, this);

    this.scene.add.existing(this);
  }
  generateShadow() {
    const { shadowOffset } = this.scene;
    this.shadow.x = this.x + shadowOffset.x;
    this.shadow.y = this.y + shadowOffset.y;

    this.shadow.alpha = 0.15;
    this.shadow.setTint(0x000000);
  }
  remove() {
    const { allRamps } = this.scene;
    let removeCount = 0;
    for (const [pos, ramp] of allRamps) {
      if (removeCount === 2) break;
      if (ramp !== this) continue;
      else allRamps.delete(pos);
      removeCount++;
    }

    this.shadow.destroy();
    this.destroy();
  }
}
