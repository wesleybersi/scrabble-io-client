import { GridObject, Cardinal } from "../types";
import { getOppositeSide } from "../utils/opposite";
import FloorTileProvider from "./tileProvider";
import MainScene from "../scenes/MainScene";

class Block extends Phaser.GameObjects.Sprite {
  scene: MainScene;

  sprite!: Phaser.GameObjects.Sprite;
  row!: number;
  col!: number;
  combiner!: boolean;
  isConnected = {
    top: false,
    bottom: false,
    right: false,
    left: false,
  };
  adjacentBlocks!: {
    top: GridObject | undefined;
    bottom: GridObject | undefined;
    left: GridObject | undefined;
    right: GridObject | undefined;
  };
  color!: number;
  constructor(
    scene: MainScene,
    row: number,
    col: number,
    x: number,
    y: number,
    combiner?: boolean,
    isClone?: boolean
  ) {
    super(
      scene as MainScene,
      x,
      y,
      `crate-${Math.floor(Math.random() * 7 + 1)}`
    );
    this.setOrigin(0, 0);
    this.scene = scene;
    this.name = "Block";
    this.row = row;
    this.col = col;
    this.y = y;
    this.x = x;
    if (!isClone) {
      const { allObjects } = this.scene;
      allObjects.set(`${row},${col}`, this);
    }
    this.combiner = combiner ? true : false;

    this.scene.add.existing(this);
    // this.graphic.setDepth(10);

    console.log(
      "New",
      Object.getPrototypeOf(this).constructor.name,
      "at",
      "row:",
      this.row,
      "col:",
      this.col
    );
  }
  detectAllAdjacentBlocks(connectAll?: boolean) {
    const { allObjects, portals } = this.scene;

    this.adjacentBlocks = {
      top: allObjects.get(`${this.row - 1},${this.col}`),
      bottom: allObjects.get(`${this.row + 1},${this.col}`),
      left: allObjects.get(`${this.row},${this.col - 1}`),
      right: allObjects.get(`${this.row},${this.col + 1}`),
    };

    for (const [side, value] of Object.entries(this.adjacentBlocks)) {
      if (this.isConnected[side as Cardinal] && !value)
        this.isConnected[side as Cardinal] = false;
    }

    if (connectAll) {
      if (this.adjacentBlocks.top) this.isConnected.top = true;
      if (this.adjacentBlocks.bottom) this.isConnected.bottom = true;
      if (this.adjacentBlocks.left) this.isConnected.left = true;
      if (this.adjacentBlocks.right) this.isConnected.right = true;
    }

    for (const [side, block] of Object.entries(this.adjacentBlocks)) {
      if (block && block instanceof Block) {
        let connectedThroughPortal = false;
        for (const [type, portal] of Object.entries(portals)) {
          if (!portal) break;
          if (portal.row === block.row && portal.col === block.col) {
            if (portal.placement === getOppositeSide(side as Cardinal)) {
              if (this.isConnected[side as Cardinal]) {
                connectedThroughPortal = true;
              }
            }
          }
        }
        if (connectedThroughPortal) continue;

        const oppositeSide = getOppositeSide(side as Cardinal);
        if (block.combiner) {
          this.isConnected[side as Cardinal] = true;
          block.isConnected[oppositeSide] = true;
        }

        block.detectAdjacentBlock(
          oppositeSide as Cardinal,
          this.isConnected[side as Cardinal]
        );
      }
    }
  }
  detectAdjacentBlock(
    side: "top" | "bottom" | "left" | "right",
    connectCurrent?: boolean
  ) {
    const { allObjects } = this.scene;

    this.adjacentBlocks = {
      top:
        side === "top"
          ? allObjects.get(`${this.row - 1},${this.col}`)
          : this.adjacentBlocks.top,
      bottom:
        side === "bottom"
          ? allObjects.get(`${this.row + 1},${this.col}`)
          : this.adjacentBlocks.bottom,
      left:
        side === "left"
          ? allObjects.get(`${this.row},${this.col - 1}`)
          : this.adjacentBlocks.left,
      right:
        side === "right"
          ? allObjects.get(`${this.row},${this.col + 1}`)
          : this.adjacentBlocks.right,
    };

    if (this.adjacentBlocks[side]) {
      if (connectCurrent) {
        this.isConnected[side] = connectCurrent;
      }
      if (this.combiner) {
        this.isConnected[side] = true;
      }
    }

    for (const [side, value] of Object.entries(this.isConnected)) {
      if (
        this.isConnected[side as Cardinal] &&
        !this.adjacentBlocks[side as Cardinal]
      ) {
        this.isConnected[side as Cardinal] = false;
      }
    }
  }

  splitBlocks = () => {
    for (const [side, block] of Object.entries(this.adjacentBlocks)) {
      if (block && block instanceof Block) {
        const positionOfRemovedWall = getOppositeSide(side as Cardinal);
        block.detectAdjacentBlock(positionOfRemovedWall as Cardinal);
      }
    }
  };
  remove() {
    const { allObjects, portals } = this.scene;
    for (const [type, portal] of Object.entries(portals)) {
      if (!portal) continue;
      if (portal.row === this.row && portal.col === this.col) {
        portal.remove();
      }
    }
    allObjects.delete(`${this.row},${this.col}`);

    this.splitBlocks();
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

export default Block;
