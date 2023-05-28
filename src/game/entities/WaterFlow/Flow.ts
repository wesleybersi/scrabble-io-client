import MainScene from "../../scenes/Main/MainScene";
import Water from "./water";
import { Cardinal } from "../../types";
import {
  cardinalToDirection,
  getAdjacentTiles,
} from "../../utils/helper-functions";

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
  drainCount = 0;
  raiseCount = 0;
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
    // this.setDepth(row + floor);

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

    let count = 0;
    const animatingWater: Water[] = [];

    let animating = false;
    const findFlow = (row: number, col: number) => {
      if (row <= 0 || row >= rowCount) return;
      if (col <= 0 || col >= rowCount) return;
      count++;
      const { top, left, bottom, right } = getAdjacentTiles(row, col);

      const adjacentTiles = {
        top: {
          wall: allWalls[this.floor].get(`${top.row},${top.col}`),
          crate: allCrates[this.floor].get(`${top.row},${top.col}`),
          water: this.waterMap.get(`${top.row},${top.col}`),
        },
        bottom: {
          wall: allWalls[this.floor].get(`${bottom.row},${bottom.col}`),
          crate: allCrates[this.floor].get(`${bottom.row},${bottom.col}`),
          water: this.waterMap.get(`${bottom.row},${bottom.col}`),
        },
        left: {
          wall: allWalls[this.floor].get(`${left.row},${left.col}`),
          crate: allCrates[this.floor].get(`${left.row},${left.col}`),
          water: this.waterMap.get(`${left.row},${left.col}`),
        },
        right: {
          wall: allWalls[this.floor].get(`${right.row},${right.col}`),
          crate: allCrates[this.floor].get(`${right.row},${right.col}`),
          water: this.waterMap.get(`${right.row},${right.col}`),
        },
      };

      //TODO

      for (const [side, tile] of Object.entries(adjacentTiles)) {
        if (tile.crate && tile.crate.crateType.includes("Pillar")) {
          tile.crate = undefined;
        }
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
        } else if (tile.crate && !tile.crate.crateType.includes("Pillar")) {
          if (tile.water) {
            tile.water.remove();
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
            !this.initialLevelMet ? "in" : direction,
            this.waterMap
          );

          this.waterMap.set(aPos, water);
          visited.add(aPos);

          //TODO Its own function
          //If down or up
          //Check left right from aPos
          //If left or right
          //Check down and up from aPos
          //If so, add diagonal animations, and add to visited

          if (!this.initialLevelMet) {
            findFlow(aRow, aCol);
            continue;
          }
          return;
        } else if (tile.water) {
          if (tile.water.isBeingDrained) {
            //If water is on top of drain;
            this.currentCapacityFilled -= 1;
          }

          if (tile.water.animating) {
            animatingWater.push(tile.water);
            animating = true;
            //If tile is animating, its basically a wall, and we'll wait for the animation to finish.
            //TODO Multiple animations at once
            visited.add(aPos);
            break;
          }

          //Update water tile to current
          if (!this.initialLevelMet) tile.water.level = this.initialLevel;
          else tile.water.level = this.level;
          tile.water.update();
          visited.add(aPos);

          if (!tile.water.isBeingDrained) {
            findFlow(tile.water.row, tile.water.col);
          }
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

    //Drain and raise if neccesary
    if (this.raiseCount) this.currentCapacityFilled += this.raiseCount;
    if (this.drainCount) this.currentCapacityFilled -= this.drainCount;

    // console.log(
    //   Math.floor(this.currentCapacityFilled),
    //   "of",
    //   this.capacity,
    //   "filled"
    // );
    // console.log(
    //   "Waterlevel:",
    //   this.level,
    //   "flowing in",
    //   this.waterMap.size,
    //   "tiles"
    // );
    this.scene.events.emit("Water Flowing", this.waterMap, animatingWater);
    if (!Math.floor(this.level)) this.remove();
  }
  split() {
    //Create new waterflow when divided
  }

  merge() {
    //Two waterflows intersect and become one
  }

  remove() {
    console.log("Water completely drained");
    for (const [pos, waterTile] of this.waterMap) {
      this.waterMap.delete(pos);
      waterTile.remove();
    }
    this.scene.allWaterFlows[this.floor].delete(`${this.row},${this.col}`);

    this.destroy();
    //Destroy current flow
  }
}
