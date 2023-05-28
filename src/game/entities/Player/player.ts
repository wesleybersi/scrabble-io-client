import Portal from "../portal";
import Wall from "../Wall/wall";
import MainScene from "../../scenes/Main/MainScene";
import { Clone } from "./clone";
import { Cardinal2D, Direction } from "../../types";
import {
  cardinalToDirection,
  directionToCardinal,
  getOppositeDirection,
} from "../../utils/helper-functions";
import { allCardinalsNull, allDirectionsFalse } from "../../utils/constants";
import resetPortals from "./portals/resetPortals";
import { portalRemoved } from "./portals/resetPortals";
import Crate from "../Crate/crate";
import LadderPiece from "../Wall/ladder";
//Methods
import handleMovement from "./movement/move";

export class Player extends Phaser.GameObjects.Sprite {
  scene: MainScene;
  shadow!: Phaser.GameObjects.Sprite;
  shadowMask!: Phaser.GameObjects.Graphics;
  z = 0;
  floor = 0;
  hasReset = false;
  highlight!: Phaser.GameObjects.Graphics;
  initialMoveDuration = 200;
  moveDuration = 200;
  moving = { left: false, right: false, up: false, down: false };
  forceMovement = { left: false, right: false, up: false, down: false };
  lastMove: Direction = "up";
  wallBelow: Wall | undefined;
  state:
    | "Idle"
    | "Moving"
    | "Climbing"
    | "Sliding"
    | "Pushing"
    | "Holding"
    | "Pulling"
    | "Swimming"
    | "Falling"
    | "Dead"
    | "Disabled"
    | "Editing" = "Idle";
  enterLadder = false;
  exitLadder = false;
  ladderMovement: "up" | "down" = "up";
  ladder: LadderPiece[] | null = null;
  row: number;
  col: number;
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
  facing: "up" | "down" | "left" | "right" = "up";
  isSliding = false;

  //External methods:
  move = handleMovement;
  constructor(scene: MainScene) {
    super(
      scene as MainScene,
      scene.start.col * scene.cellWidth + scene.cellWidth / 2,
      scene.start.row * scene.cellHeight -
        scene.start.floor * scene.floorHeight,
      "player",
      0
    );
    this.scene = scene;
    this.name = "Player";
    this.portalClone = null;
    this.portalReflection = null;
    this.row = scene.start.row;
    this.col = scene.start.col;
    this.floor = scene.start.floor;
    this.z = scene.start.floor * scene.floorHeight;
    this.holding = { top: null, right: null, bottom: null, left: null };
    this.adjacentTiles = {
      top: { row: this.row - 1, col: this.col },
      right: { row: this.row, col: this.col + 1 },
      bottom: { row: this.row + 1, col: this.col },
      left: { row: this.row, col: this.col - 1 },
    };
    this.shadow = this.scene.add.sprite(
      this.x + scene.shadowOffset.x,
      this.y + scene.shadowOffset.y,
      "player"
    );
    this.shadowMask = this.scene.add.graphics();
    this.highlight = scene.add.graphics();
    this.enableMovement();
    this.setDepth(1);
    this.setOrigin(0.5);

    this.createAnimations();
    this.generateShadow();

    scene.add.existing(this);
  }
  generateShadow() {
    const { shadowOffset, cellWidth, cellHeight, allWalls } = this.scene;

    this.shadow.x = this.x + shadowOffset.x;
    this.shadow.y = this.y + shadowOffset.y + 12;
    this.shadow.scaleY = -1;

    this.shadow.alpha = 0.25;
    this.shadow.setTint(0x000000);

    if (this.z > 0 && !this.wallBelow) {
      //Remove bottom of shadow when on top of something
      this.shadowMask.clear();
      this.shadowMask.fillRect(
        this.x - cellWidth / 2,
        this.y,
        cellWidth,
        cellHeight
      );
      this.shadowMask.alpha = 0;
      this.shadow.setMask(
        new Phaser.Display.Masks.GeometryMask(this.scene, this.shadowMask)
      );
    } else {
      this.shadow.clearMask();
    }

    const synchronizeAnimations = () => {
      if (this.anims.currentAnim) {
        // Get the key of the current animation of the parent sprite
        const animationKey = this.anims.currentAnim.key;

        if (this.shadow.anims.currentAnim?.key !== animationKey) {
          this.shadow.anims.play(animationKey);
        }
      }
      // Play the same animation on the shadow sprite
    };

    synchronizeAnimations();
    if (this.anims.isPaused) this.shadow.anims.pause();
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
        if (this.scene.mode === "Create" || movementForced) return;
      }

