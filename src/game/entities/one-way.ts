import { GridObject } from "../types";

export class DirectionalGate extends Phaser.GameObjects.Graphics {
  private graphic!: Phaser.GameObjects.Graphics;
  private direction!:
    | "Up"
    | "Left"
    | "Right"
    | "Down"
    | "Vertical"
    | "Horizontal";
  private row!: number;
  private col!: number;
  private obstructs!: {
    top: boolean;
    bottom: boolean;
    right: boolean;
    left: boolean;
  };
  private obstructsWithin: {
    top: boolean;
    bottom: boolean;
    right: boolean;
    left: boolean;
  };
  private isMovable: boolean;
  private cellSize!: number;
  private allObjects!: Map<string, GridObject>;
  constructor(
    scene: Phaser.Scene,
    direction: "Up" | "Left" | "Right" | "Down" | "Vertical" | "Horizontal",
    row: number,
    col: number,
    y: number,
    x: number,
    cellSize: number,
    allObjects: Map<string, GridObject>
  ) {
    super(scene);
    this.direction = direction;
    this.row = row;
    this.col = col;
    this.obstructs = {
      top: direction !== "Down" && direction !== "Vertical",
      bottom: direction !== "Up" && direction !== "Vertical",
      left: direction !== "Right" && direction !== "Horizontal",
      right: direction !== "Left" && direction !== "Horizontal",
    };
    this.obstructsWithin = {
      top: direction === "Horizontal",
      bottom: direction === "Horizontal",
      left: direction === "Vertical",
      right: direction === "Vertical",
    };
    this.isMovable = false;
    this.x = x;
    this.y = y;
    this.cellSize = cellSize;
    this.allObjects = allObjects;
    this.graphic = this.scene.add.graphics();

    this.draw();

    this.scene.add.existing(this);
    this.allObjects.set(`${row},${col}`, this);
    console.log(
      `Placing one way gate facing ${this.direction.toLowerCase()} at`,
      row,
      col
    );
  }

  draw() {
    this.graphic.clear();
    this.graphic.lineStyle(2, 0x222222);

    const arrowSize = this.cellSize / 8;
    const offset = 8;
    // let rotation = 0;

    // switch (this.direction) {
    //   case "Up":
    //     rotation = 0;
    //     break;
    //   case "Right":
    //     rotation = 90;
    //     break;
    //   case "Down":
    //     rotation = 180;
    //     break;
    //   case "Left":
    //     rotation = 270;
    //     break;
    // }

    // this.graphic.fillStyle(0x3f353d);
    // this.graphic.fillRoundedRect(
    //   this.x + this.cellSize / 2 - arrowSize / 2,
    //   this.y + offset,
    //   arrowSize,
    //   this.cellSize - offset * 2,
    //   8
    // );

    if (this.direction === "Vertical") {
      this.graphic.fillStyle(0x3f353d);
      this.graphic.fillRoundedRect(this.x, this.y, arrowSize, this.cellSize, 0);
      this.graphic.fillRoundedRect(
        this.x + this.cellSize - arrowSize,
        this.y,
        arrowSize,
        this.cellSize,
        0
      );
    }
    if (this.direction === "Horizontal") {
      this.graphic.fillStyle(0x3f353d);
      this.graphic.fillRoundedRect(this.x, this.y, this.cellSize, arrowSize, 0);
      this.graphic.fillRoundedRect(
        this.x,
        this.y + this.cellSize - arrowSize,
        this.cellSize,
        arrowSize,
        0
      );
    }
  }

  remove() {
    this.graphic.clear();
    this.graphic.destroy();
    this.allObjects.delete(`${this.row},${this.col}`);
    this.destroy();
    console.log(
      `Removing one-way gate facing ${this.direction.toLowerCase()} at`,
      this.row,
      this.col
    );
  }
}

interface Adjacent {
  top: [number, number];
  bottom: [number, number];
  left: [number, number];
  right: [number, number];
}
