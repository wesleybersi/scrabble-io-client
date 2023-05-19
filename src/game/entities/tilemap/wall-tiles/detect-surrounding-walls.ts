import { getAdjacentTiles, getOppositeSide } from "../../../utils/opposite";
import { Cardinal } from "../../../types";

export function connectSurroundingWalls(
  wallLayer: Phaser.Tilemaps.TilemapLayer,
  row: number,
  col: number
): {
  top: boolean;
  bottom: boolean;
  right: boolean;
  left: boolean;
  topLeft: boolean;
  topRight: boolean;
  bottomLeft: boolean;
  bottomRight: boolean;
} {
  const adjacentTiles = getAdjacentTiles(row, col);
  const connectWallTo = {
    top: false,
    bottom: false,
    right: false,
    left: false,
  };

  const diagonals = hasDiagonalAdjacent(wallLayer, row, col);

  for (const [side, { row: aRow, col: aCol }] of Object.entries(
    adjacentTiles
  )) {
    const adjacentTile = wallLayer.getTileAt(aCol, aRow);
    //If no tile, no connections to be made

    if (!adjacentTile) continue;
    if (adjacentTile.properties.name === "Wall") {
      if (adjacentTile.properties.connectedTo) {
        //Connect pieces together
        const { connectedTo: connectAdjacentWallTo } = adjacentTile.properties;
        const oppositeSide = getOppositeSide(side as Cardinal);

        connectAdjacentWallTo[oppositeSide] = true;
        connectWallTo[side as Cardinal] = true;

        const { top, bottom, left, right } = connectAdjacentWallTo;
        const { topLeft, topRight, bottomLeft, bottomRight } =
          hasDiagonalAdjacent(wallLayer, aCol, aRow);
        adjacentTile.properties.connectedTo = {
          top,
          bottom,
          left,
          right,
          topLeft,
          topRight,
          bottomLeft,
          bottomRight,
        };

        const tileIndex = adjacentToTileIndex(
          top,
          bottom,
          left,
          right,
          topLeft,
          topRight,
          bottomLeft,
          bottomRight
        );

        adjacentTile.index = tileIndex;
      }
    }
  }

  return { ...connectWallTo, ...diagonals };
}

export function disconnectSurroundingWalls(
  wallLayer: Phaser.Tilemaps.TilemapLayer,
  row: number,
  col: number
): void {
  const adjacentTiles = getAdjacentTiles(row, col);

  for (const [side, { row, col }] of Object.entries(adjacentTiles)) {
    const adjacentTile = wallLayer.getTileAt(col, row);
    if (!adjacentTile) continue;
    if (adjacentTile.properties.connectedTo) {
      const { connectedTo: connectAdjacentWallTo } = adjacentTile.properties;
      const oppositeSide = getOppositeSide(side as Cardinal);
      connectAdjacentWallTo[oppositeSide] = false;

      const { top, bottom, left, right } = connectAdjacentWallTo;
      const { topLeft, topRight, bottomLeft, bottomRight } =
        hasDiagonalAdjacent(wallLayer, col, row);
      adjacentTile.properties.connectedTo = {
        top,
        bottom,
        left,
        right,
        topLeft,
        topRight,
        bottomLeft,
        bottomRight,
      };

      const tileIndex = adjacentToTileIndex(
        top,
        bottom,
        left,
        right,
        topLeft,
        topRight,
        bottomLeft,
        bottomRight
      );

      adjacentTile.index = tileIndex;
    }
  }
}

export function hasDiagonalAdjacent(
  wallLayer: Phaser.Tilemaps.TilemapLayer,
  col: number,
  row: number
): {
  topLeft: boolean;
  topRight: boolean;
  bottomLeft: boolean;
  bottomRight: boolean;
} {
  type Diagonal = "topLeft" | "topRight" | "bottomLeft" | "bottomRight";

  const diagonals = {
    topLeft: { row: row - 1, col: col - 1, occupied: true },
    topRight: { row: row - 1, col: col + 1, occupied: true },
    bottomLeft: { row: row + 1, col: col - 1, occupied: true },
    bottomRight: { row: row + 1, col: col + 1, occupied: true },
  };

  for (const [side, diagonal] of Object.entries(diagonals)) {
    const cornerPiece = wallLayer.getTileAt(diagonal.col, diagonal.row);

    if (!cornerPiece || cornerPiece.properties.name !== "Wall")
      diagonals[side as Diagonal].occupied = false;
  }

  const { topLeft, topRight, bottomLeft, bottomRight } = diagonals;
  return {
    topLeft: topLeft.occupied,
    topRight: topRight.occupied,
    bottomLeft: bottomLeft.occupied,
    bottomRight: bottomRight.occupied,
  };
}

export function adjacentToTileIndex(
  top: boolean,
  bottom: boolean,
  left: boolean,
  right: boolean,
  topLeft: boolean,
  topRight: boolean,
  bottomLeft: boolean,
  bottomRight: boolean
): number {
  if (top && bottom && left && right) {
    //If all connected

    // if (!topLeft && topRight && bottomLeft && bottomRight) return 28;
    // else if (topLeft && !topRight && bottomLeft && bottomRight) return 27;
    // else if (topLeft && topRight && !bottomLeft && bottomRight) return 17;
    // else if (topLeft && topRight && bottomLeft && !bottomRight) return 18;
    // else if (topLeft && topRight && bottomLeft && bottomRight) return 12;

    return 12;
  }
  if (!top && !bottom && !left && !right) {
    //If none connected
    return 36;
  }

  //Only one connected
  if (top && !bottom && !left && !right) {
    return 25;
  }
  if (!top && bottom && !left && !right) {
    return 3;
  }
  if (!top && !bottom && left && !right) {
    return 35;
  }
  if (!top && !bottom && !left && right) {
    return 33;
  }

  //Two connected
  if (top && bottom && !left && !right) {
    return 14;
  }
  if (!top && !bottom && left && right) {
    return 34;
  }

  //Corner pieces
  if (!top && bottom && left && !right) {
    return 2;
  }
  if (!top && bottom && !left && right) {
    return 0;
  }
  if (top && !bottom && left && !right) {
    return 24;
  }
  if (top && !bottom && !left && right) {
    return 22;
  }

  if (!top && bottom && left && right) {
    return 1;
  }
  if (top && !bottom && left && right) {
    return 23;
  }
  if (top && bottom && !left && right) {
    return 11;
  }
  if (top && bottom && left && !right) {
    return 13;
  }

  return 0;
}
