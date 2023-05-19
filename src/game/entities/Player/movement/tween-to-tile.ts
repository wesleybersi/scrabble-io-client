import { Player } from "../player";
import { Direction } from "../../../types";
import { inFrontOfPortal } from "../portals/reflection";
import exitPortal from "../portals/exitPortal";
import tweenIntoVoid from "./tween-into-void";

export default function tweenToTile(player: Player, col: number, row: number) {
  const { portals, cellSize, buttons } = player.scene;
  if (player.portalClone) {
    exitPortal(player);
  }
  if (player.portalReflection) {
    inFrontOfPortal(player);
  }

  const target = {
    x: Math.floor(col * cellSize) + cellSize / 2,
    y: Math.floor(row * cellSize) + cellSize / 2,
  };

  const tween = player.scene.tweens.add({
    targets: player,
    x: target.x,
    y: target.y,
    ease: player.ease,
    duration: player.moveDuration,
    onStart: () => {
      setTimeout(() => {
        if (player.removePortals) {
          if (portals.a || portals.b) {
            portals.a?.remove();
            portals.b?.remove();
            portals.a = null;
            portals.b = null;
            player.portalReflection?.clone?.destroy();
            player.portalReflection = null;
            player.removePortals = false;
            player.scene.sound.play("remover");
          } else {
            player.removePortals = false;
          }
        }
      }, player.moveDuration / 2);
    },

    onComplete: () => {
      if (player.state === "Falling") {
        tweenIntoVoid(player, col, row);
        return;
      }

      if (player.state === "Dead") return;

      if (player.portalClone) {
        player.x = player.portalClone.to.col * cellSize + cellSize / 2;
        player.y = player.portalClone.to.row * cellSize + cellSize / 2;
        player.portalClone.destroy();
        player.portalClone = null;
      } else {
        player.x = target.x;
        player.y = target.y;
      }
      player.row = Math.floor(player.y - cellSize / 2) / cellSize;
      player.col = Math.floor(player.x - cellSize / 2) / cellSize;

      if (
        player.state === "Pulling" ||
        (player.state === "Pushing" && buttons.pointerDown)
      ) {
        let stillHolding = false;
        for (const [side, hold] of Object.entries(player.holding)) {
          if (hold && buttons.pointerDown) {
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
