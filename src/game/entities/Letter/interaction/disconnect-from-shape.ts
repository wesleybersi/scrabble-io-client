import { Cardinal } from "../../../types";
import { getOppositeSide } from "../../../utils/helper-functions";
import Letter from "../letter";

export default function disconnectAll(this: Letter) {
  for (const [side, letter] of Object.entries(this.adjacentLetters)) {
    if (!letter || !letter.active) continue;
    if (this.connectedTo[side as Cardinal]) {
      this.connectedTo[side as Cardinal] = undefined;
      letter.connectedTo[getOppositeSide(side as Cardinal)] = undefined;
    }

    const shape = Array.from(this.shape);
    for (const crate of shape) {
      crate.shape.delete(this);
      crate.update();
      crate.autoTile();
    }
    this.autoTile();
  }
}
