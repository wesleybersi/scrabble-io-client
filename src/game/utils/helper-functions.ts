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

export function isInViewport(
  row: number,
  col: number,
  viewport: {
    startRow: number;
    startCol: number;
    visibleRows: number;
    visibleCols: number;
  }
) {
  return (
    row >= viewport.startRow &&
    row <= viewport.startRow + viewport.visibleRows &&
    col >= viewport.startCol &&
    col <= viewport.startCol + viewport.visibleCols
  );
}

export function generateRandomColor() {
  const randomColor = Math.floor(Math.random() * 0xffffff); // Generate a random number between 0 and 16777215 (0xFFFFFF in decimal)
  const alpha = 0; // Set the desired alpha value

  // Extract the RGB channels from the random color
  const red = (randomColor >> 16) & 0xff;
  const green = (randomColor >> 8) & 0xff;
  const blue = randomColor & 0xff;

  // Calculate the lighter color by interpolating between each RGB channel and 255 (full brightness)
  const lighterRed = Math.floor(red + (255 - red) * alpha);
  const lighterGreen = Math.floor(green + (255 - green) * alpha);
  const lighterBlue = Math.floor(blue + (255 - blue) * alpha);

  // Combine the modified RGB channels to form the lighter color
  const lighterColor = (lighterRed << 16) | (lighterGreen << 8) | lighterBlue;

  return lighterColor;
}

export function randomPlaceColor() {
  const colors = [
    0xff4501, 0xffa800, 0xffd635, 0x00a368, 0x7eed55, 0x2350a4, 0x3790e9,
    0x51e9f4, 0x801e9f, 0xb44abf, 0xff99aa, 0x9c6926, 0x00c853, 0xff4081,
    0x795548, 0xff6f61, 0xa0e6ff, 0xff6347, 0x8a2be2, 0x008080,
  ];
  return colors[randomNum(colors.length - 1)];
}

export function oneIn(chance: number): boolean {
  if (!Math.floor(Math.random() * chance)) return true;
  return false;
}

export function randomNum(num: number): number {
  return Math.floor(Math.random() * num);
}
export function getRandomInt(min: number, max?: number): number {
  // If only one argument is provided, assume the range is from 1 to that value
  if (max === undefined) {
    max = min;
    min = 0;
  }

  // Ensure that min and max are integers
  min = Math.ceil(min);
  max = Math.floor(max);

  // Generate a random integer within the specified range
  return Math.floor(Math.random() * (max - min)) + min;
}
