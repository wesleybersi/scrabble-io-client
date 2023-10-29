import { Direction } from "../../../types";
import { Player } from "../player";
import { isObstructed } from "./collision";
import tweenToTile from "./tween-to-tile";

import { directionToAdjacent } from "../../../utils/helper-functions";
import { MOVE_DURATION } from "../../../scenes/Main/constants";

export default function handleMovement(this: Player) {
  if (this.inMovement) return;
  if (this.state !== "Idle" && this.state !== "Holding") {
    return;
  }

  this.moveDuration = MOVE_DURATION;

  const attemptMove = (direction: Direction) => {
    if (!isObstructed(this, this.moving[0])) {
      const { row, col } = directionToAdjacent(
        direction as Direction,
        this.row,
        this.col
      );
      if (this.state !== "Pushing" && this.state !== "Pulling") {
        this.state = "Moving";
      }

      tweenToTile(this, col, row);
      return;
    } else {
      this.state = "Idle";
      return;
    }
  };

  if (this.moving.length > 0) {
    attemptMove(this.moving[0]);
    return;
  }
}
