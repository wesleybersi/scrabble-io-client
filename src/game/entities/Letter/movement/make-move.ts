import { diffieHellman } from "crypto";
import {
  CELL_HEIGHT,
  CELL_WIDTH,
  MOVE_DURATION,
} from "../../../scenes/Main/constants";
import Letter from "../letter";

import finishMove from "./finish-move";

export default function makeMove(
  this: Letter,
  direction: "up" | "down" | "left" | "right",
  allIncluded: Set<Letter>,
  duration: number,
  completed: Set<Letter>
) {
  if (this.isMoving) return;
  this.isMoving = true;
  this.direction = direction;

  this.target = {
    row: this.row,
    col: this.col,
    x: this.x,
    y: this.y,
  };

  if (direction === "up") {
    this.target.y -= CELL_HEIGHT;
    this.target.row--;
  } else if (direction === "down") {
    this.target.y += CELL_HEIGHT;
    this.target.row++;
  } else if (direction === "left") {
    this.target.x -= CELL_WIDTH;
    this.target.col--;
  } else if (direction === "right") {
    this.target.x += CELL_WIDTH;
    this.target.col++;
  }

  this.movementTween = this.scene.tweens.add({
    targets: this,
    x: this.target.x,
    y: this.target.y,
    ease: "Linear",
    duration: duration,

    onUpdate: () => {
      this.update();
    },
    onComplete: () => {
      completed.add(this);

      //Last one to complete, triggers finishing function
      if (completed.size === allIncluded.size) {
        finishMove(this.scene, completed);
      }
    },
  });
}
