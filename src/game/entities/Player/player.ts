import MainScene from "../../scenes/Main/MainScene";
import { Cardinal, Direction } from "../../types";
import {
  cardinalToDirection,
  generateRandomColor,
  getAdjacentTiles,
  getOppositeDirection,
} from "../../utils/helper-functions";
import { allCardinalsNull, allDirectionsFalse } from "../../utils/constants";
import Letter from "../Letter/letter";
//Methods
import handleMovement from "./movement/move";
import { ValidWord } from "../Letter/calculation/word-combinations";
import Wall from "../Wall/wall";
import { CELL_HEIGHT, CELL_WIDTH } from "../../scenes/Main/constants";
import Start from "./start-tile";
import { start } from "repl";

export class Player extends Phaser.GameObjects.Sprite {
  scene: MainScene;
  startPosition: Start;
  shadow!: Phaser.GameObjects.Sprite;
  shadowMask!: Phaser.GameObjects.Graphics;
  rotationTween: Phaser.Tweens.Tween | null = null;
  hasReset = false;
  score = 0;
  moveDuration = 150;
  inMovement = false;
  moving: Direction[] = [];
  forceMovement = { left: false, right: false, up: false, down: false };
  lastMove: Direction = "up";
  state: "Idle" | "Moving" | "Pushing" | "Holding" | "Pulling" | "Disabled" =
    "Idle";
  row: number;
  col: number;
  adjacent!: {
    top: Letter | Wall | undefined;
    right: Letter | Wall | undefined;
    bottom: Letter | Wall | undefined;
    left: Letter | Wall | undefined;
  };
  holding!: {
    top: Letter | null;
    right: Letter | null;
    bottom: Letter | null;
    left: Letter | null;
  };
  facing: "up" | "down" | "left" | "right" = "up";
  isSliding = false;
  move = handleMovement;
  color = generateRandomColor();
  validWords: ValidWord[] = [];
  longestWord = "";
  constructor(scene: MainScene, row: number, col: number) {
    super(
      scene as MainScene,
      col * CELL_WIDTH + CELL_WIDTH / 2,
      row * CELL_HEIGHT + CELL_HEIGHT / 2,
      "player",
      0
    );
    this.scene = scene;
    this.name = "Player";
    this.row = row;
    this.col = col;
    this.startPosition = new Start(scene, row, col);
    this.holding = { top: null, right: null, bottom: null, left: null };
    this.adjacent = {
      top: undefined,
      right: undefined,
      bottom: undefined,
      left: undefined,
    };
    this.shadow = this.scene.add.sprite(this.x, this.y, "player");
    this.shadowMask = this.scene.add.graphics();
    this.enableMovement();

    this.setOrigin(0.5);

    // this.createAnimations();
    this.generateShadow();

    this.setScale(0);
    this.scene.tweens.add({
      targets: [this, this.shadow],
      scale: 1,
      duration: 250,
      onComplete: () => {
        this.setScale(1);
        this.scene.tweens.add({
          targets: this,
          scale: 1.25,
          duration: 750,
          yoyo: true,
          repeat: Infinity,
        });
      },
    });

    scene.add.existing(this);
  }
  generateShadow() {
    this.shadow.x = this.x;
    this.shadow.y = this.y + 16 + 12;
    this.shadow.alpha = 0.15;
    this.shadow.setDepth(this.depth - 1);
    this.shadow.setTint(0x000000);
  }

