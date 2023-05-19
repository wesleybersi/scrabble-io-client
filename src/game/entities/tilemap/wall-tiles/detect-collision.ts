import { Direction } from "../../../types";

export function isColliding(
  walls: Phaser.Tilemaps.TilemapLayer,
  direction: Direction,
  row: number,
  col: number
): boolean {
  const target = walls.getTileAt(col, row);
  if (!target) return false;
  if (direction === "up" && target.collideDown) return true;
  else if (direction === "down" && target.collideUp) return true;
  else if (direction === "left" && target.collideLeft) return true;
  else if (direction === "right" && target.collideRight) return true;
  else return false;
}
