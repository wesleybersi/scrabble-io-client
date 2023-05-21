import Laser from "../laser";

export default function oscilate(laser: Laser) {
  const { cellWidth, cellHeight } = laser.scene;
  const target: { x: number; y: number } = { x: laser.x, y: laser.y };

  if (laser.movement === "in") {
    target.x =
      laser.direction === "down" || laser.direction === "up"
        ? laser.x + cellWidth - cellWidth * laser.expanse
        : laser.x;
    target.y =
      laser.direction === "left" || laser.direction === "right"
        ? laser.y + cellHeight - cellHeight * laser.expanse
        : laser.y;
  } else if (laser.movement === "out") {
    target.x =
      laser.direction === "down" || laser.direction === "up"
        ? laser.x - cellWidth + cellWidth * laser.expanse
        : laser.x;
    target.y =
      laser.direction === "left" || laser.direction === "right"
        ? laser.y - cellHeight + cellHeight * laser.expanse
        : laser.y;
  }

  laser.oscilation = laser.scene.tweens.add({
    targets: [laser],
    x: target.x,
    y: target.y,
    duration: laser.expanse * 1000,
    yoyo: true,
    repeat: -1,
    ease: "Sine.InOut",
    onUpdate: () => {
      laser.row = Math.floor(laser.y / cellHeight);
      laser.col = Math.floor(laser.x / cellWidth);
    },
  });
}
