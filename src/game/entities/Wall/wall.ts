import MainScene from "../../scenes/Main/MainScene";
import { Direction } from "../../types";
import { getAdjacentTiles } from "../../utils/helper-functions";
import LadderPiece from "./ladder";

export default class Wall extends Phaser.GameObjects.Sprite {
  scene: MainScene;
  shadow!: Phaser.GameObjects.Image;
  topShadow!: Phaser.GameObjects.Image;
  zValue: number;
  isGrate = false;
  row: number;
  col: number;
  floor: number;
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
    above: Wall | undefined;
    below: Wall | undefined;
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
  isTraversable = true;
  ladder: LadderPiece[] = [];
  hasLadder = {
    top: false,
    bottom: false,
    right: false,
    left: false,
  };
  constructor(scene: MainScene, row: number, col: number, floor: number) {
    super(
      scene as MainScene,
      col * scene.cellWidth + scene.cellWidth / 2,
      row * scene.cellHeight,
      floor === 0 ? "wall-tier1" : "wall-tier2",
      0
    );
    this.floor = floor;
    this.y = row * scene.cellHeight + 4 - floor * scene.floorHeight;
    this.zValue = 16;
    this.scene = scene;
    this.name = "Wall";
    this.row = row;
    this.col = col;
    this.shadow = this.scene.add.image(
      this.x + scene.shadowOffset.x,
      this.y + scene.shadowOffset.y,
      "wall-tier1"
    );
    if (this.floor > 0) this.shadow.alpha = 0;
    this.topShadow = this.scene.add.image(this.x, this.y, "wall-tier1");
    this.topShadow.alpha = 0;

    this.setDepth(row + this.floor * scene.rowCount);
    this.setOrigin(0.5, 0.5);

    //ANCHOR HOVER events
    this.setInteractive();
    this.on("pointerover", () => {
      this.scene.events.emit("Pointing at", this);
    });
    this.on("pointerout", () => {
      this.scene.events.emit("Remove from pointer", this);
    });

    scene.allWalls[this.floor].set(`${row},${col}`, this);

    scene.events.on("Connect Walls", (row: number, col: number) => {
      if (this.row === row && this.col === col) this.update();
    });

    this.update();
    const adjacent = getAdjacentTiles(this.row, this.col);
    for (const [side, position] of Object.entries(adjacent)) {
      this.scene.events.emit("Connect Walls", position.row, position.col);
    }
    this.scene.add.existing(this);
  }

  generateShadow() {
    // if (this.floor > 0) return;
    if (this.connectedTo.bottom || this.adjacentWalls.bottom) {
      this.shadow.alpha = 0;
      this.topShadow.alpha = 0;
      return;
    }

    //TODO Make a generic floorHeight square shadow to use everywhere.

    const { shadowOffset, cellHeight, floorHeight } = this.scene;
    this.shadow.x = this.x + shadowOffset.x;
    this.shadow.y = this.y + shadowOffset.y + this.floor * (floorHeight * 2);
    this.shadow.alpha = 0.15;
    this.shadow.setTint(0x000000);

    if (this.adjacentWalls.top) {
      this.topShadow.alpha = 0.15;
      this.topShadow.setTint(0x000000);
      this.topShadow.setDepth(this.row + this.floor * this.scene.rowCount + 1);
      this.topShadow.scaleY = 0.3334;
      this.topShadow.y = this.y - cellHeight / 2;
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
      top: allWalls[this.floor].get(`${top.row},${top.col}`),
      bottom: allWalls[this.floor].get(`${bottom.row},${bottom.col}`),
      right: allWalls[this.floor].get(`${right.row},${right.col}`),
      left: allWalls[this.floor].get(`${left.row},${left.col}`),
      above: allWalls[this.floor + 1]?.get(`${this.row},${this.col}`),
      below: allWalls[this.floor - 1]?.get(`${this.row},${this.col}`),
    };

    this.isTraversable = this.adjacentWalls.above ? false : true;

    if (this.floor > 0) {
      const inFrontBelow = allWalls[this.floor - 1].get(
        `${bottom.row},${bottom.col}`
      );
      if (inFrontBelow) {
        this.setTexture("wall-tier1");
      } else {
        this.setTexture("wall-tier2");
      }
    } else {
      this.setTexture("wall-tier1");
    }

    this.connectedTo = {
      top: this.adjacentWalls.top ? true : false,
      bottom: this.adjacentWalls.bottom ? true : false,
      right: this.adjacentWalls.right ? true : false,
      left: this.adjacentWalls.left ? true : false,
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

  increase() {
    //
  }
  decrease() {
    //
  }

  remove() {
    //Can only be removed in editor
    if (!this.scene) return;
    this.setActive(false);
    this.scene.events.emit("Remove from pointer", this);
    const { allWalls, allCrates } = this.scene;

    if (allWalls[this.floor].get(`${this.row},${this.col}`) === this) {
      allWalls[this.floor].delete(`${this.row},${this.col}`);
    }

    allCrates.forEach((floor, index) => {
      if (index >= this.floor) {
        const crate = floor.get(`${this.row},${this.col}`);
        crate?.remove();
      }
    });

    if (this.ladder.length > 0) {
      for (const piece of this.ladder) piece.remove();
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
