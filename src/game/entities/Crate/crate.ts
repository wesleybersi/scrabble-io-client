import MainScene from "../../scenes/MainScene";
import { Cardinal, Direction } from "../../types";
import { getOppositeSide } from "../../utils/opposite";
import { allCardinalsUndefined } from "../../utils/constants";
import prepareMovement from "./movement/prepare-movement";
import makeMove from "./movement/make-move";
import Laser from "../Laser/laser";
import Explosion from "../explosion";
import Spikes from "../spikes";

class Crate extends Phaser.GameObjects.Sprite {
  scene: MainScene;
  stringValue = "";
  isResetToOrigin = false;
  isMoving = false;
  isFalling = false;
  crateType!: "Wood" | "Metal" | "Deflector" | "Explosive" | "Nuke" | "Key";
  item: "Key" | "None" = "None";
  extension: {
    top: Spikes | null;
    right: Spikes | null;
    bottom: Spikes | null;
    left: Spikes | null;
  } = { top: null, right: null, bottom: null, left: null };
  direction!: Direction;
  weight = 1;
  row!: number;
  col!: number;
  origin: { row: number; col: number; x: number; y: number };
  target!: { row: number; col: number; x: number; y: number } | null;
  hp!: number;
  adjacent!: {
    top: { row: number; col: number };
    bottom: { row: number; col: number };
    left: { row: number; col: number };
    right: { row: number; col: number };
  };
  adjacentCrates!: {
    top: Crate | undefined;
    bottom: Crate | undefined;
    left: Crate | undefined;
    right: Crate | undefined;
  };
  connectedTo!: {
    top: Crate | undefined;
    bottom: Crate | undefined;
    left: Crate | undefined;
    right: Crate | undefined;
  };
  autoConnect = {
    top: false,
    bottom: false,
    left: false,
    right: false,
  };
  shape: Set<Crate> = new Set([this]);
  movementTween!: Phaser.Tweens.Tween;
  portalTrigger!: {
    direction: Direction;
    entering: "a" | "b";
    exiting: "a" | "b";
    isConnected: { back: boolean; forward: boolean };
    from: { row: number; col: number };
    to: { row: number; col: number };
  } | null;
  isBlockingLaser: Map<string, Laser> = new Map();
  constructor(
    scene: MainScene,
    crateType: "Wood" | "Metal" | "Deflector" | "Explosive" | "Nuke",
    frame: number,
    row: number,
    col: number,
    x: number,
    y: number,
    connectBlocks: boolean
  ) {
    super(scene as MainScene, x, y, "crates", frame);
    this.scene = scene;
    this.setOrigin(0.5, 0.5);
    this.name = "Crate";
    this.crateType = crateType;
    this.row = row;
    this.col = col;
    this.origin = {
      row,
      col,
      x: x + scene.cellSize / 2,
      y: y + scene.cellSize / 2,
    };
    this.y = y + scene.cellSize / 2;
    this.x = x + scene.cellSize / 2;
    this.setHP();
    this.connectedTo = Object.assign({}, allCardinalsUndefined);
    this.adjacentCrates = Object.assign({}, allCardinalsUndefined);
    this.setSpikes();
    this.setDepth(1);

    const { allCrates } = this.scene;
    allCrates.set(`${row},${col}`, this);

    if (connectBlocks) {
      this.connectShape();
    }

    this.scene.add.existing(this);

    //Save data.
    this.stringValue = JSON.stringify({
      crateType,
      frame,
      row,
      col,
      x,
      y,
      connectBlocks,
    });

    console.log(
      "New",
      Object.getPrototypeOf(this).constructor.name,
      "at",
      9,
      "row:",
      this.row,
      "col:",
      this.col
    );
  }
  setSpikes() {
    const spikes = {
      top: Math.floor(Math.random() * 50) === 1,
      bottom: Math.floor(Math.random() * 50) === 1,
      left: Math.floor(Math.random() * 50) === 1,
      right: Math.floor(Math.random() * 50) === 1,
    };

    if (spikes.top) {
      this.extension.top = new Spikes(
        this.scene,
        this.x,
        this.y,
        this.row,
        this.col,
        "up"
      );
    }
    if (spikes.bottom) {
      this.extension.bottom = new Spikes(
        this.scene,
        this.x,
        this.y,
        this.row,
        this.col,
        "down"
      );
    }
    if (spikes.left) {
      this.extension.left = new Spikes(
        this.scene,
        this.x,
        this.y,
        this.row,
        this.col,
        "left"
      );
    }
    if (spikes.right) {
      this.extension.right = new Spikes(
        this.scene,
        this.x,
        this.y,
        this.row,
        this.col,
        "right"
      );
    }
  }
  setHP(): void {
    switch (this.crateType) {
      case "Wood":
        this.hp = 25;
        break;
      case "Metal":
        this.hp = Infinity;
        this.weight = 1.5;
        break;
      case "Deflector":
        this.hp = Infinity;
        break;
      case "Explosive":
        this.hp = 16;
        break;
      case "Nuke":
        this.hp = 16;
        break;
    }
  }
  connectShape(at?: "top" | "bottom" | "left" | "right") {
    //Connects all adjacent crates, or if specified, one adjacent crate.
    const shape = this.shape;

    for (const [side, crate] of Object.entries(this.adjacentCrates)) {
      if (at && at !== side) continue;
      if (!crate || !crate.active) continue;
      if (crate && crate.crateType !== this.crateType) continue;
      for (const part of Array.from(crate.shape)) {
        shape.add(part);
      }
      crate.connectedTo[getOppositeSide(side as Cardinal)] = this;
      this.connectedTo[side as Cardinal] = crate;
    }
    for (const crate of shape) {
      crate.shape = shape;
    }

    // if (shape.size === 2) {
    //   if (this.crateType === "Wood") {
    //     const r = Math.floor(Math.random() * 2);
    //     if (this.connectedTo.right) {
    //       this.setFrame(r ? 8 : 10);
    //       this.connectedTo.right.setFrame(r ? 9 : 11);
    //     }
    //     if (this.connectedTo.left) {
    //       this.connectedTo.left.setFrame(r ? 8 : 10);
    //       this.setFrame(r ? 9 : 11);
    //     }
    //   }
    // }

    console.log("New shape consists of", shape.size, "pieces");
    this.shape = shape;
  }

