import { Player } from "../player";
import { Clone } from "../clone";
import MainScene from "../../../scenes/MainScene";

export default function exitPortal(player: Player) {
  if (!player.portalClone) return;

  const { cellSize } = player.scene;
  const { to } = player.portalClone;

  player.scene.tweens.add({
    targets: player.portalClone,
    x: to.col * cellSize + cellSize / 2,
    y: to.row * cellSize + cellSize / 2,
    ease: player.ease,
    duration: player.moveDuration,
  });
}
