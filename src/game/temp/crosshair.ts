import { Player } from "./Player/player";
import { Cardinal } from "../types";
import MainScene from "../scenes/MainScene";

class Crosshair extends Phaser.GameObjects.Line {
  graphic!: Phaser.GameObjects.Graphics;
  scene: MainScene;
  player!: Player;
  pointerX!: number;
  pointerY!: number;
  inSight!: {
    row: number;
    col: number;
    cardinal: Cardinal;
    portalable: boolean;
  } | null;
  angle = 0;
  difference = 0;
  rotationSpeed = 7;
  constructor(scene: MainScene, player: Player, clone?: boolean) {
    super(scene, 0, 0, player.x, player.y, player.x, player.y, 0xff0000);
    this.scene = scene;
    this.name = "Crosshair";
    this.graphic = scene.add.graphics();
    this.player = player;
    this.setLineWidth(4);
    this.strokeColor = 0xefefef;
    this.setDepth(9);

    if (!clone) {
      scene.add.existing(this);
    }
  }

  drawTarget() {
    if (this.scene.editor.enabled) return;
    this.graphic.clear();

    if (!this.inSight || !this.inSight.portalable) return;
    const { cardinal, row, col } = this.inSight;
    const { cellSize, allWalls, portals } = this.scene;

    for (const [type, portal] of Object.entries(portals)) {
      if (!portal) continue;
      if (portal.row === row && portal.col === col) {
        return;
      }
    }
    let y = row * cellSize;
    let x = col * cellSize;
    const size = 2;
    let width = 0;
    let height = 0;
    const radii = { tl: 0, tr: 0, bl: 0, br: 0 };
    if (cardinal === "bottom") {
      y += cellSize;
      width = cellSize;
      height = size;
      radii.bl = size;
      radii.br = size;
    } else if (cardinal === "top") {
      y -= size;
      width = cellSize;
      height = size;
      radii.tl = size;
      radii.tr = size;
    } else if (cardinal === "left") {
      x -= size;
      width = size;
      height = cellSize;
      radii.tl = size;
      radii.bl = size;
    } else if (cardinal === "right") {
      x += cellSize;
      width = size;
      height = cellSize;
      radii.tr = size;
      radii.br = size;
    }
    this.graphic.fillStyle(0x000000);
    this.graphic.alpha = 0.1;
    this.graphic.fillRoundedRect(x, y, width, height, radii);

    this.setDepth(100);
  }

  update() {
    const { player } = this;
    if (player.state === "Dead") {
      this.setVisible(false);
    }

    const {
      cellSize,
      hover,
      allWalls,
      allObjects,
      allFloorTiles,
      rowCount,
      colCount,
    } = this.scene;

    const playerX = Math.floor(player.x);
    const playerY = Math.floor(player.y);
    const pointerX = hover.x;
    const pointerY = hover.y;

    let targetAngle = 0;
    if (
      player.state === "Pushing" &&
      !player.holding.top &&
      !player.holding.bottom &&
      !player.holding.left &&
      !player.holding.right
    ) {
      if (player.moving.up) {
        targetAngle = 270;
      } else if (player.moving.down) {
        targetAngle = 90;
      } else if (player.moving.left) {
        targetAngle = 180;
      } else if (player.moving.right) {
        targetAngle = 0;
      }
    } else if (
      player.holding.top ||
      player.holding.bottom ||
      player.holding.left ||
      player.holding.right
    ) {
      if (player.holding.top) {
        targetAngle = 270;
      } else if (player.holding.bottom) {
        targetAngle = 90;
      } else if (player.holding.left) {
        targetAngle = 180;
      } else if (player.holding.right) {
        targetAngle = 0;
      }
    } else {
      targetAngle =
        (Math.atan2(pointerY - playerY, pointerX - playerX) * 180) / Math.PI;
    }

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
      const rotationAmount = Math.min(Math.abs(diff), this.rotationSpeed);

      // Apply the rotation
      this.angle += rotationDir * rotationAmount;
      this.angle = ((this.angle % 360) + 360) % 360;
    }

    //ANCHOR Consider
    // if (player.state === "Moving") {
    //   if (player.moving.right) {
    //     if (this.angle < 270 && this.angle > 90) {
    //       if (this.angle < 360) this.angle = 270;
    //       else this.angle = 90;
    //     }
    //     // if (this.angle > 90) this.angle = 90;
    //   }
    // }

    let { endX, endY } = calculateEndPoint(
      playerX,
      playerY,
      this.angle,
      this.scene.cameras.main
    );
    const slope = (endY - playerY) / (endX - playerX);

    const cells = bresenham(
      playerX,
      playerY,
      Math.floor(endX),
      Math.floor(endY),
      cellSize
    );

