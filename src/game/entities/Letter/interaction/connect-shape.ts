import { getOppositeSide } from "../../../utils/helper-functions";
import Letter from "../letter";
import { Cardinal } from "../../../types";

export default function connectShape(this: Letter, at?: string[]) {
  const shape = this.shape;

  for (const [side, letter] of Object.entries(this.adjacentLetters)) {
    if (at && !at.includes(side as Cardinal)) continue;
    if (!letter || !letter.active) {
      this.connectedTo[side as Cardinal] = undefined;
      continue;
    }
    for (const part of Array.from(letter.shape)) {
      shape.add(part);
    }

    letter.connectedTo[getOppositeSide(side as Cardinal)] = this;
    this.connectedTo[side as Cardinal] = letter;
  }
  for (const letter of shape) {
    letter.shape = shape;
  }

  this.shape = shape;
  this.autoTile();
}
