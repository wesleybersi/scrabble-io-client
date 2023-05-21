import Portal from "../portal";
import Crosshair from "../crosshair";
import MainScene from "../../scenes/MainScene";
// import placePortal from "./portals/placePortal";
import { Clone } from "./clone";
import { Cardinal, Direction } from "../../types";
import {
  cardinalToDirection,
  directionToAngle,
  getOppositeSide,
} from "../../utils/opposite";
import { allCardinalsNull } from "../../utils/constants";
import resetPortals from "./portals/resetPortals";
import { portalRemoved } from "./portals/resetPortals";
import Crate from "../Crate/crate";
import { allDirectionsFalse } from "../../utils/constants";
import Entrance from "./entrance";

//Methods
import handleMovement from "./movement/move";

export class Player extends Phaser.GameObjects.Sprite {
  scene: MainScene;
  hasReset = false;
  highlight!: Phaser.GameObjects.Graphics;
  initialMoveDuration = 200;
  moveDuration = 200;
  crosshair!: Crosshair;
  moving = { left: false, right: false, up: false, down: false };
  forceMovement = { left: false, right: false, up: false, down: false };
  lastMove: Direction = "up";
  state:
    | "Idle"
    | "Moving"
    | "Sliding"
    | "Pushing"
    | "Holding"
    | "Pulling"
    | "Swimming"
    | "Falling"
    | "Dead"
    | "Disabled"
    | "Editing" = "Idle";
  row: number;
  col: number;
  origin: { row: number; col: number };
  startTile: Entrance;
  portalClone!: Clone | null;
  portalReflection!: {
    clone: Clone | null;
    from: { row: number; col: number };
    to: { row: number; col: number };
    movementType: "In" | "Out";
    inFront: boolean;
    portal: Portal;
  } | null;
  removePortals = false;
  ease = "Linear";
  adjacentTiles!: {
    top: { row: number; col: number };
    right: { row: number; col: number };
    bottom: { row: number; col: number };
    left: { row: number; col: number };
  };
  holding!: {
    top: Crate | null;
    right: Crate | null;
    bottom: Crate | null;
    left: Crate | null;
  };
  isSliding = false;
  isOily = false;
  spiked = false;
  deadCounter = 0;
  constructor(scene: MainScene, x: number, y: number) {
    super(scene as MainScene, x, y, "player", 0);
    this.scene = scene;
    this.name = "Player";
    this.portalClone = null;
    this.portalReflection = null;
    this.row = Math.floor(y - scene.cellSize / 2) / scene.cellSize;
    this.col = Math.floor(x - scene.cellSize / 2) / scene.cellSize;
    this.startTile = new Entrance(scene, this.row, this.col);
    this.origin = { row: this.row, col: this.col };
    this.holding = { top: null, right: null, bottom: null, left: null };
    this.adjacentTiles = {
      top: { row: this.row - 1, col: this.col },
      right: { row: this.row, col: this.col + 1 },
      bottom: { row: this.row + 1, col: this.col },
      left: { row: this.row, col: this.col - 1 },
    };
    this.highlight = scene.add.graphics();
    this.enableMovement();
    this.setDepth(1);
    this.setOrigin(0.5);
    this.createAnimations();

    scene.add.existing(this);
    this.crosshair = new Crosshair(scene, this);
  }
  enableMovement() {
    this.scene.input.keyboard?.on("keydown", (event: KeyboardEvent) => {
      if (this.state === "Dead") return;
      switch (event.key) {
        case "r": {
          const { portals } = this.scene;
          if (portals.a || portals.b) this.resetPortals();
        }
      }
      for (const [direction, movementForced] of Object.entries(
        this.forceMovement
      )) {
        if (this.scene.editor.enabled || movementForced) return;
      }

      switch (event.key) {
        case "W":
        case "w":
        case "ArrowUp":
          this.moving.up = true;
          this.lastMove = "up";
          this.move();
          break;
        case "A":
        case "a":
        case "ArrowLeft":
          this.moving.left = true;
          this.lastMove = "left";
          this.move();
          break;
        case "S":
        case "s":
        case "ArrowDown":
          this.moving.down = true;
          this.lastMove = "down";
          this.move();
          break;
        case "D":
        case "d":
        case "ArrowRight":
          this.moving.right = true;
          this.lastMove = "right";
          this.move();
          break;
      }
    });
    this.scene.input.keyboard?.on("keyup", (event: KeyboardEvent) => {
      switch (event.key) {
        case "W":
        case "w":
        case "ArrowUp":
          this.moving.up = false;

          break;
        case "A":
        case "a":
        case "ArrowLeft":
          this.moving.left = false;
          break;
        case "S":
        case "s":
        case "ArrowDown":
          this.moving.down = false;
          break;
        case "D":
        case "d":
        case "ArrowRight":
          this.moving.right = false;
          break;
      }
    });
    this.scene.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      if (this.scene.editor.enabled) return;
      this.placePortal(pointer.rightButtonDown() ? "b" : "a");

      if (pointer.rightButtonDown()) {
        const { allCrates, tilemap } = this.scene;
        const { walls } = tilemap;

        console.log(this.angle);
        if (this.angle === 0) {
          const recurseUp = (row: number, col: number) => {
            const pos = `${row},${col}`;
            const crate = allCrates.get(pos);
            const wall = walls.getTileAt(col, row);
            if (wall) return;
            if (crate && crate.active) {
              crate.connectShape("top");
            }
            recurseUp(row - 1, col);
          };
          recurseUp(this.row - 1, this.col);
        }
        if (this.angle === 180) {
          const recurseDown = (row: number, col: number) => {
            const pos = `${row},${col}`;
            const crate = allCrates.get(pos);
            const wall = walls.getTileAt(col, row);
            if (wall) return;
            if (crate && crate.active) {
              crate.connectShape("bottom");
            }
            recurseDown(row + 1, col);
          };
          recurseDown(this.row + 1, this.col);
        }
        if (this.angle === 90) {
          const recurseLeft = (row: number, col: number) => {
            const pos = `${row},${col}`;
            const crate = allCrates.get(pos);
            const wall = walls.getTileAt(col, row);
            if (wall) return;
            if (crate && crate.active) {
              crate.connectShape("right");
            }
            recurseLeft(row, col + 1);
          };
          recurseLeft(this.row, this.col + 1);
        }
        if (this.angle === -90) {
          const recurseLeft = (row: number, col: number) => {
            const pos = `${row},${col}`;
            const crate = allCrates.get(pos);
            const wall = walls.getTileAt(col, row);
            if (wall) return;
            if (crate && crate.active) {
              crate.connectShape("left");
            }
            recurseLeft(row, col - 1);
          };
          recurseLeft(this.row, this.col - 1);
        }

        return;
      }

      const { hover, allCrates } = this.scene;

      for (const [side, adjacent] of Object.entries(this.adjacentTiles)) {
        if (adjacent.row === hover.row && adjacent.col === hover.col) {
          const crate = allCrates.get(`${hover.row},${hover.col}`);
          if (crate && crate.active) {
            const oppositeSide = getOppositeSide(side as Cardinal);
            if (crate.extension[oppositeSide]) return;

            this.holding[side as Cardinal] = crate;
            this.state = "Holding";
            return;
          }
        }
      }
    });
    this.scene.input.on("pointerup", (pointer: Phaser.Input.Pointer) => {
      if (this.state === "Holding") {
        this.state = "Idle";
      }
      this.holding = Object.assign({}, allCardinalsNull);
    });
  }

  createAnimations() {
    this.anims.create({
      key: "Idle",
      frames: [{ key: "player", frame: 0 }],
      frameRate: 1,
      repeat: -1,
    });
    this.anims.create({
      key: "Moving",
      frames: this.anims.generateFrameNumbers("player", { start: 0, end: 3 }),
      frameRate: 12,
      repeat: -1,
    });
    this.anims.create({
      key: "Pushing",
      frames: this.anims.generateFrameNumbers("player", { start: 0, end: 3 }),
      frameRate: 12,
      repeat: -1,
    });
    this.anims.create({
      key: "Pulling",
      frames: this.anims.generateFrameNumbers("player", { start: 0, end: 3 }),
      frameRate: 12,
      repeat: -1,
    });
    this.anims.create({
      key: "Holding",
      frames: this.anims.generateFrameNumbers("player", { start: 0, end: 3 }),
      frameRate: 1,
      repeat: -1,
    });
  }

  move() {
    handleMovement(this);
  }

  place(x: number, y: number) {
    this.row = Math.floor(y - this.scene.cellSize / 2) / this.scene.cellSize;
    this.col = Math.floor(x - this.scene.cellSize / 2) / this.scene.cellSize;
  }

  placePortal(type: "a" | "b") {
    // placePortal(this, type);
  }
  portalRemoved() {
    portalRemoved(this);
  }
  resetPortals() {
    resetPortals(this);
  }

  resetToOrigin() {
    const { cellSize } = this.scene;

    this.row = this.origin.row;
    this.col = this.origin.col;
    this.x = this.origin.col * cellSize + cellSize / 2;
    this.y = this.origin.row * cellSize + cellSize / 2;
    this.holding = Object.assign({}, allCardinalsNull);
    this.moving = Object.assign({}, allDirectionsFalse);
    this.forceMovement = Object.assign({}, allDirectionsFalse);
    const coolDown = setTimeout(() => {
      this.state = "Idle";
      clearTimeout(coolDown);
    }, 500);
  }

  update() {
    const movementToAngle = (invert?: boolean) => {
      for (const [direction, moving] of Object.entries(this.moving)) {
        if (moving) {
          const angle = directionToAngle(direction as Direction, invert);
          this.animateToAngle(angle);
          return;
        }
      }
      for (const [direction, moving] of Object.entries(this.forceMovement)) {
        if (moving) {
          const angle = directionToAngle(direction as Direction, invert);
          this.animateToAngle(angle, this.state === "Sliding" ? 4 : undefined);
          return;
        }
      }
      const lastAngle = directionToAngle(this.lastMove);
      this.animateToAngle(lastAngle);
    };

    switch (this.state) {
      case "Idle":
        {
          this.deadCounter = 0;
          this.setDepth(2);
          this.alpha = 1;
          this.scene.game.canvas.style.cursor = "auto";
          this.anims.play("Idle");

          const lastAngle = directionToAngle(this.lastMove);
          this.animateToAngle(lastAngle);
          this.hasReset = false;
        }
        break;

      case "Moving":
        if (this.anims.currentAnim?.key !== "Moving") {
          this.anims.play("Moving");
        }
        movementToAngle();
        break;
      case "Sliding":
        this.anims.play("Idle");
        movementToAngle();
        break;
      case "Holding":
        this.scene.game.canvas.style.cursor = "grab";
        this.anims.play("Holding");
        break;
      case "Pushing":
        if (this.anims.currentAnim?.key !== "Pushing") {
          this.anims.play("Pushing");
        }
        movementToAngle();
        break;
      case "Pulling":
        if (this.anims.currentAnim?.key !== "Pulling") {
          this.anims.play("Pulling");
        }
        movementToAngle(true);
        this.scene.game.canvas.style.cursor = "grab";
        break;
      case "Falling":
        movementToAngle();
        break;
      case "Dead":
        console.warn("YOU FUCKING DIED");
        // this.alpha = 0.5;
        this.anims.play("Idle");
        this.deadCounter++;
        if (this.deadCounter > 200) {
          this.resetToOrigin();
        }

        return;
      case "Editing":
        this.resetToOrigin();
        this.forceMovement = Object.assign({}, allDirectionsFalse);
        this.anims.play("Idle");
        this.alpha = 0.65;
        this.setDepth(200);

        break;
    }

    if (
      this.startTile.row !== this.origin.row ||
      this.startTile.col !== this.origin.col
    ) {
      this.startTile.row = this.origin.row;
      this.startTile.col = this.origin.col;
      this.startTile.draw();
    }

    for (const [side, holding] of Object.entries(this.holding)) {
      if (holding) {
        const direction = cardinalToDirection(side as Cardinal);
        this.lastMove = direction;
        const angle = directionToAngle(direction);
        this.animateToAngle(angle);
        break;
      }
    }

    this.adjacentTiles = {
      top: { row: this.row - 1, col: this.col },
      right: { row: this.row, col: this.col + 1 },
      bottom: { row: this.row + 1, col: this.col },
      left: { row: this.row, col: this.col - 1 },
    };
    for (const [type, portal] of Object.entries(this.scene.portals)) {
      if (!portal) break;
      const otherPortal = this.scene.portals[type === "a" ? "b" : "a"];
      if (!otherPortal) break;
      if (portal.targetRow === this.row && portal.targetCol === this.col) {
        if (portal.placement === "top") {
          this.adjacentTiles.top = {
            row: otherPortal.targetRow,
            col: otherPortal.targetCol,
          };
        }
        if (portal.placement === "bottom") {
          this.adjacentTiles.bottom = {
            row: otherPortal.targetRow,
            col: otherPortal.targetCol,
          };
        }
        if (portal.placement === "left") {
          this.adjacentTiles.left = {
            row: otherPortal.targetRow,
            col: otherPortal.targetCol,
          };
        }
        if (portal.placement === "right") {
          this.adjacentTiles.right = {
            row: otherPortal.targetRow,
            col: otherPortal.targetCol,
          };
        }
      }
    }
  }

  animateToAngle(targetAngle: number, rotationSpeed = 16) {
    // Calculate the difference between the angles
    let diff = targetAngle - this.angle;

    // Handle cases where the difference is greater than 180 degrees
    if (diff > 180) {
      diff -= 360;
    } else if (diff < -180) {
      diff += 360;
    }

    if (diff !== 0) {
      // Calculate the rotation direction and amount
      const rotationDir = diff > 0 ? 1 : -1;
      const rotationAmount = Math.min(Math.abs(diff), rotationSpeed);

      // Apply the rotation
      this.angle += rotationDir * rotationAmount;
      this.angle = ((this.angle % 360) + 360) % 360;
    }
  }
}
