import Letter from "../../Letter/letter";
import Wall from "../wall";

export default function drawShadow(this: Wall) {
  return;
  const { scene, connectedTo, adjacent } = this;
  const { cellHeight } = this.scene;
  const letterBelow = adjacent.bottom && adjacent.bottom instanceof Letter;
  if (!this.shadow) {
    this.shadow = this.scene.add.sprite(
      this.x,
      this.y + cellHeight - 6,
      letterBelow ? "shadow-6" : "shadow-12"
    );
  }
  this.shadow.setTexture(letterBelow ? "shadow-6" : "shadow-12");
  this.shadow.x = this.x;
  this.shadow.y =
    adjacent.bottom && adjacent.bottom instanceof Letter
      ? this.y + cellHeight - 6
      : this.y + cellHeight + 2;
  this.shadow.alpha = 0.2;

  this.shadow.setDepth(letterBelow ? this.row + 2 : this.row);
}