  enableMovement() {
    this.scene.input.keyboard?.on("keydown", (event: KeyboardEvent) => {
      for (const [, movementForced] of Object.entries(this.forceMovement)) {
        if (movementForced) return;
      }

      switch (event.key) {
        case "W":
        case "w":
        case "ArrowUp":
          if (!this.moving.includes("up")) this.moving.unshift("up");
          this.move();
          break;
        case "A":
        case "a":
        case "ArrowLeft":
          if (!this.moving.includes("left")) this.moving.unshift("left");

          this.move();
          break;
        case "S":
        case "s":
        case "ArrowDown":
          if (!this.moving.includes("down")) this.moving.unshift("down");

          this.move();
          break;
        case "D":
        case "d":
        case "ArrowRight":
          if (!this.moving.includes("right")) this.moving.unshift("right");

          this.move();
          break;
        case "R":
        case "r":
          this.resetToOrigin();
          break;
        case "Shift":
          {
            this.detectAdjacent();

            const targets = Object.entries(this.adjacent).filter(
              ([, adjacent]) =>
                adjacent && adjacent.active && adjacent instanceof Letter
            ) as [Cardinal, Letter][];

            for (const [side, target] of targets) {
              const direction = cardinalToDirection(side as Cardinal);
              if (this.facing === direction) {
                this.holding[side] = target;
                this.state = "Holding";
                // this.moving = this.facing;
                if (!this.moving.includes(this.facing))
                  this.moving.unshift(this.facing);
              } else if (targets.length === 1) {
                this.holding[side] = target;
                this.state = "Holding";
                this.facing = direction;
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
          this.moving = this.moving.filter((direction) => direction !== "up");
          if (this.moving[0]) this.move();
          break;
        case "A":
        case "a":
        case "ArrowLeft":
          this.moving = this.moving.filter((direction) => direction !== "left");
          if (this.moving[0]) this.move();
          break;
        case "S":
        case "s":
        case "ArrowDown":
          this.moving = this.moving.filter((direction) => direction !== "down");
          if (this.moving[0]) this.move();
          break;
        case "D":
        case "d":
        case "ArrowRight":
          this.moving = this.moving.filter(
            (direction) => direction !== "right"
          );
          if (this.moving[0]) this.move();
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

  resetToOrigin() {
    const { startPosition } = this;

    this.holding = Object.assign({}, allCardinalsNull);
    this.moving = [];
    this.forceMovement = Object.assign({}, allDirectionsFalse);
    this.state = "Idle";

    const findEmptySpace = (row: number, col: number, checked: Set<string>) => {
      const letterInPlace = this.scene.allLetters.get(`${row},${col}`);
      if (!letterInPlace) {
        this.row = row;
        this.col = col;
        this.x = col * CELL_WIDTH + CELL_WIDTH / 2;
        this.y = row * CELL_HEIGHT + CELL_HEIGHT / 2;
      } else {
        checked.add(`${row},${col}`);
        const positions = getAdjacentTiles(row, col);
        for (const position of Object.values(positions).sort(
          () => Math.random() - 0.5
        )) {
          if (checked.has(`${position.row},${position.col}`)) continue;
          findEmptySpace(position.row, position.col, checked);
          break;
        }
      }
    };
    findEmptySpace(startPosition.row, startPosition.col, new Set());
  }

  update() {
    this.setDepth(this.row + 3);
    this.shadow.setDepth(this.row + 1);
    this.generateShadow();
    if (this.moving[0]) this.lastMove = this.moving[0];

    let target = 0;
    if (this.lastMove === "up") {
      target = 0;
    } else if (this.lastMove === "right") {
      target = 90;
    } else if (this.lastMove === "down") {
      target = 180;
    } else if (this.lastMove === "left") {
      target = -90;
    }
    const startAngle = this.angle;
    if (startAngle === -90 && target === 180) {
      target = -180;
    }
    if (
      !this.rotationTween &&
      target !== this.angle &&
      this.state !== "Pulling"
    ) {
      this.rotationTween = this.scene.tweens.add({
        targets: this,
        angle: target,
        duration: this.moveDuration,
        ease: "Sine.Out",
        onStart: () => {
          console.log(startAngle, target);
          if (startAngle === 0 && target === 270) {
            this.setAngle(360);
          } else if (startAngle === 180 && target === -90) {
            this.setAngle(-180);
          }
        },
        onUpdate: () => console.log(this.angle),
        onComplete: () => {
          this.setAngle(target);
          if (this.angle === -180) this.setAngle(180);
          this.rotationTween = null;
        },
      });
    }

    switch (this.state) {
      case "Idle":
        {
          this.alpha = 1;
          this.hasReset = false;
        }
        break;
    }

    for (const [side, holding] of Object.entries(this.holding)) {
      if (holding) {
        const direction = cardinalToDirection(side as Cardinal);
        this.lastMove = direction;
        break;
      }
    }

    let longestWord = "";
    for (const word of this.validWords) {
      if (word.letters.length > longestWord.length) {
        longestWord = word.letters;
      }
    }
    this.longestWord = longestWord;
  }
  detectAdjacent() {
    const { allWalls, allLetters } = this.scene;
    const { top, bottom, left, right } = getAdjacentTiles(this.row, this.col);
    this.adjacent = {
      top:
        allWalls.get(`${top.row},${top.col}`) ??
        allLetters.get(`${top.row},${top.col}`),
      bottom:
        allWalls.get(`${bottom.row},${bottom.col}`) ??
        allLetters.get(`${bottom.row},${bottom.col}`),
      right:
        allWalls.get(`${right.row},${right.col}`) ??
        allLetters.get(`${right.row},${right.col}`),
      left:
        allWalls.get(`${left.row},${left.col}`) ??
        allLetters.get(`${left.row},${left.col}`),
    };
  }
}
