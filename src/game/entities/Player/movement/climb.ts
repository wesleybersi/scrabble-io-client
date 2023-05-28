import { Player } from "../player";
import tweenToTile from "./tween-to-tile";

export function moveToLadder(
  player: Player,
  movement: "up" | "down",
  row: number,
  col: number
) {
  if (player.state === "Dead") return;
  const { cellWidth, cellHeight, floorHeight, mode } = player.scene;

  const target = {
    x: Math.floor(col * cellWidth) + cellWidth / 2,
    y:
      movement === "up"
        ? Math.floor(row * cellHeight) +
          cellHeight / 2 -
          player.floor * floorHeight
        : Math.floor(row * cellHeight) -
          cellHeight / 2 -
          player.floor * floorHeight,
  };

  const tween = player.scene.tweens.add({
    targets: player,
    x: target.x,
    y: target.y,
    ease: "Quad",
    duration: 300,
    onUpdate: () => {
      if (player.state === "Dead" || mode !== "Play") {
        //When still moving while switching to editor.
        tween.remove();
        player.resetToOrigin();
        return;
      }
    },
    onComplete: () => {
      if (player.state === "Dead") return;
      player.enterLadder = false;
      player.state = "Idle";
      player.move();
    },
  });
}

export default function climb(player: Player, movement: "up" | "down") {
  if (player.state === "Dead") return;
  const { cellWidth, cellHeight, floorHeight, mode } = player.scene;

  let floor = player.floor;
  if (movement === "up") floor++;
  else if (movement === "down") floor--;

  const floorDiff = Math.abs(player.floor * floorHeight - floor * floorHeight);

  const target = {
    x: Math.floor(player.col * cellWidth) + cellWidth / 2,
    y: movement === "up" ? player.y - floorDiff : player.y + floorDiff,
  };
  if (movement === "up") player.floor++;
  if (movement === "down") player.floor--;
  player.z = player.floor * floorHeight;

  console.log("targetY:", target.y);
  const tween = player.scene.tweens.add({
    targets: player,
    x: target.x,
    y: target.y,
    ease: "Linear",
    duration: 150,
    onUpdate: () => {
      if (player.state === "Dead" || mode !== "Play") {
        //When still moving while switching to editor.
        tween.remove();
        player.resetToOrigin();
        return;
      }
    },
    onComplete: () => {
      if (player.state === "Dead") return;
      player.state = "Idle";
      player.move();
    },
  });
}

export function moveAwayFromLadder(
  player: Player,
  movement: "up" | "down",
  row: number,
  col: number
) {
  if (player.state === "Dead") return;
  const { cellWidth, cellHeight, floorHeight, mode } = player.scene;

  player.z = player.floor * floorHeight;
  const target = {
    x: Math.floor(col * cellWidth) + cellWidth / 2,
    y:
      movement === "up"
        ? Math.floor(row * cellHeight) - cellHeight - player.floor * floorHeight
        : Math.floor(row * cellHeight) +
          cellHeight -
          player.floor * floorHeight,
  };

  const tween = player.scene.tweens.add({
    targets: player,
    x: target.x,
    y: target.y,
    ease: "Quad.Out",
    duration: 200,
    onUpdate: () => {
      if (player.state === "Dead" || mode !== "Play") {
        //When still moving while switching to editor.
        tween.remove();
        player.resetToOrigin();
        return;
      }
    },
    onComplete: () => {
      if (player.state === "Dead") return;
      player.exitLadder = false;
      player.ladder = null;

      player.row = Math.floor(player.y + player.z) / cellHeight;
      player.col = Math.floor(player.x - cellWidth / 2) / cellWidth;
      player.state = "Idle";

      for (const [direction, playerInput] of Object.entries(player.moving)) {
        //If still holding button, keep moving
        if (playerInput) {
          player.move();
          return;
        }
      }
    },
  });
}
