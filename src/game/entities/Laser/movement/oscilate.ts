import Laser from "../laser";

export default function oscilate(laser: Laser) {
  const { cellSize } = laser.scene;
  const target: { x: number; y: number } = { x: laser.x, y: laser.y };

  if (laser.movement === "in") {
    target.x =
      laser.direction === "down" || laser.direction === "up"
        ? laser.x + cellSize - cellSize * laser.expanse
        : laser.x;
    target.y =
      laser.direction === "left" || laser.direction === "right"
        ? laser.y + cellSize - cellSize * laser.expanse
        : laser.y;
  } else if (laser.movement === "out") {
    target.x =
      laser.direction === "down" || laser.direction === "up"
        ? laser.x - cellSize + cellSize * laser.expanse
        : laser.x;
    target.y =
      laser.direction === "left" || laser.direction === "right"
        ? laser.y - cellSize + cellSize * laser.expanse
        : laser.y;
  }

  laser.oscilation = laser.scene.tweens.add({
    targets: [laser],
    x: target.x,
    y: target.y,
    duration: laser.expanse * 750,
    yoyo: true,
    repeat: -1,
    ease: "Sine.InOut",
    onUpdate: () => {
      laser.row = Math.floor(laser.y / cellSize);
      laser.col = Math.floor(laser.x / cellSize);
    },
  });
}
