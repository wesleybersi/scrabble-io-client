import MainScene from "../../scenes/MainScene";
import Water from "../Water/water";
import { Cardinal } from "../../types";
import { cardinalToDirection, getAdjacentTiles } from "../../utils/opposite";

export default class Flow extends Phaser.GameObjects.Sprite {
  scene: MainScene;
  row: number;
  col: number;
  floor: number;
  initialLevel: number;
  initialLevelMet = false;
  capacity = 16; // Total tiles * floorHeight
  currentCapacityFilled = 16;
  level: number;
  waterMap: Map<string, Water>;
  animating = false;

  constructor(
    scene: MainScene,
    row: number,
    col: number,
    floor: number,
    initialFillLevel: number
  ) {
    super(
      scene as MainScene,
      col * scene.cellWidth + scene.cellWidth / 2,
      row * scene.cellHeight + scene.cellHeight / 2,
      "water"
    );
    this.scene = scene;
    this.row = row;
    this.col = col;
    this.floor = floor;
    this.initialLevel = initialFillLevel;
    this.level = initialFillLevel;
    this.waterMap = new Map();
    this.alpha = 0;

    this.setOrigin(0.5, 0.5);
    this.setDepth(row + floor);

    const { allWaterFlows } = this.scene;
    allWaterFlows[this.floor].set(`${row},${col}`, this);

    this.scene.add.existing(this);
  }
  update() {
    const {
      allWalls,
      allCrates,
      floorHeight: maxLevel,
      colCount,
      rowCount,
    } = this.scene;
    const visited = new Set();

    this.currentCapacityFilled = this.waterMap.size * this.level;

    let animating = false;
    const findFlow = (row: number, col: number) => {
      if (row <= 0 || row >= rowCount) return;
      if (col <= 0 || col >= rowCount) return;
      const { top, left, bottom, right } = getAdjacentTiles(row, col);

      const adjacentTiles = {
        top: {
          wall: allWalls.get(`${top.row},${top.col}`),
          crate: allCrates[this.floor].get(`${top.row},${top.col}`),
          water: this.waterMap.get(`${top.row},${top.col}`),
        },
        bottom: {
          wall: allWalls.get(`${bottom.row},${bottom.col}`),
          crate: allCrates[this.floor].get(`${bottom.row},${bottom.col}`),
          water: this.waterMap.get(`${bottom.row},${bottom.col}`),
        },
        left: {
          wall: allWalls.get(`${left.row},${left.col}`),
          crate: allCrates[this.floor].get(`${left.row},${left.col}`),
          water: this.waterMap.get(`${left.row},${left.col}`),
        },
        right: {
          wall: allWalls.get(`${right.row},${right.col}`),
          crate: allCrates[this.floor].get(`${right.row},${right.col}`),
          water: this.waterMap.get(`${right.row},${right.col}`),
        },
      };

      for (const [side, tile] of Object.entries(adjacentTiles)) {
        let aRow = row;
        let aCol = col;
        if (aRow <= 0 || aRow >= rowCount) return;
        if (aCol <= 0 || aCol >= rowCount) return;
        if (side === "top") aRow--;
        else if (side === "bottom") aRow++;
        else if (side === "left") aCol--;
        else if (side === "right") aCol++;
        const aPos = `${aRow},${aCol}`;
        if (visited.has(aPos)) continue;
        if (tile.wall) {
          //Water contained by wall or crate
          visited.add(aPos);
          continue;
        } else if (tile.crate) {
          if (tile.water) {
            tile.water.remove();
            this.waterMap.delete(aPos);
          }
          visited.add(aPos);
          continue;
        } else if (!tile.wall && !tile.crate && !tile.water) {
          const direction = cardinalToDirection(side as Cardinal);
          const water = new Water(
            this.scene,
            aRow,
            aCol,
            this.floor,
            !this.initialLevelMet ? this.initialLevel : this.level,
            !this.initialLevelMet ? "in" : direction
          );
          this.waterMap.set(aPos, water);
          visited.add(aPos);
          if (!this.initialLevelMet) {
            findFlow(aRow, aCol);
            continue;
          }
          return;
        } else if (tile.water) {
          if (tile.water.animating) {
            animating = true;
            //If tile is animating, its basically a wall, and we'll wait for the animation to finish.
            visited.add(aPos);
            return;
          }

          //Update water tile to current
          if (!this.initialLevelMet) tile.water.level = this.initialLevel;
          else tile.water.level = this.level;
          tile.water.update();
          visited.add(aPos);
          findFlow(tile.water.row, tile.water.col);
        }
      }
    };
    findFlow(this.row, this.col);
    if (animating) return;

    if (!this.initialLevelMet) {
      this.initialLevelMet = true;
      return;
    }

    this.capacity = this.waterMap.size * maxLevel;
    this.level = (this.currentCapacityFilled / this.capacity) * maxLevel;

    console.log(this.currentCapacityFilled, "of", this.capacity, "filled");
    console.log(
      "Waterlevel:",
      this.level,
      "flowing in",
      this.waterMap.size,
      "tiles"
    );
    if (!Math.floor(this.level)) this.remove();
  }

  merge() {
    //Two waterflows intersect and become one
  }
  increase() {
    this.currentCapacityFilled++;
  }
  decrease() {
    this.currentCapacityFilled--;
  }
  remove() {
    for (const [pos, waterTile] of this.waterMap) {
      this.waterMap.delete(pos);
      waterTile.remove();
    }
    this.scene.allWaterFlows[this.floor].delete(`${this.row},${this.col}`);

    this.destroy();
    //Destroy current flow
  }
}
