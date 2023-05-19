import MainScene from "../../scenes/MainScene";
import { Direction, Cardinal } from "../../types";
import {
  directionToCardinal,
  cardinalToDirection,
  getOppositeSide,
} from "../../utils/opposite";
import Crate from "../Crate/crate";
import { isColliding } from "../tilemap/wall-tiles/detect-collision";
import { isWithinGrace } from "../../utils/opposite";

class Laser extends Phaser.GameObjects.Line {
  scene: MainScene;
  valid = false;
  base!: Phaser.GameObjects.Graphics;
  rose!: Phaser.GameObjects.Graphics;
  rails!: Phaser.GameObjects.Graphics;
  origin!: { row: number; col: number };
  editorExpanseTiles!: Phaser.GameObjects.Graphics;
  row!: number;
  col!: number;
  direction?: Direction;
  color!: number;
  x: number;
  y: number;
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
    direction?: Direction,
    oscilate?: { expanse: number; movement: "in" | "out" }
  ) {
    super(
      scene as MainScene,
      col * scene.cellSize,
      row * scene.cellSize,
      col * scene.cellSize,
      row * scene.cellSize,
      col * scene.cellSize,
      row * scene.cellSize,
      0xff1522
    );
    this.scene = scene as MainScene;
    this.name = "Laser";
    this.row = row;
    this.col = col;
    this.origin = { row, col };
    this.x = col * scene.cellSize + scene.cellSize / 2;
    this.y = row * scene.cellSize + scene.cellSize / 2;
    this.endX = this.x;
    this.endY = this.y;
    this.index = index;

    if (this.index === 0) {
      //Snaps to nearby wall
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

    if (oscilate) {
      this.movement = oscilate.movement;
      this.expanse = oscilate.expanse;
      this.oscilate();
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
    this.x = col * this.scene.cellSize + this.scene.cellSize / 2;
    this.y = row * this.scene.cellSize + this.scene.cellSize / 2;
    this.direction = newDirection;
  }
  oscilate() {
    const { cellSize } = this.scene;

    const target: { x: number; y: number } = { x: this.x, y: this.y };

    if (this.movement === "in") {
      target.x =
        this.direction === "down" || this.direction === "up"
          ? this.x + cellSize - cellSize * this.expanse
          : this.x;
      target.y =
        this.direction === "left" || this.direction === "right"
          ? this.y + cellSize - cellSize * this.expanse
          : this.y;
    } else if (this.movement === "out") {
      target.x =
        this.direction === "down" || this.direction === "up"
          ? this.x - cellSize + cellSize * this.expanse
          : this.x;
      target.y =
        this.direction === "left" || this.direction === "right"
          ? this.y - cellSize + cellSize * this.expanse
          : this.y;
    }

    this.oscilation = this.scene.tweens.add({
      targets: [this],
      x: target.x,
      y: target.y,
      duration: this.expanse * 750,
      yoyo: true,
      repeat: -1,
      ease: "Sine.InOut",
      onUpdate: () => {
        this.row = Math.floor(this.y / cellSize);
        this.col = Math.floor(this.x / cellSize);
      },
    });
  }
  update() {
    if (!this.valid) return;

    const { col, row, direction } = this;
    const { cellSize, editor, portals, colCount, rowCount, player } =
      this.scene;
    const { walls } = this.scene.tilemap;
    if (!direction) return;

    this.editorExpanseTiles.clear();

    if (editor.enabled) {
      this.oscilation?.restart();
      this.oscilation?.pause();
      this.x = this.origin.col * cellSize + cellSize / 2;
      this.y = this.origin.row * cellSize + cellSize / 2;
      this.row = this.origin.row;
      this.col = this.origin.col;

      this.editorExpanseTiles.fillStyle(0xff0000, 0.2);
      console.log(this.expanse);
      if (this.expanse > 1) {
        if (direction === "up" || direction === "down")
          this.editorExpanseTiles.fillRect(
            this.movement === "in"
              ? this.origin.col * cellSize + cellSize - this.expanse * cellSize
              : this.origin.col * cellSize,
            this.origin.row * cellSize,
            this.expanse * cellSize,
            cellSize
          );
        else if (direction === "left" || direction === "right") {
          this.editorExpanseTiles.fillRect(
            this.origin.col * cellSize,
            this.movement === "in"
              ? this.origin.row * cellSize + cellSize - this.expanse * cellSize
              : this.origin.row * cellSize,
            cellSize,
            this.expanse * cellSize
          );
        }
      } else {
        this.editorExpanseTiles.fillRect(
          this.col * cellSize,
          this.row * cellSize,
          cellSize,
          cellSize
        );
      }
    } else {
      if (this.expanse > 1 && !this.oscilation) this.oscilate();
      //TODO RESET with new values
      this.oscilation?.play();
    }

    let startX = this.x;
    let startY = this.y;

    let portalActive = false;
    const isPortal = (direction: Direction, row: number, col: number) => {
      for (const [type, portal] of Object.entries(portals)) {
        if (!portal) break;
        if (portal.surface === "Floor") continue;
        if (portal.row === row && portal.col === col) {
          if (
            getOppositeSide(directionToCardinal(direction)) !== portal.placement
          )
            continue;
          const otherPortal = portals[type === "a" ? "b" : "a"];
          if (!otherPortal) break;

          if (otherPortal.surface === "Wall") {
            const newDirection = cardinalToDirection(otherPortal.placement);

            if (!this.extension) {
              const newLaser = new Laser(
                this.scene as MainScene,
                otherPortal.targetRow,
                otherPortal.targetCol,
                this.index + 1,
                newDirection
              );
              this.extension = newLaser;
              this.extensionByPortal = true;
            } else {
              this.extension.setPos(
                otherPortal.targetRow,
                otherPortal.targetCol,
                newDirection
              );
            }
            portalActive = true;
            break;
          } else if (otherPortal.surface === "Floor") {
            continue;
          }
        }
      }
    };

    const recurseUp = (row: number, col: number): number => {
      if (isColliding(walls, direction, row, col)) {
        isPortal(direction, row, col);
        return row * cellSize + cellSize;
      } else if (row > 0) {
        return recurseUp(row - 1, col);
      } else {
        return 0;
      }
    };

    const recurseDown = (row: number, col: number): number => {
      if (isColliding(walls, direction, row, col)) {
        isPortal(direction, row, col);
        return row * cellSize;
      } else if (row <= rowCount) {
        return recurseDown(row + 1, col);
      } else {
        return rowCount * cellSize;
      }
    };

    const recurseLeft = (row: number, col: number): number => {
      if (isColliding(walls, direction, row, col)) {
        isPortal(direction, row, col);
        return col * cellSize + cellSize;
      } else if (col > 0) {
        return recurseLeft(row, col - 1);
      } else {
        return 0;
      }
    };

    const recurseRight = (row: number, col: number): number => {
      if (isColliding(walls, direction, row, col)) {
        isPortal(direction, row, col);
        return col * cellSize;
      } else if (col <= colCount) {
        return recurseRight(row, col + 1);
      } else {
        return colCount * cellSize;
      }
    };

    if (direction === "up") {
      startY = this.y + cellSize / 2;
      this.endX = this.x;
      this.endY = recurseUp(row, col);
    } else if (direction === "down") {
      startY = this.y - cellSize / 2;
      this.endX = this.x;
      this.endY = recurseDown(row, col);
    } else if (direction === "left") {
      startX = this.x + cellSize / 2;
      this.endX = recurseLeft(row, col);
      this.endY = this.y;
    } else if (direction === "right") {
      startX = this.x - cellSize / 2;
      this.endX = recurseRight(row, col);
      this.endY = this.y;
    }

    this.obstructedByCrate();
    if (
      this.isTouchingPlayer() &&
      player.state !== "Dead" &&
      !this.scene.editor.enabled
    )
      player.state = "Dead";

    if (
      this.extension &&
      this.extensionByPortal &&
      (!portals.a || !portals.b || !portalActive)
    ) {
      if (this.extension) {
        this.extension.valid = false;
        this.extension.remove();
        this.extension = null;
        this.extensionByPortal = false;
      }
    }
    this.drawLaser(startX, startY);
  }

  drawLaser(startX: number, startY: number) {
    const { cellSize } = this.scene;
    this.setStrokeStyle(2, 0xff1522); // set a 2-pixel wide red outline
    this.setOrigin(this.x, this.y);
    this.setTo(startX, startY, this.endX, this.endY);

    if (this.base) this.base.clear();
    if (this.index === 0) {
      this.base.fillStyle(0x222222);
      this.base.fillRoundedRect(startX - 6, startY - 6, 12, 12, 6);
      this.base.setDepth(2);
    }
    if (this.rose) this.rose.clear();
    if (!this.extension || this.index !== 0) {
      this.rose.fillStyle(0xff1522);
      this.rose.fillRoundedRect(this.endX - 3, this.endY - 3, 6, 6, 3);
      this.rose.setDepth(1);
    }
    if (this.expanse > 1) {
      this.rails.clear();
      if (this.direction === "up" || this.direction === "down") {
        this.rails.fillStyle(0x000000);
        this.rails.fillRect(
          this.movement === "in"
            ? this.origin.col * cellSize + cellSize - this.expanse * cellSize
            : this.origin.col * cellSize,
          this.direction === "up"
            ? this.origin.row * cellSize + cellSize - 3
            : this.origin.row * cellSize,
          this.expanse * cellSize,
          3
        );
      } else if (this.direction === "left" || this.direction === "right") {
        this.rails.fillStyle(0x000000);
        this.rails.fillRect(
          this.direction === "left"
            ? this.origin.col * cellSize + cellSize - 3
            : this.origin.col * cellSize,
          this.movement === "in"
            ? this.origin.row * cellSize + cellSize - this.expanse * cellSize
            : this.origin.row * cellSize,
          3,
          this.expanse * cellSize
        );
      }
    }
  }

  obstructedByCrate() {
    const { allCrates, cellSize } = this.scene;
    let endY = this.endY;
    let endX = this.endX;
    let obstructingCrate: Crate | null = null;

    for (const [pos, crate] of allCrates) {
      const left = Math.floor(crate.x - cellSize / 2);
      const top = Math.floor(crate.y - cellSize / 2);

      if (this.direction === "down" && this.row <= crate.row) {
        if (endY < crate.y - cellSize / 2) continue;
        if (left >= this.x - cellSize && left <= this.x) {
          endY = crate.y - cellSize / 2;
          obstructingCrate = crate;
        }
      } else if (this.direction === "up" && this.row >= crate.row) {
        if (endY > crate.y - cellSize / 2) continue;
        if (left >= this.x - cellSize && left <= this.x) {
          endY = crate.y + cellSize / 2;
          obstructingCrate = crate;
        }
      } else if (this.direction === "left" && this.col >= crate.col) {
        if (endX > crate.x - cellSize / 2) continue;
        if (top >= this.y - cellSize && top <= this.y) {
          endX = crate.x + cellSize / 2;
          obstructingCrate = crate;
        }
      } else if (this.direction === "right" && this.col <= crate.col) {
        if (endX < crate.x - cellSize / 2) continue;
        if (top >= this.y - cellSize && top <= this.y) {
          endX = crate.x - cellSize / 2;
          obstructingCrate = crate;
        }
      }
    }
    if (!this.scene.editor.enabled && obstructingCrate) {
      obstructingCrate.hp--;
    }

    this.endY = endY;
    this.endX = endX;
  }

  isTouchingPlayer(obstruct?: boolean): boolean {
    const { player } = this.scene;
    const grace = 8;

    if (this.direction === "down") {
      if (this.endY < player.y) return false;
      if (this.row <= player.row) {
        if (isWithinGrace(player.x, this.x, grace)) {
          if (obstruct) this.endY = player.y;
          return true;
        }
      }
    } else if (this.direction === "up") {
      if (this.endY > player.y) return false;
      if (this.row >= player.row) {
        if (isWithinGrace(player.x, this.x, grace)) {
          if (obstruct) this.endY = player.y;
          return true;
        }
      }
    } else if (this.direction === "left") {
      if (this.endX > player.x) return false;
      if (this.col >= player.col) {
        if (isWithinGrace(player.y, this.y, grace)) {
          if (obstruct) this.endX = player.x;
          return true;
        }
      }
    } else if (this.direction === "right") {
      if (this.endX < player.x) return false;
      if (this.col <= player.col) {
        if (isWithinGrace(player.y, this.y, grace)) {
          if (obstruct) this.endX = player.x;
          return true;
        }
      }
    }
    return false;
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
