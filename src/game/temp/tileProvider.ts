import { GridObject } from "../types";
import { Cardinal } from "../types";
import { Wall } from "./wallProvider";
import Portal from "./portal";
import MainScene from "../scenes/MainScene";

export interface FloorTile {
  row: number;
  col: number;
  type:
    | "Void"
    | "Portalable"
    | "Ice"
    | "Water"
    | "Conveyor"
    | "Propulsion"
    | "Button";
  corner?: "tl" | "tr" | "bl" | "br";
  direction?: "CW" | "CCW";
  speed?: number;
}

class FloorTileProvider extends Phaser.GameObjects.Graphics {
  scene: MainScene;
  graphics!: Phaser.GameObjects.Graphics;
  positions!: (FloorTile | null)[][];
  rowCount: number;
  colCount: number;
  constructor(scene: MainScene) {
    super(scene as MainScene);
    this.scene = scene;
    this.name = "Floor Tile Provider";
    this.rowCount = scene.rowCount;
    this.colCount = scene.colCount;
    this.graphics = scene.add.graphics();
    this.createGrid();
    scene.add.existing(this);
  }
  createGrid() {
    const grid = [];
    for (let row = 0; row < this.rowCount; row++) {
      const rowCells = [];
      for (let col = 0; col < this.colCount; col++) {
        rowCells.push(null);
      }
      grid.push(rowCells);
    }
    this.positions = grid;
  }
  addFloorTile(
    row: number,
    col: number,
    type: "Void" | "Ice" | "Water" | "Conveyor" | "Propulsion"
  ) {
    const { player, allWalls, allObjects } = this.scene;
    if (allWalls[row][col] || allObjects.has(`${row},${col}`)) return;
    if (type === "Water" && player.row === row && player.col === col) return;

    this.positions[row][col] = { row, col, type };
    console.log("Adding", type, "tile at:", row, col);
    this.drawFloorTiles();
  }
  removeFloorTile(row: number, col: number) {
    if (this.positions[row][col] !== null) {
      this.positions[row][col] = null;
      this.drawFloorTiles();
    }
  }

  drawFloorTiles() {
    this.graphics.destroy();
    this.graphics = this.scene.add.graphics();
    const { cellSize } = this.scene;

    for (const row of this.positions) {
      for (const cell of row) {
        if (cell) {
          const { row, col } = cell;

          const x = col * cellSize;
          const y = row * cellSize;

          let tileColor = 0x000000;

          switch (cell.type) {
            case "Void":
              tileColor = 0x000000;
              break;
            case "Ice":
              tileColor = 0x99e2ff;
              break;
            case "Portalable":
              tileColor = 0xffffff;
              break;
            case "Conveyor":
              tileColor = 0x222222;
              break;
            case "Water":
              tileColor = 0x1a73cc;
              break;
            case "Propulsion":
              tileColor = 0xff8822;
              break;
            case "Button":
              continue;
          }

          const neighbors = {
            top: this.positions[row - 1][col],
            bottom: this.positions[row + 1][col],
            left: this.positions[row][col - 1],
            right: this.positions[row][col + 1],
          };

          for (const [side, neighbor] of Object.entries(neighbors)) {
            if (!neighbor) continue;
            if (neighbor.type !== cell.type) {
              neighbors[side as Cardinal] = null;
            }
          }

          const radii = {
            tl: !neighbors.top && !neighbors.left ? 6 : 0,
            tr: !neighbors.top && !neighbors.right ? 6 : 0,
            bl: !neighbors.bottom && !neighbors.left ? 6 : 0,
            br: !neighbors.bottom && !neighbors.right ? 6 : 0,
          };

          this.graphics.fillStyle(tileColor);
          this.graphics.fillRoundedRect(
            x,
            y,
            cellSize,
            cellSize,
            cell.type === "Water" ? 0 : radii
          );

          if (this.type === "Water") continue;
          if (radii.tl && !radii.tr && !radii.bl && !radii.br)
            cell.corner = "tl";
          else if (radii.tr && !radii.tl && !radii.bl && !radii.br)
            cell.corner = "tr";
          else if (radii.bl && !radii.tr && !radii.tl && !radii.br)
            cell.corner = "bl";
          else if (radii.br && !radii.tr && !radii.tl && !radii.bl)
            cell.corner = "br";
          else {
            cell.corner = undefined;
          }
        }
      }
    }
    this.graphics.setDepth(0);
    this.graphics.alpha = 0.75;
  }
}
export default FloorTileProvider;
