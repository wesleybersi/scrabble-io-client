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
    this.name = "Ramp";
    this.direction = direction;
    this.row = row;
    this.col = col;
    this.floor = floor;
    const zValues = {
      low: 7 + this.floor * scene.floorHeight,
      high: 14 + this.floor * scene.floorHeight,
    };

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

    //ANCHOR HOVER events
    this.setInteractive();
    this.on("pointerover", () => {
      scene.events.emit("Pointing at", this);
    });
    this.on("pointerout", () => {
      if (this.scene.hover.object === this) {
        scene.hover.object = null;
      }
    });

    this.generateShadow();
    scene.allRamps[this.floor].set(`${this.low.row},${this.low.col}`, this);
    scene.allRamps[this.floor].set(`${this.high.row},${this.high.col}`, this);

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
    if (!this.scene) return;
    const { allRamps } = this.scene;
    let removeCount = 0;
    for (const floor of allRamps) {
      for (const [pos, ramp] of floor) {
        if (removeCount === 2) break;
        if (ramp !== this) continue;
        else floor.delete(pos);
        removeCount++;
      }
    }

    this.shadow.destroy();
    this.destroy();
  }
}
