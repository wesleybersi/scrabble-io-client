import { Cardinal, Direction } from "../types";

export function getOppositeSide(cardinal: Cardinal) {
  const oppositeMap: { [key: string]: Cardinal } = {
    top: "bottom",
    bottom: "top",
    left: "right",
    right: "left",
  };
  return oppositeMap[cardinal];
}

export function getOppositeDirection(direction: Direction) {
  const oppositeMap: { [key: string]: Direction } = {
    up: "down",
    down: "up",
    left: "right",
    right: "left",
  };
  return oppositeMap[direction];
}

export function cardinalToDirection(cardinal: Cardinal): Direction {
  const oppositeMap: { [key: string]: Direction } = {
    top: "up",
    bottom: "down",
    left: "left",
    right: "right",
  };
  return oppositeMap[cardinal];
}

export function directionToCardinal(direction: Direction): Cardinal {
  const oppositeMap: { [key: string]: Cardinal } = {
    up: "top",
    down: "bottom",
    left: "left",
    right: "right",
  };
  return oppositeMap[direction];
}

export function randomPosition(
  rowCount: number,
  colCount: number,
  cellSize: number
) {
  const randX = Math.floor(Math.random() * colCount) * cellSize + cellSize / 2;
  const randY = Math.floor(Math.random() * rowCount) * cellSize + cellSize / 2;
  return { x: randX, y: randY };
}

export function directionToAdjacent(
  direction: Direction,
  row: number,
  col: number
) {
  let newRow = row;
  let newCol = col;

  if (direction === "up") {
    newRow--;
  } else if (direction === "down") {
    newRow++;
  } else if (direction === "left") {
    newCol--;
  } else if (direction === "right") {
    newCol++;
  }

  return { row: newRow, col: newCol };
}

export function cardinalToAdjacent(
  cardinal: Cardinal,
  row: number,
  col: number
) {
  let newRow = row;
  let newCol = col;

  if (cardinal === "top") {
    newRow--;
  } else if (cardinal === "bottom") {
    newRow++;
  } else if (cardinal === "left") {
    newCol--;
  } else if (cardinal === "right") {
    newCol++;
  }

  return { row: newRow, col: newCol };
}

export function degreesToRadians(degrees: number) {
  return degrees * (Math.PI / 180);
}

export function getAdjacentTiles(
  row: number,
  col: number
): {
  top: { row: number; col: number };
  bottom: { row: number; col: number };
  left: { row: number; col: number };
  right: { row: number; col: number };
} {
  const adjacentTiles = {
    top: { row: row - 1, col },
    bottom: { row: row + 1, col },
    left: { row, col: col - 1 },
    right: { row, col: col + 1 },
  };

  return adjacentTiles;
}

export function directionToAngle(direction: Direction, invert = false): number {
  if (direction === "left") {
    if (invert) return 90;
    else return 270;
  } else if (direction === "right") {
    if (invert) return 270;
    else return 90;
  } else if (direction === "up") {
    if (invert) 180;
    else return 0;
  } else if (direction === "down") {
    if (invert) return 0;
    else return 180;
  }
  return 0;
}

export function isWithinGrace(
  value: number,
  target: number,
  grace: number
): boolean {
  return value > target - grace && value < target + grace;
}
