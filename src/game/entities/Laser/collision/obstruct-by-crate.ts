import Laser from "../laser";
import Crate from "../../Crate/crate";

export default function obstructByCrate(laser: Laser, x: number, y: number) {
  const { allCrates, cellWidth, cellHeight } = laser.scene;
  let endY = y;
  let endX = x;
  let obstructingCrate: Crate | null = null;

  for (const [pos, crate] of allCrates) {
    if (!crate.active) continue;
    const left = Math.floor(crate.x - cellWidth / 2);
    const top = Math.floor(crate.y - cellHeight / 2);

    if (laser.direction === "down" && laser.row <= crate.row) {
      if (endY < crate.y - cellHeight / 2) continue;
      if (left >= laser.x - cellWidth && left <= laser.x) {
        endY = crate.y - cellHeight / 2;
        obstructingCrate = crate;
      }
    } else if (laser.direction === "up" && laser.row >= crate.row) {
      if (endY > crate.y - cellHeight / 2) continue;
      if (left >= laser.x - cellWidth && left <= laser.x) {
        endY = crate.y + cellHeight - 8;
        obstructingCrate = crate;
      }
    } else if (laser.direction === "left" && laser.col >= crate.col) {
      if (endX > crate.x - cellWidth / 2) continue;
      if (top >= laser.y - cellHeight && top <= laser.y) {
        endX = crate.x + cellWidth / 2;
        obstructingCrate = crate;
      }
    } else if (laser.direction === "right" && laser.col <= crate.col) {
      if (endX < crate.x - cellWidth / 2) continue;
      if (top >= laser.y - cellHeight && top <= laser.y) {
        endX = crate.x - cellWidth / 2;
        obstructingCrate = crate;
      }
    }
  }
  if (!laser.scene.editor.enabled && obstructingCrate) {
    obstructingCrate.hp--;
  }
  if (obstructingCrate) {
    laser.setDepth(obstructingCrate.row + 1);
    laser.rose.setDepth(obstructingCrate.row + 1);
  }

  return { endX, endY };
}
