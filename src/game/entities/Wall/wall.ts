import MainScene from "../../scenes/Main/MainScene";
import { CELL_HEIGHT, CELL_WIDTH } from "../../scenes/Main/constants";
import { Direction } from "../../types";
import { getAdjacentTiles } from "../../utils/helper-functions";
import Letter from "../Letter/letter";
import autoTile from "./draw/auto-tile";
import drawShadow from "./draw/draw-shadow";

export default class Wall extends Phaser.GameObjects.Sprite {
  scene: MainScene;
  shadow!: Phaser.GameObjects.Image;
  shadowMask!: Phaser.GameObjects.Graphics;
  row: number;
  col: number;
  adjacent!: {
    top: Wall | Letter | undefined;
    bottom: Wall | Letter | undefined;
    right: Wall | Letter | undefined;
    left: Wall | Letter | undefined;
  };
  connectedTo = {
    top: false,
    bottom: false,
    right: false,
    left: false,
  };
  collideDown = true;
  collideUp = true;
  collideLeft = true;
  collideRight = true;
  //Methods
  autoTile = autoTile;
  drawShadow = drawShadow;
  constructor(scene: MainScene, row: number, col: number) {
    super(
      scene as MainScene,
      col * CELL_WIDTH + CELL_WIDTH / 2,
      row * CELL_HEIGHT + CELL_HEIGHT / 2,
      "blocks",
      0
    );

    this.scene = scene;
    this.name = "Wall";
    this.row = row;
    this.col = col;

    this.setDepth(row);
    this.setOrigin(0.5);
    this.setTint(0x2c3b48);

    scene.allWalls.set(`${row},${col}`, this);
    scene.events.on("Connect Walls", (row: number, col: number) => {
      if (this.row === row && this.col === col) this.update();
    });

    this.update();
    const adjacent = getAdjacentTiles(this.row, this.col);
    for (const [, position] of Object.entries(adjacent)) {
      this.scene.events.emit("Connect Walls", position.row, position.col);
    }
    this.scene.add.existing(this);
  }

  update() {
    if (!this.active) return;
    const { allWalls, allLetters } = this.scene;

    const adjacentTiles = getAdjacentTiles(this.row, this.col);
    const { top, bottom, right, left } = adjacentTiles;

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

    const { adjacent } = this;

    this.connectedTo = {
      top: adjacent.top && adjacent.top instanceof Wall ? true : false,
      bottom: adjacent.bottom && adjacent.bottom instanceof Wall ? true : false,
      right: adjacent.right && adjacent.right instanceof Wall ? true : false,
      left: adjacent.left && adjacent.left instanceof Wall ? true : false,
    };

    this.autoTile();
    this.drawShadow();
  }

  isColliding(direction: Direction): boolean {
    if (direction === "up" && this.collideDown) return true;
    else if (direction === "down" && this.collideUp) return true;
    else if (direction === "left" && this.collideLeft) return true;
    else if (direction === "right" && this.collideRight) return true;
    else return false;
  }
  remove() {
    if (!this.scene) return;
    this.setActive(false);
    const { allWalls } = this.scene;
    allWalls.delete(`${this.row},${this.col}`);
    this.destroy();
  }
}
