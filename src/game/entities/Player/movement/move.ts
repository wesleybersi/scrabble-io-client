import { Direction } from "../../../types";
import { Player } from "../player";
import { isObstructed } from "./collision";
import tweenToTile from "./tween-to-tile";
import { allDirectionsFalse } from "../../../utils/constants";
import { directionToAdjacent } from "../../../utils/helper-functions";
import climb from "./climb";
import { moveToLadder, moveAwayFromLadder } from "./climb";

export default function handleMovement(this: Player) {
  if (this.state !== "Idle" && this.state !== "Holding") {
    return;
  }
  const { mode } = this.scene;
  if (mode === "Create") return;

  this.portalClone = null;
  this.moveDuration = this.initialMoveDuration;
  this.ease = "Linear";

  let hasMoved = false;
  for (const [direction, moving] of Object.entries(this.moving)) {
    const attemptMove = () => {
      if (!isObstructed(this, direction as Direction)) {
        const { row, col } = directionToAdjacent(
          direction as Direction,
          this.row,
          this.col
        );
        if (!this.enterLadder) {
          if (
            this.state !== "Pushing" &&
            this.state !== "Pulling" &&
            this.state !== "Falling" &&
            this.state !== "Sliding" &&
            this.state !== "Dead"
          ) {
            this.state = "Moving";
          }
          tweenToTile(this, col, row, this.floor);
        } else {
          if (direction === "up" || direction === "down") {
            moveToLadder(this, direction, row, col);
          }
        }

        return;
      } else {
        this.removePortals = false;
        this.forceMovement = Object.assign({}, allDirectionsFalse);
        // this.moving = Object.assign({}, allDirectionsFalse);
        this.portalClone = null;
        if (this.state !== "Dead") this.state = "Idle";
        return;
      }
    };
    if (this.forceMovement[direction as Direction]) {
      this.forceMovement = Object.assign({}, allDirectionsFalse);
      attemptMove();
      hasMoved = true;
      return;
    }

    if (this.ladder) {
      this.state = "Climbing";
      let lowest = 99;
      let highest = 0;
      for (const piece of this.ladder) {
        if (piece.floor < lowest) lowest = piece.floor;
        if (piece.floor > highest) highest = piece.floor;
      }
      if (this.ladderMovement === "up") {
        if (this.floor === highest + 1) this.exitLadder = true;
        if (this.exitLadder) {
          moveAwayFromLadder(this, "up", this.row, this.col);
        } else climb(this, "up");
      } else if (this.ladderMovement === "down") {
        if (this.floor === lowest) this.exitLadder = true;
        if (this.exitLadder) {
          moveAwayFromLadder(this, "down", this.row, this.col);
        } else climb(this, "down");
      }
      return;
    }

    if (moving) {
      attemptMove();
      hasMoved = true;
      return;
    }
  }
  if (!hasMoved) {
    this.forceMovement = Object.assign({}, allDirectionsFalse);
  }
}
