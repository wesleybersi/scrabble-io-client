import MainScene from "../scenes/MainScene";
import { Direction } from "../types";

export default class Wall extends Phaser.GameObjects.Sprite {
  scene: MainScene;
  wallType: "half-wall" | "wall";
  shadow!: Phaser.GameObjects.Image;
  topShadow!: Phaser.GameObjects.Image;
  zValue: number;
  row: number;
  col: number;
  adjacent!: {
    top: { row: number; col: number };
    bottom: { row: number; col: number };
    right: { row: number; col: number };
    left: { row: number; col: number };
  };
  adjacentWalls!: {
    top: Wall | undefined;
    bottom: Wall | undefined;
    right: Wall | undefined;
    left: Wall | undefined;
  };
  collideDown = true;
  collideUp = true;
  collideLeft = true;
  collideRight = true;
  constructor(
    scene: MainScene,
    wallType: "half-wall" | "wall",
    row: number,
    col: number
  ) {
    super(
      scene as MainScene,
      col * scene.cellWidth + scene.cellWidth / 2,
      wallType === "half-wall"
        ? row * scene.cellHeight + 4
        : row * scene.cellHeight - 4,
      wallType,
      0
    );
    this.scene = scene;
    this.row = row;
    this.col = col;
    this.zValue = wallType === "half-wall" ? 16 : 32;
    this.wallType = wallType;
    this.shadow = this.scene.add.image(
      this.x + scene.shadowOffset.x,
      this.y + scene.shadowOffset.y,
      this.wallType
    );
    this.topShadow = this.scene.add.image(this.x, this.y, "half-wall");

    this.setDepth(row);
    this.setOrigin(0.5, 0.5);
    this.update();
    scene.allWalls.set(`${row},${col}`, this);

    scene.events.on("Walls Updated", () => {
      console.log("Update");
      this.update();
    });

    this.scene.events.emit("Walls Updated");

    this.scene.add.existing(this);
  }

  generateShadow() {
    const { shadowOffset, cellHeight } = this.scene;
    this.shadow.x = this.x + shadowOffset.x;
    this.shadow.y = this.y + shadowOffset.y;

    this.shadow.alpha = 0.2;
    this.shadow.setTint(0x000000);

    if (
      this.wallType === "half-wall" &&
      this.adjacentWalls.top &&
      this.adjacentWalls.top.wallType === "wall"
    ) {
      this.topShadow.alpha = 0.15;
      this.topShadow.setTint(0x000000);
      this.topShadow.setDepth(this.row + 1);
      this.topShadow.scaleY = 0.3334;
      this.topShadow.y = this.y - cellHeight / 2;
    } else {
      this.topShadow.alpha = 0;
    }
  }
  update() {
    if (!this.active) return;
    const { allWalls } = this.scene;
    this.adjacent = {
      top: { row: this.row - 1, col: this.col },
      bottom: { row: this.row + 1, col: this.col },
      right: { row: this.row, col: this.col + 1 },
      left: { row: this.row, col: this.col - 1 },
    };

    const { top, bottom, right, left } = this.adjacent;

    this.adjacentWalls = {
      top: allWalls.get(`${top.row},${top.col}`),
      bottom: allWalls.get(`${bottom.row},${bottom.col}`),
      right: allWalls.get(`${right.row},${right.col}`),
      left: allWalls.get(`${left.row},${left.col}`),
    };

    const connectedTo = {
      top:
        this.adjacentWalls.top &&
        this.adjacentWalls.top.wallType === this.wallType,
      bottom:
        this.adjacentWalls.bottom &&
        this.adjacentWalls.bottom.wallType === this.wallType,
      right:
        this.adjacentWalls.right &&
        this.adjacentWalls.right.wallType === this.wallType,
      left:
        this.adjacentWalls.left &&
        this.adjacentWalls.left.wallType === this.wallType,
    };

    const adjacentToTileIndex = (
      top: boolean,
      bottom: boolean,
      left: boolean,
      right: boolean
    ): number => {
      if (top && bottom && left && right) {
        return 9;
      }
      if (!top && !bottom && !left && !right) {
        return 0;
      }

      //Only one connected
      if (top && !bottom && !left && !right) {
        return 8;
      }
      if (!top && bottom && !left && !right) {
        return 4;
      }
      if (!top && !bottom && left && !right) {
        return 3;
      }
      if (!top && !bottom && !left && right) {
        return 1;
      }

      //Corner pieces
      if (!top && bottom && left && !right) {
        return 7;
      }
      if (!top && bottom && !left && right) {
        return 6;
      }
      if (top && !bottom && left && !right) {
        return 11;
      }
      if (top && !bottom && !left && right) {
        return 10;
      }

      //Three connects
      if (!top && bottom && left && right) {
        return 14;
      }
      if (top && !bottom && left && right) {
        return 15;
      }
      if (top && bottom && !left && right) {
        return 12;
      }
      if (top && bottom && left && !right) {
        return 13;
      }

      //Two connected
      if (top && bottom && !left && !right) {
        return 5;
      }
      if (!top && !bottom && left && right) {
        return 2;
      }

      return 0;
    };
    if (this.wallType === "half-wall") {
      this.setFrame(
        adjacentToTileIndex(
          connectedTo.top ? true : false,
          connectedTo.bottom ? true : false,
          connectedTo.left ? true : false,
          connectedTo.right ? true : false
        )
      );
    }
    this.generateShadow();
  }
  isColliding(direction: Direction): boolean {
    if (direction === "up" && this.collideDown) return true;
    else if (direction === "down" && this.collideUp) return true;
    else if (direction === "left" && this.collideLeft) return true;
    else if (direction === "right" && this.collideRight) return true;
    else return false;
  }
  remove() {
    //Can only be removed in editor
    const { allWalls } = this.scene;

    for (const [pos, wall] of allWalls) {
      if (wall === this) {
        allWalls.delete(pos);
      }
    }

    this.shadow.destroy();
    this.topShadow.destroy();
    this.destroy();
    console.log(
      "Removing",
      Object.getPrototypeOf(this).constructor.name,
      "at",
      this.row,
      this.col
    );
  }
}
