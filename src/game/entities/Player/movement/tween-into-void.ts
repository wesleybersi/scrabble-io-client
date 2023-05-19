import { Player } from "../player";

export default function tweenIntoVoid(
  player: Player,
  col: number,
  row: number
) {
  const { cellSize } = player.scene;

  const target = {
    x: Math.floor(col * cellSize) + cellSize / 2,
    y: Math.floor(row * cellSize) + cellSize / 2,
  };

  player.scene.tweens.add({
    targets: player,
    x: target.x,
    y: target.y,
    ease: "Quad.Out",
    scale: 0,
    duration: 1500,
    onComplete: () => {
      player.state = "Dead";
      player.anims.stop();
      player.alpha = 0;
      player.scale = 1;
    },
  });
}
