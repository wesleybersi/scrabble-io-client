import Block from "./block";
import { Cardinal, Direction } from "../types";
import FloorTileProvider from "./tileProvider";
import {
  getOppositeSide,
  directionToCardinal,
  cardinalToDirection,
  getOppositeDirection,
  directionToAdjacent,
} from "../utils/opposite";
import MainScene from "../scenes/MainScene";
import Laser from "./laser";
import { connected } from "process";
import { isColliding } from "./tilemap/wall-tiles/detect-collision";

class Movable extends Block {
  moving = false;
  direction!: Direction;
  forceMove = { up: false, down: false, left: false, right: false };
  weighth = 150;
  portalTrigger!: {
    direction: Direction;
    entering: "a" | "b";
    exiting: "a" | "b";
    isConnected: { back: boolean; forward: boolean };
    from: { row: number; col: number };
    to: { row: number; col: number };
  } | null;
  isBlockingLaser: Map<string, Laser> = new Map();
  tween!: Phaser.Tweens.Tween;
  constructor(
    scene: MainScene,
    connectBlocks: boolean,
    combiner: boolean,
    row: number,
    col: number,
    x: number,
    y: number,
    isClone?: boolean
  ) {
    super(scene as MainScene, row, col, x, y, combiner, isClone);
    if (!isClone) {
      this.name = "Movable";
      this.combiner = combiner;
      this.direction = "right";
      this.detectAllAdjacentBlocks(connectBlocks);
    }
  }

  prepareMovement(
    direction: Direction,
    movableSet: Set<Movable> = new Set(),
    visitedSet: Set<Movable> = new Set()
  ): {
    allIncluded: Set<Movable>;
    abort: boolean;
    enteringPortal?: Movable;
  } {
    const { portals, tilemap } = this.scene;
    const { walls } = tilemap;

    let enterPortal = false;
    let aborted = false;
    let movingTowards: Cardinal = "top";
    const directTarget = { row: this.row, col: this.col };

    if (direction === "up") {
      movingTowards = "top";
      directTarget.row--;
    } else if (direction === "down") {
      movingTowards = "bottom";
      directTarget.row++;
    } else if (direction === "left") {
      movingTowards = "left";
      directTarget.col--;
    } else if (direction === "right") {
      movingTowards = "right";
      directTarget.col++;
    }

    movableSet.add(this);
    visitedSet.add(this);
    this.detectAllAdjacentBlocks(); //A bit drastic

    if (portals.a && portals.b) {
      enterPortal = this.checkPortal(
        getOppositeSide(directionToCardinal(direction)),
        directTarget.row,
        directTarget.col
      );
    }
    if (!enterPortal) {
      if (isColliding(walls, direction, directTarget.row, directTarget.col)) {
        aborted = true;
      }
    }
    for (const [side, block] of Object.entries(this.adjacentBlocks)) {
      if (aborted) break;
      if (!block) continue;
      //   if (block instanceof Wall) // If connected to piece in portal?

      if (!this.isConnected[side as Cardinal] && movingTowards !== side)
        continue;
      if (block instanceof Movable) {
        movableSet.add(block);

        if (visitedSet.has(block)) {
          continue;
        }
        aborted = block.prepareMovement(
          direction,
          movableSet,
          visitedSet
        ).abort;
        if (aborted) break;
      }
    }

    if (aborted) movableSet.clear();

    return {
      allIncluded: movableSet,
      abort: aborted,
    };
  }

