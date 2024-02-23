// import Tile from "../letter";
// import { Cardinal } from "../../../types";

// export default function connectAtRandom(this: Tile, probability: number) {
//   const directions = [];
//   const top = Math.floor(Math.random() * probability);
//   const bottom = Math.floor(Math.random() * probability);
//   const left = Math.floor(Math.random() * probability);
//   const right = Math.floor(Math.random() * probability);

//   if (!top && !this.connectedTo.top) directions.push("top");
//   if (!bottom && !this.connectedTo.bottom) directions.push("bottom");
//   if (!left && !this.connectedTo.left) directions.push("left");
//   if (!right && !this.connectedTo.right) directions.push("right");

//   if (directions.length > 0) {
//     this.connectShape(directions as Cardinal[]);
//   }
// }
