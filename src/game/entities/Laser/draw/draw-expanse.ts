import Laser from "../laser";

export default function drawExpanse(laser: Laser) {
  const { cellHeight, cellWidth } = laser.scene;
  const { direction, expanse, origin } = laser;

  laser.editorExpanseTiles.clear();
  laser.editorExpanseTiles.fillStyle(0xff0000, 0.2);
  if (expanse > 1) {
    if (direction === "up" || direction === "down")
      laser.editorExpanseTiles.fillRect(
        laser.movement === "in"
          ? origin.col * cellWidth + cellWidth - expanse * cellWidth
          : origin.col * cellWidth,
        origin.row * cellHeight,
        expanse * cellWidth,
        cellHeight
      );
    else if (direction === "left" || direction === "right") {
      laser.editorExpanseTiles.fillRect(
        origin.col * cellWidth,
        laser.movement === "in"
          ? origin.row * cellHeight + cellHeight - expanse * cellHeight
          : origin.row * cellHeight,
        cellWidth,
        expanse * cellHeight
      );
    }
  } else {
    laser.editorExpanseTiles.fillRect(
      laser.col * cellWidth,
      laser.row * cellHeight,
      cellWidth,
      cellHeight
    );
  }
}