  checkPortal(side: Cardinal, targetRow: number, targetCol: number): boolean {
    const { portals } = this.scene;
    for (const [type, portal] of Object.entries(portals)) {
      const movingTowards = getOppositeSide(side);
      if (!portal) break;

      //If target is portal
      if (portal.row === targetRow && portal.col === targetCol) {
        if (portal.placement === side) {
          const enterPortal = portal;
          const exitPortal = type === "a" ? portals.b : portals.a;
          if (!exitPortal) break;

          if (movingTowards === "top" || movingTowards === "bottom") {
            if (this.isConnected.left || this.isConnected.right) {
              console.log("Shape does not fit portal.");
              return false;
            }
          } else if (movingTowards === "left" || movingTowards === "right") {
            if (this.isConnected.top || this.isConnected.bottom) {
              console.log("Shape does not fit portal.");
              return false;
            }
          }

          if (
            exitPortal.targetRow === this.row &&
            exitPortal.targetCol === this.col
          ) {
            return false;
          }

          this.portalTrigger = {
            direction: cardinalToDirection(exitPortal.placement),
            entering: type === "a" ? "a" : "b",
            exiting: type === "a" ? "b" : "a",
            isConnected: {
              back: this.isConnected[enterPortal.placement],
              forward: this.isConnected[getOppositeSide(enterPortal.placement)],
            },
            from: { row: exitPortal.row, col: exitPortal.col },
            to: { row: exitPortal.targetRow, col: exitPortal.targetCol },
          };
          return true;
        }
      }
    }
    return false;
  }

  move(
    direction: "up" | "down" | "left" | "right",
    allIncluded: Set<Movable>,
    amount: number,
    duration: number,
    completed: Set<Movable>
  ) {
    if (this.moving) return;
    this.moving = true;
    this.direction = direction;

    const { portals, allObjects, cellSize } = this.scene;
    const target = { row: this.row, col: this.col, x: this.x, y: this.y };

    if (direction === "up") {
      target.y -= cellSize;
      target.row--;
    } else if (direction === "down") {
      target.y += cellSize;
      target.row++;
    } else if (direction === "left") {
      target.x -= cellSize;
      target.col--;
    } else if (direction === "right") {
      target.x += cellSize;
      target.col++;
    }

    if (this.portalTrigger) {
      this.enterPortal(duration);
    }
    this.tween = this.scene.tweens.add({
      targets: this,
      x: target.x,
      y: target.y,
      ease: "Linear",
      duration,
      onStart: () => {
        // this.graphic.setDepth(0);
        this.handleLasers(direction, target);
      },
      onComplete: () => {
        let newPos = "";
        if (this.portalTrigger) {
          newPos = `${this.portalTrigger.to.row},${this.portalTrigger.to.col}`;
        } else {
          newPos = `${target.row},${target.col}`;
        }
        allObjects.set(newPos, this);
        // allObjects.set(newPos, this);
        const oldPos = `${this.row},${this.col}`;
        if (allObjects.get(oldPos) === this) {
          allObjects.delete(oldPos);
        }

        if (this.portalTrigger) {
          const { to, isConnected, exiting, entering } = this.portalTrigger;

          this.x = to.col * cellSize;
          this.y = to.row * cellSize;
          this.row = to.row;
          this.col = to.col;

          if (isConnected.back) {
            const enterPortal = portals[entering];
            const exitPortal = portals[exiting];
            if (enterPortal && exitPortal) {
              const enterPlacement = enterPortal.placement;
              const placement = exitPortal.placement;
              const oldConnection = getOppositeSide(enterPlacement);
              const newConnection = getOppositeSide(placement);
              this.isConnected[oldConnection] = false;
              this.isConnected[newConnection] = true;
            }
          }

          this.portalTrigger = null;
        } else {
          this.x = target.x;
          this.y = target.y;
          this.row = target.row;
          this.col = target.col;
        }

        this.moving = false;
        completed.add(this);

        // this.graphic.destroy();
        // this.graphic = this.scene.add.graphics();

        if (completed.size === allIncluded.size) {
          //If last one to complete
          for (const movable of completed) {
            if (!this.portalTrigger) {
              movable.detectAllAdjacentBlocks(movable.combiner);
            }

            movable.setDepth(5);
            const { floor } = this.scene.tilemap;

            const tile = floor.getTileAt(movable.col, movable.row);
            if (tile) {
              if (tile.properties.name === "Void") {
                allObjects.delete(`${movable.row},${movable.col}`);
                movable.x = movable.x + cellSize / 2;
                movable.y = movable.y + cellSize / 2;
                movable.setOrigin(0.5, 0.5);
                movable.setDepth(0);
                const tween = movable.scene.tweens.add({
                  targets: [this],
                  scale: 0,
                  duration: 1500,
                  ease: "Quad.Out",
                  onUpdate: () => {
                    if (tween.progress > 0.5) {
                      movable.setDepth(0);
                    }
                  },
                  onComplete: () => {
                    movable.remove();
                    //TODO Little cartoony white star. Team rocket
                  },
                });
              }
            }

            // const floorTile = allFloorTiles[movable.row][movable.col];
            // if (floorTile) {
            //   switch (floorTile.type) {
            //     case "Water": {
            //       //TODO Function that checks wether all connected blocks are in water
            //       //getShape
            //       movable.floorTileProvider.removeFloorTile(
            //         movable.row,
            //         movable.col
            //       );
            //       movable.remove();

            //       break;
            //     }
            //     case "Ice": {
            //       this.forceMove[direction] = true;
            //       const { allIncluded, abort } =
            //         this.getAllConnected(direction);

            //       const duration = Math.max(
            //         Math.sqrt(allIncluded.size) *
            //           this.scene.player.moveDuration *
            //           1.1,
            //         this.scene.player.moveDuration * 1.25
            //       );

            //       const completed = new Set<Movable>();
            //       for (const moveAlong of allIncluded) {
            //         moveAlong.move(
            //           direction,
            //           allIncluded,
            //           allIncluded.size,
            //           duration,
            //           completed
            //         );
            //       }
            //       this.moveByItself();
            //       break;
            //     }
            //   }
            // }
          }
        }
      },
    });
  }

