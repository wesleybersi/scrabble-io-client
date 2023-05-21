import MainScene from "../../scenes/MainScene";
import { Direction, Cardinal } from "../../types";
import { cardinalToDirection, getOppositeSide } from "../../utils/opposite";
import obstructByWall from "./collision/obstruct-by-wall";
import obstructByCrate from "./collision/obstruct-by-crate";
import isTouchingPlayer from "./collision/player-collision";
import oscilate from "./movement/oscilate";
import drawLaser from "./draw/draw-laser";
import drawExpanse from "./draw/draw-expanse";

class Laser extends Phaser.GameObjects.Line {
  scene: MainScene;
  stringValue = "";
  valid = false;
  base!: Phaser.GameObjects.Graphics;
  rose!: Phaser.GameObjects.Graphics;
  rails!: Phaser.GameObjects.Graphics;
  origin!: { row: number; col: number };
  editorExpanseTiles!: Phaser.GameObjects.Graphics;
  row!: number;
  col!: number;
  direction: Direction = "down";
  color!: number;
  x: number;
  y: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  parent: Laser | null = null;
  extension: Laser | null = null;
  extensionByPortal = false;
  index!: number;
  oscilation: Phaser.Tweens.Tween | undefined;
  expanse = 1;
  movement: "in" | "out" = "out";
  constructor(
    scene: MainScene,
    row: number,
    col: number,
    index = 0,
    direction: Direction = "up",
    isOscilate?: { expanse: number; movement: "in" | "out" }
  ) {
    super(
      scene as MainScene,
      col * scene.cellWidth,
      row * scene.cellHeight,
      col * scene.cellWidth,
      row * scene.cellHeight,
      col * scene.cellWidth,
      row * scene.cellHeight,
      0xff1522
    );
    this.scene = scene as MainScene;
    this.name = "Laser";
    this.row = row;
    this.col = col;
    this.origin = { row, col };
    this.x = col * scene.cellWidth + scene.cellWidth / 2;
    this.y = row * scene.cellHeight + scene.cellHeight / 2;
    this.startX = this.x;
    this.startY = this.y;
    this.endX = this.x;
    this.endY = this.y;
    this.index = index;
    this.stringValue = JSON.stringify({
      row,
      col,
      index,
      direction,
      isOscilate,
    });

    if (this.index === 0) {
      //Snap to nearby wall

      const { walls } = this.scene.tilemap;
      const positions = {
        top: { row: row - 1, col },
        right: { row, col: col + 1 },
        bottom: { row: row + 1, col },
        left: { row, col: col - 1 },
      };
      for (const [side, position] of Object.entries(positions)) {
        const tile = walls.getTileAt(position.col, position.row);
        if (tile && tile.properties.name === "Wall") {
          this.direction = cardinalToDirection(
            getOppositeSide(side as Cardinal)
          );
          this.valid = true;
          break;
        }
      }
      if (!this.valid) {
        this.remove();
        return;
      }
    } else {
      this.valid = true;
      this.direction = direction;
    }

    if (isOscilate) {
      this.movement = isOscilate.movement;
      this.expanse = isOscilate.expanse;
      oscilate(this);
    }

    this.base = this.scene.add.graphics();
    this.rose = this.scene.add.graphics();
    this.editorExpanseTiles = scene.add.graphics();
    this.rails = scene.add.graphics();

    this.setLineWidth(1);

    scene.allLasers.set(`${this.row},${this.col}`, this);
    scene.add.existing(this);
  }
  setPos(row: number, col: number, newDirection: Direction) {
    this.row = row;
    this.col = col;
    this.x = col * this.scene.cellWidth + this.scene.cellWidth / 2;
    this.y = row * this.scene.cellHeight + this.scene.cellHeight / 2;
    this.direction = newDirection;
  }

  update() {
    if (!this.valid) return;
    const { cellWidth, cellHeight, editor, player } = this.scene;

    if (editor.enabled) {
      //Reset to original position
      this.oscilation?.restart();
      this.oscilation?.pause();

      this.x = this.origin.col * cellWidth + cellWidth / 2;
      this.y = this.origin.row * cellHeight + cellHeight / 2;
      this.row = this.origin.row;
      this.col = this.origin.col;

      drawExpanse(this);
    } else if (!editor.enabled) {
      this.editorExpanseTiles.clear();

      //Start oscilation
      if (this.expanse > 1 && !this.oscilation) oscilate(this);
      this.oscilation?.play();
    }

    //Obstruction events
    const { startX, startY, endX: x, endY: y } = obstructByWall(this);
    const { endX, endY } = obstructByCrate(this, x, y);

    //Set length of line
    this.startX = startX;
    this.startY = startY;
    this.endX = endX;
    this.endY = endY;

    if (isTouchingPlayer(this)) player.state = "Dead";

    drawLaser(this);
  }

  rotate() {
    if (!this.valid) return;

    const { walls } = this.scene.tilemap;
    const positions = {
      top: { row: this.row - 1, col: this.col },
      right: { row: this.row, col: this.col + 1 },
      bottom: { row: this.row + 1, col: this.col },
      left: { row: this.row, col: this.col - 1 },
    };
    for (const [side, position] of Object.entries(positions)) {
      const wall = walls.getTileAt(position.col, position.row);

      if (wall && wall.properties.name === "Wall") {
        const currentDirection = cardinalToDirection(
          getOppositeSide(side as Cardinal)
        );
        if (currentDirection === this.direction) {
          continue;
        } else {
          this.expanse = 1;
          this.direction = currentDirection;
          break;
        }
      }
    }
  }

  remove() {
    this.valid = false;
    const { allLasers } = this.scene;

    if (this.extension) {
      this.extension.valid = false;
      this.extension.remove();
    }

    this.editorExpanseTiles.destroy();
    allLasers.delete(`${this.row},${this.col}`);

    if (this.base) this.base.destroy();
    if (this.rose) this.rose.destroy();
    if (this.rails) this.rails.destroy();
    this.destroy();
  }
}
export default Laser;
