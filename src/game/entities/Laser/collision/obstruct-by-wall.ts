import { isColliding } from "../../tilemap/wall-tiles/detect-collision";
import Laser from "../laser";

export default function obstructByWall(laser: Laser): {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
} {
  const { cellSize, tilemap, rowCount, colCount } = laser.scene;
  const { col, row, direction } = laser;

  const recurseUp = (row: number, col: number): number => {
    if (isColliding(tilemap.walls, direction, row, col)) {
      return row * cellSize + cellSize;
    } else if (row > 0) {
      return recurseUp(row - 1, col);
    } else {
      return 0;
    }
  };

  const recurseDown = (row: number, col: number): number => {
    if (isColliding(tilemap.walls, direction, row, col)) {
      return row * cellSize;
    } else if (row <= rowCount) {
      return recurseDown(row + 1, col);
    } else {
      return rowCount * cellSize;
    }
  };

  const recurseLeft = (row: number, col: number): number => {
    if (isColliding(tilemap.walls, direction, row, col)) {
      return col * cellSize + cellSize;
    } else if (col > 0) {
      return recurseLeft(row, col - 1);
    } else {
      return 0;
    }
  };

  const recurseRight = (row: number, col: number): number => {
    if (isColliding(tilemap.walls, direction, row, col)) {
      return col * cellSize;
    } else if (col <= colCount) {
      return recurseRight(row, col + 1);
    } else {
      return colCount * cellSize;
    }
  };

  let endX = 0;
  let endY = 0;
  let startX = laser.x;
  let startY = laser.y;

  if (direction === "up") {
    startY = laser.y + cellSize / 2;
    endX = laser.x;
    endY = recurseUp(row, col);
  } else if (direction === "down") {
    startY = laser.y - cellSize / 2;
    endX = laser.x;
    endY = recurseDown(row, col);
  } else if (direction === "left") {
    startX = laser.x + cellSize / 2;
    endX = recurseLeft(row, col);
    endY = laser.y;
  } else if (direction === "right") {
    startX = laser.x - cellSize / 2;
    endX = recurseRight(row, col);
    endY = laser.y;
  }

  return { startX, startY, endX, endY };
}
