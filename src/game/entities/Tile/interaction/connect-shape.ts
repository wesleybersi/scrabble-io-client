// import { getOppositeSide } from "../../../utils/helper-functions";
// import Tile from "../letter";
// import { Cardinal } from "../../../types";

// export default function connectShape(this: Tile, at?: string[]) {
//   const shape = this.shape;

//   for (const [side, tile] of Object.entries(this.connectedTo)) {
//     if (at && !at.includes(side as Cardinal)) continue;
//     if (!tile || !tile.active) {
//       this.connectedTo[side as Cardinal] = false;
//       continue;
//     }
//     for (const part of Array.from(tile.shape)) {
//       shape.add(part);
//     }

//     tile.connectedTo[getOppositeSide(side as Cardinal)] = true;
//     this.connectedTo[side as Cardinal] = true;
//   }
//   for (const letter of shape) {
//     letter.shape = shape;
//   }

//   this.shape = shape;
//   this.update();
// }