  update() {
    const { allCrates, resetAll } = this.scene;

    if (resetAll) {
      //TODO - Method that resets to original state. Or remembers it at the start.
      //Reset crate to original state
      this.alpha = 1;

      this.setActive(true);
      this.setHP();

      this.row = this.origin.row;
      this.col = this.origin.col;
      this.y = this.origin.y;
      this.x = this.origin.x;
    }

    if (!this.active) {
      this.alpha = 0;
      for (const [side, spikes] of Object.entries(this.extension)) {
        if (spikes) {
          spikes.alpha = 0;
        }
      }
      return;
    } else {
      for (const [side, spikes] of Object.entries(this.extension)) {
        if (spikes) {
          spikes.update(this.x, this.y);
        }
      }
    }

    if (this.isMoving) return;

    if (this.hp <= 0) {
      if (this.crateType === "Explosive") {
        this.explode();
        this.hp = 0;
      } else {
        this.setActive(false);
      }
      return;
    }

    this.adjacent = {
      top: { row: this.row - 1, col: this.col },
      bottom: { row: this.row + 1, col: this.col },
      right: { row: this.row, col: this.col + 1 },
      left: { row: this.row, col: this.col - 1 },
    };

    const { top, bottom, right, left } = this.adjacent;

    this.adjacentCrates = {
      top: allCrates.get(`${top.row},${top.col}`),
      bottom: allCrates.get(`${bottom.row},${bottom.col}`),
      right: allCrates.get(`${right.row},${right.col}`),
      left: allCrates.get(`${left.row},${left.col}`),
    };
  }

  prepareMovement(direction: Direction) {
    return prepareMovement(this, direction);
  }

  makeMove(
    direction: Direction,
    allIncluded: Set<Crate>,
    duration: number,
    completed: Set<Crate>
  ) {
    makeMove(this, direction, allIncluded, duration, completed);
  }
  explode(explodingTiles: Set<string> = new Set()) {
    const { cellSize } = this.scene;

    explodingTiles.add(`${this.row},${this.col}`);
    for (const [pos, tile] of Object.entries(this.adjacent)) {
      if (explodingTiles.has(`${tile.row},${tile.col}`)) continue;

      const crate = this.adjacentCrates[pos as Cardinal];
      if (crate && crate.active && crate.crateType === "Explosive") continue;
      new Explosion(
        this.scene,
        tile.col * cellSize + cellSize / 2,
        tile.row * cellSize + cellSize / 2,
        tile.row,
        tile.col
      );
      explodingTiles.add(`${tile.row},${tile.col}`);
    }

    new Explosion(this.scene, this.x, this.y, this.row, this.col);

    for (const [pos, tile] of Object.entries(this.adjacentCrates)) {
      if (!tile) continue;
      if (tile && !tile.active) continue;
      if (explodingTiles.has(`${tile.row},${tile.col}`)) continue;
      if (tile?.crateType === "Explosive") {
        tile.explode(explodingTiles);
      }
    }
  }

  remove() {
    //Can only be removed in editor
    const { allCrates, portals } = this.scene;
    for (const [type, portal] of Object.entries(portals)) {
      if (!portal) continue;
      if (portal.row === this.row && portal.col === this.col) {
        portal.remove();
      }
    }

    for (const [side, spikes] of Object.entries(this.extension)) {
      if (spikes) {
        spikes.destroy();
      }
    }

    //Update and split shapes if need be
    const shape = Array.from(this.shape);
    for (const crate of shape) {
      crate.shape.delete(this);
    }
    for (const crate of shape) {
      crate.connectShape();
    }

    for (const [pos, crate] of allCrates) {
      if (crate === this) {
        allCrates.delete(pos);
      }
    }

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

export default Crate;