    let objectFound = false;
    for (const cell of cells) {
      if (cell.row < 0 || cell.row > rowCount) continue;
      if (cell.col < 0 || cell.col > colCount) continue;

      const pos = `${cell.row},${cell.col}`;
      const wall = allWalls[cell.row][cell.col];
      const obj = allObjects.get(pos);

      if (!wall && !obj) continue;
      let target = null;
      if (wall && wall.type !== "Grate") target = wall;
      else if (obj) target = obj;
      if (!target) continue;
      // if (obj instanceof Remover) {
      //Lawdy lawd
      // }

      const sideOfCell = getLineCellSide(
        playerX,
        playerY,
        endX,
        endY,
        cellSize,
        target.row,
        target.col
      );
      if (!sideOfCell) break;

      objectFound = true;
      this.inSight = {
        row: target.row,
        col: target.col,
        cardinal: sideOfCell as Cardinal,
        portalable: wall && wall.type === "Light" ? true : false,
      };

      if (sideOfCell === "top") {
        const { endX: newX, endY: newY } = cutOffLineAtTop(
          endX,
          endY,
          target,
          playerX,
          playerY,
          slope,
          cellSize
        );
        endX = newX;
        endY = newY;
      } else if (sideOfCell === "bottom") {
        const { endX: newX, endY: newY } = cutOffLineAtBottom(
          endX,
          endY,
          target,
          playerX,
          playerY,
          slope,
          cellSize
        );
        endX = newX;
        endY = newY;
      } else if (sideOfCell === "left") {
        const { endX: newX, endY: newY } = cutOffLineAtLeft(
          endX,
          endY,
          target,
          playerX,
          playerY,
          slope,
          cellSize
        );
        endX = newX;
        endY = newY;
      } else if (sideOfCell === "right") {
        const { endX: newX, endY: newY } = cutOffLineAtRight(
          endX,
          endY,
          target,
          playerX,
          playerY,
          slope,
          cellSize
        );
        endX = newX;
        endY = newY;
      }
      break;
    }
    if (!objectFound) {
      this.inSight = null;
    }

    this.drawTarget();

    //endX goes to end of screen // or end of block;
    //endY goes to end of screen // or end of block;

    const gun = generateLine(playerX, playerY, this.angle, 16);
    // this.setTo(playerX, playerY, gun.x, gun.y);

    this.setLineWidth(2);
    // this.strokeColor = 0xff0000;
    // this.alpha = 0.25;
    this.setDepth(1);

    // this.setTo(playerX, playerY, Math.floor(endX), Math.floor(endY));
  }
  remove() {
    this.destroy();
  }
}

function generateLine(
  startX: number,
  startY: number,
  angle: number,
  maxLength: number
): { x: number; y: number } {
  // Convert angle to radians
  const radianAngle = Phaser.Math.DegToRad(angle);

  // Calculate end point based on angle and maximum length
  const endX = startX + maxLength * Math.cos(radianAngle);
  const endY = startY + maxLength * Math.sin(radianAngle);

  // Create a new line from start point to end point
  const line = { x: endX, y: endY };

  return line;
}

function calculateEndPoint(
  startX: number,
  startY: number,
  angle: number,
  camera: Phaser.Cameras.Scene2D.Camera
): { endX: number; endY: number } {
  const viewport = camera.worldView;
  let slope: number;

  // Convert angle to radians
  const angleRad = (angle * Math.PI) / 180;

  // Check if angle is vertical (straight up or down)
  if (angle === 90 || angle === 270) {
    slope = Infinity;
  } else {
    slope = Math.tan(angleRad);
  }

  // Calculate the x-coordinate of the point where the line intersects the left or right edge of the screen
  let xIntersect: number;
  if ((angle >= 0 && angle < 90) || (angle >= 270 && angle < 360)) {
    xIntersect = viewport.right;
  } else {
    xIntersect = viewport.left;
  }

  // Calculate the y-coordinate of the point where the line intersects the left or right edge of the screen
  let yIntersect: number;
  if (slope === Infinity) {
    // Handle vertical line
    xIntersect = startX;
    yIntersect = angle > 0 && angle < 180 ? viewport.bottom : viewport.top;
  } else {
    yIntersect = slope * (xIntersect - startX) + startY;
  }

  // Check if the y-coordinate of the intersection point is outside the screen bounds
  if (yIntersect < viewport.top) {
    // Calculate the x-coordinate of the point where the line intersects the top edge of the screen
    xIntersect = (viewport.top - startY) / slope + startX;
    return { endX: xIntersect, endY: viewport.top };
  } else if (yIntersect > viewport.bottom) {
    // Calculate the x-coordinate of the point where the line intersects the bottom edge of the screen
    xIntersect = (viewport.bottom - startY) / slope + startX;
    return { endX: xIntersect, endY: viewport.bottom };
  } else {
    // The line intersects the left or right edge of the screen
    return { endX: xIntersect, endY: yIntersect };
  }
}

