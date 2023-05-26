import Laser from "../laser";
import { isWithinGrace } from "../../../utils/helper-functions";

export default function isTouchingPlayer(
  laser: Laser,
  obstruct?: boolean
): boolean {
  const { player, editor } = laser.scene;
  const grace = 8;

  if (editor.enabled) return false;
  if (player.state === "Dead") return false;

  if (laser.direction === "down") {
    if (laser.endY < player.y) return false;
    if (laser.row <= player.row) {
      if (isWithinGrace(player.x, laser.x, grace)) {
        if (obstruct) laser.endY = player.y;
        return true;
      }
    }
  } else if (laser.direction === "up") {
    if (laser.endY > player.y) return false;
    if (laser.row >= player.row) {
      if (isWithinGrace(player.x, laser.x, grace)) {
        if (obstruct) laser.endY = player.y;
        return true;
      }
    }
  } else if (laser.direction === "left") {
    if (laser.endX > player.x) return false;
    if (laser.col >= player.col) {
      if (isWithinGrace(player.y, laser.y, grace)) {
        if (obstruct) laser.endX = player.x;
        return true;
      }
    }
  } else if (laser.direction === "right") {
    if (laser.endX < player.x) return false;
    if (laser.col <= player.col) {
      if (isWithinGrace(player.y, laser.y, grace)) {
        if (obstruct) laser.endX = player.x;
        return true;
      }
    }
  }

  return false;
}