      if (
        this.scene.mode !== "Play" &&
        this.state !== "Idle" &&
        this.state !== "Holding"
      )
        return;

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
        case "Shift":
          {
            if (this.scene.mode === "Create") return;

            const { allCrates } = this.scene;

            for (const [side, adjacent] of Object.entries(this.adjacentTiles)) {
              const facing = directionToCardinal(this.lastMove);
              if (facing !== side) continue;

              const crate = allCrates[this.floor].get(
                `${adjacent.row},${adjacent.col}`
              );
              if (crate && crate.floor === this.floor && crate.active) {
                this.holding[side as Cardinal2D] = crate;
                this.state = "Holding";
                return;
              }
            }
          }
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
        case "Shift":
          if (this.state === "Holding") {
            this.state = "Idle";
          }
          this.holding = Object.assign({}, allCardinalsNull);
          break;
      }
    });
  }

  createAnimations() {
    const targets = [this, this.shadow];

    for (const target of targets) {
      target.anims.create({
        key: "Idle",
        frames: [{ key: "player", frame: 0 }],
        frameRate: 1,
        repeat: -1,
      });
      target.anims.create({
        key: "Idle",
        frames: [{ key: "player", frame: 0 }],
        frameRate: 1,
        repeat: -1,
      });
      target.anims.create({
        key: "moving-up",
        frames: this.anims.generateFrameNumbers("player", { start: 0, end: 2 }),
        frameRate: 12,
        repeat: -1,
      });
      target.anims.create({
        key: "moving-right",
        frames: this.anims.generateFrameNumbers("player", { start: 3, end: 5 }),
        frameRate: 12,
        repeat: -1,
      });
      target.anims.create({
        key: "moving-down",
        frames: this.anims.generateFrameNumbers("player", { start: 6, end: 8 }),
        frameRate: 12,
        repeat: -1,
      });
      target.anims.create({
        key: "moving-left",
        frames: this.anims.generateFrameNumbers("player", {
          start: 9,
          end: 11,
        }),
        frameRate: 12,
        repeat: -1,
      });

      target.anims.create({
        key: "sliding-up",
        frames: [{ key: "player", frame: 0 }],
        frameRate: 1,
        repeat: -1,
      });
      target.anims.create({
        key: "sliding-right",
        frames: [{ key: "player", frame: 3 }],
        frameRate: 12,
        repeat: -1,
      });
      target.anims.create({
        key: "sliding-down",
        frames: [{ key: "player", frame: 6 }],
        frameRate: 12,
        repeat: -1,
      });
      target.anims.create({
        key: "sliding-left",
        frames: [{ key: "player", frame: 9 }],
        frameRate: 12,
        repeat: -1,
      });

      target.anims.create({
        key: "Pushing",
        frames: this.anims.generateFrameNumbers("player", { start: 0, end: 3 }),
        frameRate: 12,
        repeat: -1,
      });
      target.anims.create({
        key: "Pulling",
        frames: this.anims.generateFrameNumbers("player", { start: 0, end: 3 }),
        frameRate: 12,
        repeat: -1,
      });
      target.anims.create({
        key: "Holding",
        frames: this.anims.generateFrameNumbers("player", { start: 0, end: 3 }),
        frameRate: 1,
        repeat: -1,
      });
    }
  }
  place(x: number, y: number) {
    this.row = Math.floor(y) / this.scene.cellHeight;
    this.col = Math.floor(x - this.scene.cellWidth / 2) / this.scene.cellWidth;
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
    const { cellWidth, cellHeight, floorHeight, start } = this.scene;

    this.holding = Object.assign({}, allCardinalsNull);
    this.moving = Object.assign({}, allDirectionsFalse);
    this.forceMovement = Object.assign({}, allDirectionsFalse);
    this.state = "Idle";

    this.z = 0;
    this.floor = 0;

    //TODO Snap to floors as well
    this.x = start.col * cellWidth + cellWidth / 2;
    this.y = start.row * cellHeight;
    this.z = start.z;

    this.row = start.row;
    this.col = start.col;
    this.floor = start.floor;
  }

  update() {
    this.generateShadow();

    let additional = 0;
    if (this.z > 0) additional = 1;

    this.setDepth(this.row + this.floor * this.scene.rowCount + additional);
    this.shadow.setDepth(this.row + this.floor + additional);

    switch (this.state) {
      case "Idle":
        {
          this.alpha = 1;
          this.scene.game.canvas.style.cursor = "auto";
          this.shadow.anims.pause();
          this.shadow.anims.restart();
          this.anims.pause();
          this.anims.restart();
          this.hasReset = false;
        }
        break;

      case "Pulling":
      case "Pushing":
      case "Moving":
      case "Sliding":
        for (const [direction, moving] of Object.entries(this.moving)) {
          if (moving) {
            let movementDirection = direction;
            if (this.state === "Pulling") {
              movementDirection = getOppositeDirection(direction as Direction);
            }
            const action = this.state === "Sliding" ? "sliding" : "moving";

            const animation = `${action}-${movementDirection}`;
            if (this.anims.currentAnim?.key !== animation)
              this.anims.play(animation);
            break;
          }
        }

        break;
      case "Climbing":
        if (this.anims.currentAnim?.key !== "moving-up")
          this.anims.play("moving-up");
        break;

      case "Holding":
        this.scene.game.canvas.style.cursor = "grab";

        break;
      case "Falling":
        break;
      case "Dead":
        console.warn("YOU FUCKING DIED");
        this.anims.play("Idle");
        this.resetToOrigin();
        return;
      case "Editing":
        this.z = 0;
        this.floor = 0;
        this.forceMovement = Object.assign({}, allDirectionsFalse);
        this.anims.play("Idle");
        this.alpha = 0.65;
        this.setDepth(200);
        break;
    }

    for (const [side, holding] of Object.entries(this.holding)) {
      if (holding) {
        const direction = cardinalToDirection(side as Cardinal2D);
        this.lastMove = direction;
        break;
      }
    }

    if (this.ladder) {
      if (this.anims.currentAnim?.key !== "moving-up")
        this.anims.play("moving-up");
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
}
