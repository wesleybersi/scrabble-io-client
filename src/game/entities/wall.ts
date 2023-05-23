import MainScene from "../scenes/MainScene";
import { Direction } from "../types";

export default class Wall extends Phaser.GameObjects.Sprite {
  scene: MainScene;
  wallType: "half-wall" | "wall" | "big-wall";
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
  connectedTo = {
    top: false,
    bottom: false,
    right: false,
    left: false,
  };
  collideDown = true;
  collideUp = true;
  collideLeft = true;
  collideRight = true;
  collidesOn = [0];
  constructor(
    scene: MainScene,
    wallType: "half-wall" | "wall" | "big-wall",
    row: number,
    col: number
  ) {
    super(
      scene as MainScene,
      col * scene.cellWidth + scene.cellWidth / 2,
      row * scene.cellHeight,
      wallType,
      0
    );

    switch (wallType) {
      case "half-wall":
        this.y = row * scene.cellHeight + 4;
        this.zValue = 16;
        break;
      case "wall":
        this.y = row * scene.cellHeight - 4;
        this.zValue = 32;
        this.collidesOn.push(1);
        break;
      case "big-wall":
        this.y = row * scene.cellHeight - 12;
        this.zValue = 48;
        this.collidesOn.push(1, 2);
        break;
    }

    this.scene = scene;
    this.row = row;
    this.col = col;

    this.wallType = wallType;
    this.shadow = this.scene.add.image(
      this.x + scene.shadowOffset.x,
      this.y + scene.shadowOffset.y,
      this.wallType
    );
    this.topShadow = this.scene.add.image(this.x, this.y, "half-wall");
    this.topShadow.alpha = 0;

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
    if (this.connectedTo.bottom) {
      this.shadow.alpha = 0;
      return;
    }
    const { shadowOffset, cellHeight } = this.scene;
    this.shadow.x = this.x + shadowOffset.x;

    switch (this.wallType) {
      case "half-wall":
        this.shadow.y = this.y + shadowOffset.y;
        break;
      case "wall":
        this.shadow.y = this.y + shadowOffset.y * 2;
        break;
      case "big-wall":
        this.shadow.y = this.y + shadowOffset.y * 3;
        break;
    }

    this.shadow.alpha = 0.15;
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
    } else if (
      this.wallType === "wall" &&
      this.adjacentWalls.top &&
      this.adjacentWalls.top.wallType === "big-wall"
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

    this.connectedTo = {
      top:
        this.adjacentWalls.top &&
        this.adjacentWalls.top.wallType === this.wallType
          ? true
          : false,
      bottom:
        this.adjacentWalls.bottom &&
        this.adjacentWalls.bottom.wallType === this.wallType
          ? true
          : false,
      right:
        this.adjacentWalls.right &&
        this.adjacentWalls.right.wallType === this.wallType
          ? true
          : false,
      left:
        this.adjacentWalls.left &&
        this.adjacentWalls.left.wallType === this.wallType
          ? true
          : false,
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

    this.setFrame(
      adjacentToTileIndex(
        this.connectedTo.top,
        this.connectedTo.bottom,
        this.connectedTo.left,
        this.connectedTo.right
      )
    );

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