  handleLasers(direction: Direction, target: { row: number; col: number }) {
    const { allLasers, allObjects } = this.scene;
    for (const [pos, laser] of allLasers) {
      for (const position of laser.occupied) {
        if (position.row === target.row && position.col === target.col) {
          if (this.isBlockingLaser.has(pos)) break;

          if (this.isConnected.right && direction === "right") break;
          if (this.isConnected.left && direction === "left") break;
          if (this.isConnected.top && direction === "up") break;
          if (this.isConnected.bottom && direction === "down") break;

          if (this.isConnected.bottom && laser.direction === "up") break;
          if (this.isConnected.top && laser.direction === "down") break;
          if (this.isConnected.left && laser.direction === "right") break;
          if (this.isConnected.right && laser.direction === "left") break;

          console.log("Moving in sight of laser");
          this.isBlockingLaser.set(pos, laser);
          laser.obstructIn(this, target.row, target.col);
          break;
        }
      }

      if (this.isBlockingLaser.has(pos)) {
        if (laser.direction === direction) {
          console.log("Moving away from laser, but still in its sight");
          laser.obstructOut(this, this.row, this.col);
          continue;
        } else if (laser.direction === getOppositeDirection(direction)) {
          console.log("Moving closer to loser, and still in sight");
          laser.obstructOut(this, target.row, target.col);
          continue;
        }

        let stillBlocking = false;
        for (const position of laser.occupied) {
          if (position.row === target.row && position.col === target.col) {
            console.log("Still blocking laser.");
            stillBlocking = true;
            break;
          }
        }
        if (!stillBlocking) {
          const relevantBlocks = new Set<Movable>();
          relevantBlocks.add(this);
          const getTargeted = (row: number, col: number) => {
            if (!laser.direction) return;

            if (this.isConnected[directionToCardinal(laser.direction)]) {
              const { row: targetRow, col: targetCol } = directionToAdjacent(
                laser.direction,
                row,
                col
              );
              const target = allObjects.get(`${targetRow},${targetCol}`);
              if (target && target instanceof Movable) {
                relevantBlocks.add(target);
                getTargeted(targetRow, targetCol);
              } else {
                return;
              }
            }
          };
          getTargeted(this.row, this.col);

          for (const movable of relevantBlocks) {
            console.log("Repositioning", relevantBlocks.size, "blocks");
            const rowDiff = this.row - target.row;
            const colDiff = this.col - target.col;
            const newRow =
              movable === this ? target.row : movable.row + rowDiff;
            const newCol =
              movable === this ? target.col : movable.col + colDiff;

            let newPos = "";
            if (movable.portalTrigger) {
              newPos = `${movable.portalTrigger.to.row},${movable.portalTrigger.to.col}`;
            } else {
              newPos = `${newRow},${newCol}`;
            }
            allObjects.set(newPos, movable);

            const oldPos = `${movable.row},${movable.col}`;
            if (allObjects.get(oldPos) === movable) {
              allObjects.delete(oldPos);
            }
          }

          console.log("Moving out of sight of laser.");
          this.isBlockingLaser.delete(pos);

          let connected = false;
          if (
            this.isConnected[getOppositeSide(directionToCardinal(direction))]
          ) {
            connected = true;
          }
          laser.obstructOut(
            this,
            this.row,
            this.col,
            connected ? true : undefined
          );
        }
      }
    }
  }

