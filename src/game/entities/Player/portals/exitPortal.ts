import { Player } from "../player";
import { Clone } from "../clone";
import MainScene from "../../../scenes/MainScene";

export default function exitPortal(player: Player) {
  if (!player.portalClone) return;

  const { cellWidth, cellHeight } = player.scene;
  const { to } = player.portalClone;

  player.scene.tweens.add({
    targets: player.portalClone,
    x: to.col * cellWidth + cellWidth / 2,
    y: to.row * cellHeight + cellHeight / 2,
    ease: player.ease,
    duration: player.moveDuration,
  });
}
