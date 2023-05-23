import MainScene from "../../scenes/MainScene";
import { Cardinal, Direction } from "../../types";
import { getOppositeSide } from "../../utils/opposite";
import { allCardinalsUndefined } from "../../utils/constants";
import prepareMovement from "./movement/prepare-movement";
import makeMove from "./movement/make-move";
import Laser from "../Laser/laser";
import Explosion from "../explosion";

class Crate extends Phaser.GameObjects.Sprite {
  scene: MainScene;
  shadow!: Phaser.GameObjects.Image;
  sheetLength = 5;
  z = 0;
  floor = 0;
  stringValue = "";
  isResetToOrigin = false;
  isMoving = false;
  isFalling = false;
  crateType!: "Wood" | "Metal" | "Deflector" | "Explosive" | "Nuke" | "Key";
  item: "Key" | "None" = "None";
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
    above?: Crate | undefined;
    below?: Crate | undefined;
  };
  connectedTo!: {
    top: Crate | undefined;
    bottom: Crate | undefined;
    left: Crate | undefined;
    right: Crate | undefined;
    above?: Crate | undefined;
    below?: Crate | undefined;
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
    frame: { row: number; col: number },
    row: number,
    col: number,
    floor: number,
    x: number,
    y: number,
    connectBlocks: boolean
  ) {
    super(scene as MainScene, x, y, "crates", frame.row * 5 + frame.col);
    this.scene = scene;
    this.setOrigin(0.5, 0.5);
    this.name = crateType;
    this.crateType = crateType;
    this.row = row;
    this.col = col;
    this.floor = floor;
    this.origin = {
      row,
      col,
      x: x + scene.cellWidth / 2,
      y: y + 4 - this.floor * scene.floorHeight,
    };
    this.y = y + 4 - this.floor * scene.floorHeight;
    this.x = x + scene.cellWidth / 2;
    this.shadow = scene.add.sprite(
      this.x + scene.shadowOffset.x,
      this.y + scene.shadowOffset.y,
      "crates"
    );
    this.setHP();
    this.connectedTo = Object.assign({}, allCardinalsUndefined);
    this.adjacentCrates = Object.assign({}, allCardinalsUndefined);

    this.setDepth(1);
    this.generateShadow();

    //TODO One big shadow, depending on verticality of shape

    //ANCHOR HOVER events
    this.setInteractive();
    this.on("pointerover", () => {
      this.scene.events.emit("Pointing at", this);
    });
    this.on("pointerout", () => {
      if (this.scene.hover.object === this) {
        this.scene.hover.object = null;
      }
    });

    const { allCrates } = this.scene;
    allCrates[this.floor].set(`${row},${col}`, this);

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
      this.col,
      "floor:",
      this.floor
    );
  }
  generateShadow() {
    const { shadowOffset } = this.scene;
    this.shadow.x = this.x + shadowOffset.x;
    this.shadow.y = this.y + shadowOffset.y;

    this.shadow.alpha = 0.25;
    this.shadow.setTint(0x000000);
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

    const amount = this.sheetLength;
    let row = 0;
    if (this.crateType === "Wood") row = 0;
    if (this.crateType === "Metal") row = 1;
    if (shape.size === 2) {
      if (this.connectedTo.right) {
        this.setFrame(row * amount + 1);
        this.connectedTo.right.setFrame(row * amount + 2);
      } else if (this.connectedTo.left) {
        this.connectedTo.left.setFrame(row * amount + 1);
        this.setFrame(row * amount + 2);
      } else if (this.connectedTo.top) {
        this.connectedTo.top.setFrame(row * amount + 3);
        this.setFrame(row * amount + 4);
      } else if (this.connectedTo.bottom) {
        this.connectedTo.bottom.setFrame(row * amount + 4);
        this.setFrame(row * amount + 3);
      }
    } else if (shape.size === 1) {
      this.setFrame(row * amount);
    }

    console.log("New shape consists of", shape.size, "pieces");
    this.shape = shape;
  }

  update() {
    const { allCrates, resetAll, player } = this.scene;

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

      return;
    }
    this.shadow.setDepth(this.row + this.floor);
    this.generateShadow();
    this.setDepth(this.row + this.floor);

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
      top: allCrates[this.floor].get(`${top.row},${top.col}`),
      bottom: allCrates[this.floor].get(`${bottom.row},${bottom.col}`),
      right: allCrates[this.floor].get(`${right.row},${right.col}`),
      left: allCrates[this.floor].get(`${left.row},${left.col}`),
      above: allCrates[this.floor + 1].get(`${this.row},${this.col}`),
      below: allCrates[this.floor - 1]
        ? allCrates[this.floor - 1].get(`${this.row},${this.col}`)
        : undefined,
    };
    for (const [side, crate] of Object.entries(this.adjacentCrates)) {
      if (this.connectedTo[side as Cardinal] && !crate) {
        this.connectedTo[side as Cardinal] = undefined;
        this.connectShape();
      }
    }
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
    const { cellWidth, cellHeight } = this.scene;

    explodingTiles.add(`${this.row},${this.col}`);
    for (const [pos, tile] of Object.entries(this.adjacent)) {
      if (explodingTiles.has(`${tile.row},${tile.col}`)) continue;

      const crate = this.adjacentCrates[pos as Cardinal];
      if (crate && crate.active && crate.crateType === "Explosive") continue;
      new Explosion(
        this.scene,
        tile.col * cellWidth + cellWidth / 2,
        tile.row * cellHeight + cellHeight / 2,
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

    if (!this.scene) return;

    const { allCrates, portals } = this.scene;
    for (const [type, portal] of Object.entries(portals)) {
      if (!portal) continue;
      if (portal.row === this.row && portal.col === this.col) {
        portal.remove();
      }
    }

    for (const [pos, crate] of allCrates[this.floor]) {
      if (crate === this) {
        allCrates[this.floor].delete(pos);
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

    if (this.adjacentCrates.above) this.adjacentCrates.above.remove();

    this.shadow.destroy();
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
