// import { Direction, Cardinal } from "../../../types";
// import {
//   cardinalToDirection,
//   directionToCardinal,
//   getOppositeDirection,
// } from "../../../utils/helper-functions";
// import { Player } from "../player";
// import Wall from "../../Wall/wall";
// import Tile from "../../Tile/letter";

// //Function that returns true if player is unable to move.
// //Also takes care of crates
// export function isObstructed(player: Player, direction: Direction): boolean {
//   player.detectAdjacent();
//   let directTarget = player.adjacent[directionToCardinal(direction)];

//   if (!directTarget && player.state !== "Holding") return false;
//   if (directTarget instanceof Wall) {
//     if (directTarget.isColliding(direction)) return true;
//   }

//   //ANCHOR Pulling
//   let heldLetter: Tile | undefined = undefined;
//   if (player.state === "Holding") {
//     for (const [side, letter] of Object.entries(player.holding)) {
//       if (!letter || (letter && !letter.active)) continue;

//       if (
//         direction !==
//         getOppositeDirection(cardinalToDirection(side as Cardinal))
//       ) {
//         player.state = "Idle";
//         break;
//       }

//       heldLetter = letter;

//       if (directTarget) {
//         //If object behind
//         console.log("Cant push and pull");
//         return true;
//       } else {
//         directTarget = heldLetter;
//         break;
//       }
//     }
//   }

//   if (directTarget instanceof Tile) {
//     if (!directTarget.active) return true;
//     if (directTarget.isMoving) return true;
//     if (directTarget.isCalculating) return true;
//     if (directTarget.letter === "?") directTarget.setRandomLetter();

//     const { abort, duration } = directTarget.attemptMove(direction);
//     if (abort) return true;
//     player.inMovement = true;
//     player.moveDuration = duration ?? player.moveDuration;

//     if (player.state === "Holding") player.state = "Pulling";
//     else player.state = "Pushing";
//     return false;
//   }
//   return false;
// }
