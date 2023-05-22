import { Direction } from "../../../types";
import { Player } from "../player";
import { isObstructed } from "./collision";
import tweenToTile from "./tween-to-tile";
import { allDirectionsFalse } from "../../../utils/constants";

import { directionToAdjacent } from "../../../utils/opposite";
import tweenIntoVoid from "./tween-into-void";

export default function handleMovement(player: Player) {
  if (player.state !== "Idle" && player.state !== "Holding") {
    return;
  }
  const { events } = player.scene;

  player.portalClone = null;
  player.moveDuration = player.initialMoveDuration;
  player.ease = "Linear";

  let hasMoved = false;
  for (const [direction, moving] of Object.entries(player.moving)) {
    const attemptMove = () => {
      if (!isObstructed(player, direction as Direction)) {
        const { row, col } = directionToAdjacent(
          direction as Direction,
          player.row,
          player.col
        );
        //ANCHOR Move valid
        if (
          player.state !== "Pushing" &&
          player.state !== "Pulling" &&
          player.state !== "Falling" &&
          player.state !== "Sliding" &&
          player.state !== "Dead"
        ) {
          player.state = "Moving";
        }

        tweenToTile(player, col, row);
        return;
      } else {
        player.removePortals = false;
        player.forceMovement = Object.assign({}, allDirectionsFalse);
        // player.moving = Object.assign({}, allDirectionsFalse);
        player.portalClone = null;
        if (player.state !== "Dead") player.state = "Idle";
        return;
      }
    };
    if (player.forceMovement[direction as Direction]) {
      player.forceMovement = Object.assign({}, allDirectionsFalse);
      attemptMove();
      hasMoved = true;
      return;
    }
    if (moving) {
      attemptMove();
      hasMoved = true;
      return;
    }
  }
  if (!hasMoved) {
    player.forceMovement = Object.assign({}, allDirectionsFalse);
  }
}
