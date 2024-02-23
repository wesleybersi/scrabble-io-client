// import { Direction, Cardinal } from "../../../types";
// import Tile from "../letter";
// import {
//   directionToAdjacent,
//   directionToCardinal,
// } from "../../../utils/helper-functions";
// import {
//   CELL_HEIGHT,
//   CELL_WIDTH,
//   MOVE_DURATION,
// } from "../../../scenes/Main/constants";
// import { Player } from "../../Player/player";

// export function attemptMove(
//   this: Tile,
//   direction: Direction,
//   initialSet: Set<Tile> = new Set()
// ): { abort: boolean; duration?: number } {
//   if (!this.active) return { abort: true };
//   if (this.isMoving) return { abort: true };

//   const { allIncluded, abort } = this.prepareMove(
//     direction,
//     undefined,
//     undefined,
//     initialSet
//   );
//   if (abort) return { abort };

//   let weightMultiplier = 1;

//   for (const letter of allIncluded) {
//     if (letter.weight > weightMultiplier) weightMultiplier = letter.weight;
//   }

//   const completed = new Set<Tile>();
//   const duration = Math.max(
//     Math.sqrt(allIncluded.size) * MOVE_DURATION * 0.8,
//     MOVE_DURATION
//   );

//   calculateCameraOffset(allIncluded, this.scene.player, direction);

//   for (const letter of allIncluded) {
//     letter.makeMove(
//       direction,
//       allIncluded,
//       duration * weightMultiplier,
//       completed
//     );
//   }

//   return { abort: false, duration: duration * weightMultiplier };
// }

// export default function prepareMove(
//   this: Tile,
//   direction: Direction,
//   movingSet: Set<Tile> = new Set(),
//   visitedSet: Set<Tile> = new Set(),
//   initialSet: Set<Tile> = new Set()
// ): {
//   allIncluded: Set<Tile>;
//   abort: boolean;
// } {
//   let aborted = false;

//   visitedSet.add(this);

//   for (const initial of initialSet) {
//     if (!visitedSet.has(initial)) {
//       aborted = initial.prepareMove(
//         direction,
//         movingSet,
//         visitedSet,
//         initialSet
//       ).abort;
//     }
//   }

//   const { allWalls } = this.scene;
//   const { row: targetRow, col: targetCol } = directionToAdjacent(
//     direction,
//     this.row,
//     this.col
//   );
//   if (targetRow < 0 || targetRow >= this.scene.rowCount) aborted = true;
//   if (targetCol < 0 || targetCol >= this.scene.colCount) aborted = true;
//   const position = `${targetRow},${targetCol}`;
//   const targetWall = allWalls.get(position);

//   if (this.isMoving) aborted = true;
//   if (targetWall && targetWall.isColliding(direction)) {
//     aborted = true;
//   }
//   movingSet.add(this);

//   this.update(); //Define surroundings
//   for (const [side, adjacentLetter] of Object.entries(this.adjacentTiles)) {
//     if (aborted) break;
//     if (
//       !adjacentLetter ||
//       !adjacentLetter.active ||
//       visitedSet.has(adjacentLetter)
//     )
//       continue;

//     if (
//       !this.connectedTo[side as Cardinal] &&
//       directionToCardinal(direction as Direction) !== side
//     ) {
//       continue;
//     }

//     movingSet.add(adjacentLetter);
//     aborted = adjacentLetter.prepareMove(
//       direction,
//       movingSet,
//       visitedSet,
//       initialSet
//     ).abort;
//   }

//   if (aborted) movingSet.clear();

//   return {
//     allIncluded: movingSet,
//     abort: aborted,
//   };
// }
