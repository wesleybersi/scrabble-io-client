import Laser from "../laser";

export default function drawExpanse(laser: Laser) {
  const { cellSize } = laser.scene;
  const { direction, expanse, origin } = laser;

  laser.editorExpanseTiles.clear();
  laser.editorExpanseTiles.fillStyle(0xff0000, 0.2);
  if (expanse > 1) {
    if (direction === "up" || direction === "down")
      laser.editorExpanseTiles.fillRect(
        laser.movement === "in"
          ? origin.col * cellSize + cellSize - expanse * cellSize
          : origin.col * cellSize,
        origin.row * cellSize,
        expanse * cellSize,
        cellSize
      );
    else if (direction === "left" || direction === "right") {
      laser.editorExpanseTiles.fillRect(
        origin.col * cellSize,
        laser.movement === "in"
          ? origin.row * cellSize + cellSize - expanse * cellSize
          : origin.row * cellSize,
        cellSize,
        expanse * cellSize
      );
    }
  } else {
    laser.editorExpanseTiles.fillRect(
      laser.col * cellSize,
      laser.row * cellSize,
      cellSize,
      cellSize
    );
  }
}
