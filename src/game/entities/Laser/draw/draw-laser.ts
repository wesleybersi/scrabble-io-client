import Laser from "../laser";

export default function drawLaser(laser: Laser) {
  const { cellWidth, cellHeight } = laser.scene;
  const { startX, startY, endX, endY } = laser;

  laser.setStrokeStyle(2, 0xff1522); // set a 2-pixel wide red outline
  laser.setOrigin(laser.x, laser.y);

  //Draw Laser line
  laser.setTo(startX, startY, endX, endY);

  //Draw Base
  if (laser.base) laser.base.clear();
  if (laser.index === 0) {
    laser.base.fillStyle(0x222222);
    laser.base.fillRoundedRect(startX - 6, startY - 6, 12, 12, 6);
    laser.base.setDepth(2);
  }

  //Draw Target
  if (laser.rose) laser.rose.clear();
  if (!laser.extension || laser.index !== 0) {
    laser.rose.fillStyle(0xff1522);
    laser.rose.fillRoundedRect(endX - 3, endY - 3, 6, 6, 3);
  }

  //Draw Rails
  if (laser.expanse > 1) {
    laser.rails.clear();
    if (laser.direction === "up" || laser.direction === "down") {
      laser.rails.fillStyle(0x000000);
      laser.rails.fillRect(
        laser.movement === "in"
          ? laser.origin.col * cellWidth + cellWidth - laser.expanse * cellWidth
          : laser.origin.col * cellWidth,
        laser.direction === "up"
          ? laser.origin.row * cellHeight + cellHeight - 3
          : laser.origin.row * cellHeight,
        laser.expanse * cellWidth,
        3
      );
    } else if (laser.direction === "left" || laser.direction === "right") {
      laser.rails.fillStyle(0x000000);
      laser.rails.fillRect(
        laser.direction === "left"
          ? laser.origin.col * cellWidth + cellWidth - 3
          : laser.origin.col * cellWidth,
        laser.movement === "in"
          ? laser.origin.row * cellHeight +
              cellHeight -
              laser.expanse * cellHeight
          : laser.origin.row * cellHeight,
        3,
        laser.expanse * cellHeight
      );
    }
  }
}