function bresenham(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  cellSize: number
): { col: number; row: number }[] {
  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;

  let x = x0;
  let y = y0;

  const cells: { col: number; row: number }[] = [];
  let done = false;

  while (!done) {
    const col = Math.floor(x / cellSize);
    const row = Math.floor(y / cellSize);

    if (!cells.some((c) => c.col === col && c.row === row)) {
      cells.push({ col, row });
    }

    if (x === x1 && y === y1) {
      done = true;
      break;
    }

    const e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      x += sx;
    }
    if (e2 < dx) {
      err += dx;
      y += sy;
    }
  }

  return cells;
}
function getLineCellSide(
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  cellSize: number,
  cellRow: number,
  cellCol: number
): string | null {
  const halfCellSize = cellSize / 2;
  const cellX = cellCol * cellSize + halfCellSize;
  const cellY = cellRow * cellSize + halfCellSize;
  const dx = endX - startX;
  const dy = endY - startY;
  const tminX = (cellX - halfCellSize - startX) / dx;
  const tmaxX = (cellX + halfCellSize - startX) / dx;
  const tminY = (cellY - halfCellSize - startY) / dy;
  const tmaxY = (cellY + halfCellSize - startY) / dy;

  let sideOfCell: string | null = null;

  if (dx > 0 && tminX <= 1 && tminX >= 0) {
    const y = startY + dy * tminX;
    if (y >= cellY - halfCellSize && y <= cellY + halfCellSize) {
      sideOfCell = "left";
    }
  } else if (dx < 0 && tmaxX <= 1 && tmaxX >= 0) {
    const y = startY + dy * tmaxX;
    if (y >= cellY - halfCellSize && y <= cellY + halfCellSize) {
      sideOfCell = "right";
    }
  }

  if (dy > 0 && tminY <= 1 && tminY >= 0) {
    const x = startX + dx * tminY;
    if (x >= cellX - halfCellSize && x <= cellX + halfCellSize) {
      sideOfCell = sideOfCell ? sideOfCell + "top" : "top";
    }
  } else if (dy < 0 && tmaxY <= 1 && tmaxY >= 0) {
    const x = startX + dx * tmaxY;
    if (x >= cellX - halfCellSize && x <= cellX + halfCellSize) {
      sideOfCell = sideOfCell ? sideOfCell + "bottom" : "bottom";
    }
  }

  return sideOfCell;
}

function cutOffLineAtTop(
  endX: number,
  endY: number,
  obj: any,
  playerX: number,
  playerY: number,
  slope: number,
  cellSize: number
) {
  const newEndY = obj.y;
  const distToNewEnd = Math.abs(newEndY - endY);
  if (distToNewEnd > cellSize) {
    // Line is too long to reach the top edge of the cell
    // Set endpoint to the top edge of the cell
    endY = newEndY;
    endX = (endY - playerY) / slope + playerX;
  } else {
    // Line intersects with top edge of the cell
    endY = newEndY;
  }
  return { endX, endY };
}

function cutOffLineAtBottom(
  endX: number,
  endY: number,
  obj: any,
  playerX: number,
  playerY: number,
  slope: number,
  cellSize: number
) {
  const newEndY = obj.y + cellSize;
  const distToNewEnd = Math.abs(newEndY - endY);
  if (distToNewEnd > cellSize) {
    // Line is too long to reach the bottom edge of the cell
    // Set endpoint to the bottom edge of the cell
    endY = newEndY;
    endX = (endY - playerY) / slope + playerX;
  } else {
    // Line intersects with bottom edge of the cell
    endY = newEndY;
  }
  return { endX, endY };
}

function cutOffLineAtLeft(
  endX: number,
  endY: number,
  obj: any,
  playerX: number,
  playerY: number,
  slope: number,
  cellSize: number
) {
  const newEndX = obj.x;
  const distToNewEnd = Math.abs(newEndX - endX);
  if (distToNewEnd > cellSize) {
    // Line is too long to reach the left edge of the cell
    // Set endpoint to the left edge of the cell
    endX = newEndX;
    endY = slope * (endX - playerX) + playerY;
  } else {
    // Line intersects with left edge of the cell
    endX = newEndX;
  }
  return { endX, endY };
}

function cutOffLineAtRight(
  endX: number,
  endY: number,
  obj: any,
  playerX: number,
  playerY: number,
  slope: number,
  cellSize: number
) {
  const newEndX = obj.x + cellSize;
  const distToNewEnd = Math.abs(newEndX - endX);
  if (distToNewEnd > cellSize) {
    // Line is too long to reach the right edge of the cell
    // Set endpoint to the right edge of the cell
    endX = newEndX;
    endY = slope * (endX - playerX) + playerY;
  } else {
    // Line intersects with right edge of the cell
    endX = newEndX;
  }
  return { endX, endY };
}

export default Crosshair;

interface Cell {
  row: number;
  col: number;
}

interface Cell {
  row: number;
  col: number;
}
