import MainScene from "../MainScene";
import { CELL_HEIGHT, CELL_WIDTH } from "../constants";

export default function updateViewport(this: MainScene) {
  const camera = this.cameras.main;

  const viewportX = camera.worldView.x / camera.zoom;
  const viewportY = camera.worldView.y / camera.zoom;

  const viewportWidth = camera.width / camera.zoom;
  const viewportHeight = camera.height / camera.zoom;

  const cellHeight = CELL_HEIGHT / camera.zoom;
  const cellWidth = CELL_HEIGHT / camera.zoom;

  const extendedArea = 1; // Number of additional rows and columns to consider outside the viewport

  this.viewport.startRow = Math.floor(
    (viewportY - extendedArea * cellHeight) / cellHeight
  );
  this.viewport.startCol = Math.floor(
    (viewportX - extendedArea * cellWidth) / cellWidth
  );

  this.viewport.visibleRows = Math.ceil(
    (viewportHeight + extendedArea * CELL_HEIGHT) / CELL_HEIGHT
  );
  this.viewport.visibleCols = Math.ceil(
    (viewportWidth + extendedArea * CELL_WIDTH) / CELL_WIDTH
  );

  // if (
  //   this.viewport.prevStartCol !== this.viewport.startCol ||
  //   this.viewport.prevStartRow !== this.viewport.startRow
  // ) {
  //   this.viewport.prevStartCol = this.viewport.startCol;
  //   this.viewport.prevStartRow = this.viewport.startRow;
  //   for (const [, letter] of this.allLetters) {
  //     if (
  //       letter.row < this.viewport.startRow ||
  //       letter.row > this.viewport.startRow + this.viewport.visibleRows ||
  //       letter.col < this.viewport.startCol ||
  //       letter.col > this.viewport.startCol + this.viewport.visibleCols
  //     ) {
  //       if (letter.shadow) {
  //         letter.preFX?.destroy();
  //       }

  //       continue;
  //     }

  //     if (!letter.shadow) {
  //       letter.shadow = letter.preFX?.addShadow(-4, -4, 0.025, 0.5, 0x000000);
  //     }
  //   }
  // }
}
