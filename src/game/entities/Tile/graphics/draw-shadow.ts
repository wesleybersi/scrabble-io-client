import { CELL_HEIGHT, CELL_WIDTH } from "../../../scenes/Main/constants";
import Tile from "../letter";

export default function drawShadow(this: Tile) {
  // return;
  if (!this.shadowGraphic) {
    this.shadowGraphic = this.scene.add.sprite(this.x, this.y, "blocks");
  }
  const xOffset = 8;
  const yOffset = 8;

  this.shadowGraphic.setTint(0x000000);
  this.shadowGraphic.x = this.x + xOffset;
  this.shadowGraphic.y = this.y + CELL_HEIGHT - CELL_HEIGHT + yOffset;
  this.shadowGraphic.alpha = 0.15;
  this.shadowGraphic.setDepth(this.y - 1);
}
