// import { Cardinal } from "../../../types";
// import { getOppositeSide } from "../../../utils/helper-functions";
// import Tile from "../letter";

// export default function disconnectAll(this: Tile) {
//   for (const [side, letter] of Object.entries(this.adjacentTiles)) {
//     if (!letter || !letter.active) continue;
//     if (this.connectedTo[side as Cardinal]) {
//       this.connectedTo[side as Cardinal] = undefined;
//       letter.connectedTo[getOppositeSide(side as Cardinal)] = undefined;
//     }

//     const shape = Array.from(this.shape);
//     for (const crate of shape) {
//       crate.shape.delete(this);
//       crate.update();
//       crate.autoTile();
//     }
//     this.autoTile();
//   }
// }
