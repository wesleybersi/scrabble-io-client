import { Player } from "../player";

export default function tweenIntoVoid(
  player: Player,
  col: number,
  row: number
) {
  const { cellWidth, cellHeight } = player.scene;

  const target = {
    x: Math.floor(col * cellWidth) + cellWidth / 2,
    y: Math.floor(row * cellHeight) + cellHeight / 2,
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