  getShape(): Set<Movable> {
    // for (const [side,connected] of Object.entries(this.isConnected)){
    //   if (connected){
    //     this.adjacentBlocks[side]
    //   }
    // }
    return new Set();
  }

  moveByItself() {
    console.log("This code has not yet been written :-(");
  }

  enterPortal(duration: number) {
    if (!this.portalTrigger) return;

    //Eventually turn new Player into new Clone. Right now fuck it.
    const { cellSize, allObjects, portals } = this.scene;
    const clone = new Movable(
      this.scene as MainScene,
      false,
      this.combiner,
      this.portalTrigger.from.row,
      this.portalTrigger.from.col,
      this.portalTrigger.from.col * cellSize,
      this.portalTrigger.from.row * cellSize,
      true
    );

    const { isConnected, entering, exiting } = this.portalTrigger;
    if (isConnected.back || isConnected.forward) {
      const enterPortal = portals[entering];
      const exitPortal = portals[exiting];
      if (enterPortal && exitPortal) {
        const enterPlacement = enterPortal.placement;
        const exitPlacement = exitPortal.placement;
        const oldConnection = getOppositeSide(enterPlacement);
        const newConnection = getOppositeSide(exitPlacement);
        if (isConnected.back) {
          console.log(oldConnection, "removed");
          console.log(newConnection, "added");
          clone.isConnected[oldConnection] = false;
          clone.isConnected[newConnection] = true;
        }
        if (isConnected.forward) {
          console.log(exitPlacement, "added");
          clone.isConnected[exitPlacement] = true;
          const objectOnExit = allObjects.get(
            `${exitPortal.targetRow},${exitPortal.targetCol}`
          );
          if (objectOnExit && objectOnExit instanceof Block) {
            console.log("Exit object:", objectOnExit);
            objectOnExit.isConnected[newConnection] = true;
          }
        }
      }
    }

    const target = { row: this.row, col: this.col, x: this.x, y: this.y };
    const direction = this.portalTrigger.direction;

    if (direction === "up") {
      target.y -= cellSize;
      target.row--;
    } else if (direction === "down") {
      target.y += cellSize;
      target.row++;
    } else if (direction === "left") {
      target.x -= cellSize;
      target.col--;
    } else if (direction === "right") {
      target.x += cellSize;
      target.col++;
    }

    clone.moving = true;
    clone.setDepth(0);
    this.scene.tweens.add({
      targets: clone,
      x: target.x,
      y: target.y,
      ease: "Linear",
      duration,

      onComplete: () => {
        clone.destroy();
      },
    });
  }
}

export default Movable;
