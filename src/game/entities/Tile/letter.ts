import MainScene from "../../scenes/Main/MainScene";
import { Direction } from "../../types";
import autoTile from "./graphics/auto-tile";
import drawLetter from "./graphics/draw-letter";
import { CELL_HEIGHT, CELL_WIDTH } from "../../scenes/Main/constants";
import {
  generateRandomColor,
  getRandomInt,
  oneIn,
  randomNum,
  randomPlaceColor,
} from "../../utils/helper-functions";
import drawShadow from "./graphics/draw-shadow";
import { Arrows } from "../Arrows/Arrows";

class Tile extends Phaser.GameObjects.Image {
  scene: MainScene;
  id: string;
  letterGraphic!: Phaser.GameObjects.Image;
  shadowGraphic!: Phaser.GameObjects.Image;
  particles?: Phaser.GameObjects.Particles.ParticleEmitter;
  letter!: string;
  value!: number;

  arrows?: Arrows;

  isMoving = false;
  direction!: Direction;
  row!: number;
  col!: number;
  isSolved = false;
  connectedTo = {
    top: false,
    bottom: false,
    left: false,
    right: false,
  };

  //Methods
  autoTile = autoTile;
  drawLetter = drawLetter;
  drawShadow = drawShadow;

  constructor(
    scene: MainScene,
    id: string,
    row: number,
    col: number,
    letter: string,
    value: number,
    isSolved?: boolean,
    color?: number,
    top?: boolean,
    bottom?: boolean,
    left?: boolean,
    right?: boolean
  ) {
    super(
      scene as MainScene,
      col * CELL_WIDTH + CELL_WIDTH / 2,
      row * CELL_HEIGHT + CELL_HEIGHT / 2,
      "blocks"
    );
    this.scene = scene;
    this.id = id;
    this.setOrigin(0.5, 0.5);
    this.row = row;
    this.col = col;
    this.letter = letter;
    this.value = value;

    this.setTint(0xebbe8e);

    if (isSolved) {
      this.setTint(color ?? 0xebbe8e);
      this.isSolved = true;
      if (top) this.connectedTo.top = true;
      if (bottom) this.connectedTo.bottom = true;
      if (left) this.connectedTo.left = true;
      if (right) this.connectedTo.right = true;
    }

    this.scene.tilesByID.set(this.id, this);
    this.update(this.x, this.y);
    this.scene.add.existing(this);
  }

  isInViewport() {
    const { left, right, top, bottom } = this.scene.cameras.main.worldView;
    if (
      this.x < left - CELL_WIDTH ||
      this.x > right + CELL_WIDTH ||
      this.y < top - CELL_HEIGHT ||
      this.y > bottom + CELL_HEIGHT
    ) {
      return false;
    } else return true;
  }

  update(x: number, y: number, letter?: string) {
    if (letter) {
      if (this.letter === "?" && letter !== "?") this.emitSmoke();
      this.letter = letter;
    }
    setTimeout(() => {
      this.isMoving = false;
    }, 200);
    this.isMoving = true;

    this.setPosition(x, y);
    this.setDepth(this.y);
    this.drawLetter();
    this.drawShadow();

    this.letterGraphic?.setDepth(this.y + 2);
    this.autoTile();
  }
  emitSmoke(speed = 150, lifespan = 1000) {
    if (!this.particles?.active) {
      this.particles = this.scene.add.particles(this.x, this.y, "smoke", {
        frame: "white",
        color: [this.scene.player.color, 0xffffff, 0xffffff],
        colorEase: "quad.out",
        lifespan,
        // angle: { min: -100, max: -80 },
        alpha: { start: 1, end: 0.25, ease: "sine.out" },
        scale: { start: 0.65, end: 0, ease: "sine.out" },
        speed,
        advance: 1500,
        deathCallback: () => {
          this.particles?.stop();
          delete this.particles;
        },
        // blendMode: "MULTIPLY",
      });
      this.particles.setDepth(this.y + 500);
    }
  }
  onHold() {
    if (this.isMoving) return;
    if (!this.scene.arrows) {
      this.scene.arrows = new Arrows(this.scene, this.x, this.y);
    } else {
      this.scene.arrows.update(
        Math.floor((this.x - CELL_WIDTH / 2) / CELL_WIDTH) * CELL_WIDTH +
          CELL_WIDTH / 2,
        Math.floor((this.y - CELL_HEIGHT / 2) / CELL_HEIGHT) * CELL_HEIGHT +
          CELL_HEIGHT / 2
      );
    }
  }

  remove() {
    const { tilesByPosition, tilesByID } = this.scene;

    tilesByID.delete(this.id);
    tilesByPosition.delete(`${this.row},${this.col}`);

    this.letterGraphic?.destroy();
    this.destroy();
  }
}

export default Tile;
