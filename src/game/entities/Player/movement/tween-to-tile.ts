import { Player } from "../player";
import { Direction } from "../../../types";
import { CELL_HEIGHT, CELL_WIDTH } from "../../../scenes/Main/constants";

export default function tweenToTile(player: Player, col: number, row: number) {
  const target = {
    x: Math.floor(col * CELL_WIDTH) + CELL_WIDTH / 2,
    y: Math.floor(row * CELL_HEIGHT) + CELL_HEIGHT / 2,
  };

  player.scene.tweens.add({
    targets: player,
    x: target.x,
    y: target.y,
    ease: "Linear",
    duration: player.moveDuration,
    onComplete: () => {
      player.x = target.x;
      player.y = target.y;
      player.row = Math.floor(player.y - CELL_HEIGHT / 2) / CELL_HEIGHT;
      player.col = Math.floor(player.x - CELL_WIDTH / 2) / CELL_WIDTH;

      if (player.state === "Pulling" || player.state === "Pushing") {
        let stillHolding = false;
        for (const [, hold] of Object.entries(player.holding)) {
          if (hold) {
            player.state = "Holding";
            stillHolding = true;
            break;
          }
        }
        if (!stillHolding) player.state = "Idle";
      } else {
        player.state = "Idle";
      }

      for (const [direction, playerInput] of Object.entries(player.moving)) {
        if (player.forceMovement[direction as Direction]) {
          //If movement is being forced
          player.move();
          player.lastMove = direction as Direction;
          return;
        }
        //If still holding button, keep moving
        if (playerInput) {
          player.move();
          return;
        }
      }
    },
  });
}
