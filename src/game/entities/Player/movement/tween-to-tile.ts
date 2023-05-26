import { Player } from "../player";
import { Direction } from "../../../types";
import { inFrontOfPortal } from "../portals/reflection";
import exitPortal from "../portals/exitPortal";
import tweenIntoVoid from "./tween-into-void";

export default function tweenToTile(player: Player, col: number, row: number) {
  if (player.state === "Dead") return;
  const { cellWidth, cellHeight, mode } = player.scene;
  if (player.portalClone) {
    exitPortal(player);
  }
  if (player.portalReflection) {
    inFrontOfPortal(player);
  }

  const target = {
    x: Math.floor(col * cellWidth) + cellWidth / 2,
    y: Math.floor(row * cellHeight),
  };
  target.y -= player.z;

  const tween = player.scene.tweens.add({
    targets: player,
    x: target.x,
    y: target.y,
    ease: player.ease,
    duration: player.moveDuration,
    onUpdate: () => {
      const { mode } = player.scene;
      if (player.state === "Dead" || mode !== "Play") {
        //When still moving while switching to editor.
        tween.remove();
        player.resetToOrigin();
        return;
      }
    },
    onComplete: () => {
      if (player.state === "Falling") {
        tweenIntoVoid(player, col, row);
        return;
      }

      if (player.state === "Dead") return;

      if (player.portalClone) {
        player.x = player.portalClone.to.col * cellWidth + cellWidth / 2;
        player.y = player.portalClone.to.row * cellHeight;
        player.portalClone.destroy();
        player.portalClone = null;
      } else {
        player.x = target.x;
        player.y = target.y;
      }
      player.row = Math.floor(player.y + player.z) / cellHeight;
      player.col = Math.floor(player.x - cellWidth / 2) / cellWidth;

      if (player.state === "Pulling" || player.state === "Pushing") {
        let stillHolding = false;
        for (const [side, hold] of Object.entries(player.holding)) {
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

      const { floor } = player.scene.tilemap;
      const floorTile = floor.getTileAt(player.col, player.row);

      switch (floorTile.properties.name) {
        case "Lava":
          player.state = "Dead";
          break;
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
