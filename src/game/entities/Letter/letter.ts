import MainScene from "../../scenes/Main/MainScene";
import { Cardinal, Direction } from "../../types";
import {
  getOppositeSide,
  getAdjacentTiles,
  randomNum,
  oneIn,
} from "../../utils/helper-functions";
import { allCardinals3DUndefined } from "../../utils/constants";
import makeMove from "./movement/make-move";
import prepareMove, { attemptMove } from "./movement/prepare-move";
import { letterToScrabbleValue } from "../../utils/letters";
import getRelevantLetters from "./calculation/relevant-letters";
import { Player } from "../Player/player";
import { ValidWord } from "./calculation/word-combinations";
import autoTile from "./graphics/auto-tile";
import drawLetter from "./graphics/draw-letter";
import connectShape from "./interaction/connect-shape";
import disconnectAll from "./interaction/disconnect-from-shape";
import { CELL_HEIGHT, CELL_WIDTH } from "../../scenes/Main/constants";

class Letter extends Phaser.GameObjects.Sprite {
  scene: MainScene;
  tileType!: "Regular" | "WildCard";
  letterGraphic!: Phaser.GameObjects.Image;
  movementTween!: Phaser.Tweens.Tween;
  shadow?: Phaser.FX.Shadow | undefined;
  letter!: string;
  isCalculating = false;
  isWildcard?: boolean;
  value!: number;
  isPartOfWord: ValidWord[] = [];
  formedBy: Player | null = null;
  shape: Set<Letter> = new Set([this]);
  isMoving = false;
  direction!: Direction;
  weight = 1.15;
  row!: number;
  col!: number;
  origin: { row: number; col: number; x: number; y: number };
  target!: { row: number; col: number; x: number; y: number } | null;
  adjacentLetters!: {
    top: Letter | undefined;
    bottom: Letter | undefined;
    left: Letter | undefined;
    right: Letter | undefined;
  };
  connectedTo!: {
    top: Letter | undefined;
    bottom: Letter | undefined;
    left: Letter | undefined;
    right: Letter | undefined;
  };

  //Methods
  autoTile = autoTile;
  prepareMove = prepareMove;
  attemptMove = attemptMove;
  makeMove = makeMove;
  getRelevantLetters = getRelevantLetters;
  drawLetter = drawLetter;
  connectShape = connectShape;
  disconnectAll = disconnectAll;
  constructor(
    scene: MainScene,

    row: number,
    col: number
  ) {
    super(
      scene as MainScene,
      col * CELL_WIDTH + CELL_WIDTH / 2,
      row * CELL_HEIGHT + CELL_HEIGHT / 2 - 3,
      "blocks"
    );
    this.scene = scene;
    this.setOrigin(0.5, 0.5);
    this.name = "Letter";
    this.row = row;
    this.col = col;

    if (oneIn(scene.procedure.distribution.wildcards)) {
      this.setWildCard();
    } else if (oneIn(scene.procedure.distribution.questionMarks)) {
      this.setQuestionMark();
    } else {
      this.setRandomLetter();
    }

    if (this.letter !== " " && this.letter !== "?") {
      this.value = letterToScrabbleValue(this.letter);
    }
    this.origin = {
      row,
      col,
      x: this.x,
      y: this.y,
    };

    this.setTint(0xe4bb92);
    this.connectedTo = Object.assign({}, allCardinals3DUndefined);
    this.adjacentLetters = Object.assign({}, allCardinals3DUndefined);
    this.scene.allLetters.set(`${row},${col}`, this);
    this.update();
    this.scene.add.existing(this);
  }

  isInViewport() {
    const { viewport } = this.scene;

    return (
      this.row >= viewport.startRow &&
      this.row <= viewport.startRow + viewport.visibleRows &&
      this.col >= viewport.startCol &&
      this.col <= viewport.startCol + viewport.visibleCols
    );
  }

  update() {
    //TODO Event based instead of frame based
    const { allLetters } = this.scene;

    if (!this.active) {
      this.alpha = 0;
      return;
    }

    this.setDepth(this.row);
    this.drawLetter();
    this.letterGraphic?.setDepth(this.row + 1);

    if (this.isPartOfWord.length > 0) {
      this.setTint(this.scene.player.color);
    }

    if (this.isMoving) return;
    const detectSurroundings = () => {
      const { top, bottom, right, left } = getAdjacentTiles(this.row, this.col);
      this.adjacentLetters = {
        top: allLetters.get(`${top.row},${top.col}`),
        bottom: allLetters.get(`${bottom.row},${bottom.col}`),
        right: allLetters.get(`${right.row},${right.col}`),
        left: allLetters.get(`${left.row},${left.col}`),
      };
    };

    if (!this.isMoving) detectSurroundings();

    this.autoTile();
  }
  setRandomLetter() {
    const { letterPool } = this.scene;
    const letter = letterPool[randomNum(letterPool.length)];
    this.letter = letter;
  }
  setWildCard() {
    this.letter = " ";
    this.isWildcard = true;
  }
  setQuestionMark() {
    this.letter = "?";
  }

  remove() {
    if (!this.scene) return;
    this.scene.events.emit("Remove from pointer", this);

    const { allLetters } = this.scene;

    allLetters.delete(`${this.row},${this.col}`);

    const shape = Array.from(this.shape);
    for (const crate of shape) {
      crate.shape.delete(this);
      crate.remove();
    }

    this.letterGraphic?.destroy();
    this.destroy();
  }
}

export default Letter;
