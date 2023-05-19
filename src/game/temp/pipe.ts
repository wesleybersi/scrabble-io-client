import Movable from "./movable";
import { GridObject } from "../types";
import Portal from "./portal";

class Pipe extends Movable {
  entry = { top: false, bottom: false, left: false, right: false };
  direction!:
    | "Vertical"
    | "Horizontal"
    | "TopRight"
    | "TopLeft"
    | "BottomRight"
    | "BottomLeft";
  constructor(
    scene: Phaser.Scene,
    connectBlocks: boolean,
    row: number,
    col: number,
    x: number,
    y: number,
    allObjects: Map<string, GridObject>,
    portals: { a: Portal | null; b: Portal | null }
  ) {
    super(scene, connectBlocks, false, row, col, x, y, allObjects, portals);

    this.color = 0x4477ff;
    this.alpha = 0.5;

    this.color = 0x645a60;
    this.detectAllAdjacentBlocks(connectBlocks);
    this.setEntries();
    this.draw();
  }
  setEntries() {
    if (this.isConnected.right && !this.adjacentBlocks.left) {
      this.entry.left = true;
    }
    if (this.isConnected.left && !this.adjacentBlocks.right) {
      this.entry.right = true;
    }
    if (this.isConnected.top && !this.adjacentBlocks.bottom) {
      this.entry.bottom = true;
    }
    if (this.isConnected.bottom && !this.adjacentBlocks.top) {
      this.entry.top = true;
    }
  }
}
export default Pipe;
