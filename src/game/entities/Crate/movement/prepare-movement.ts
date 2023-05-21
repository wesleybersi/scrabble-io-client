import { Direction, Cardinal } from "../../../types";
import Crate from "../crate";
import { isColliding } from "../../tilemap/wall-tiles/detect-collision";
// import { getOppositeSide, directionToCardinal } from "../../../utils/opposite";

export default function prepareMovement(
  crate: Crate,
  direction: Direction,
  movingSet: Set<Crate> = new Set(),
  visitedSet: Set<Crate> = new Set()
): {
  allIncluded: Set<Crate>;
  abort: boolean;
  enteringPortal?: Crate;
} {
  const { portals, tilemap } = crate.scene;
  const { walls } = tilemap;

  //   let enterPortal = false;
  let aborted = false;
  let movingTowards: Cardinal = "top";
  const directTarget = { row: crate.row, col: crate.col };

  if (direction === "up") {
    movingTowards = "top";
    directTarget.row--;
  } else if (direction === "down") {
    movingTowards = "bottom";
    directTarget.row++;
  } else if (direction === "left") {
    movingTowards = "left";
    directTarget.col--;
  } else if (direction === "right") {
    movingTowards = "right";
    directTarget.col++;
  }

  movingSet.add(crate);
  visitedSet.add(crate);

  //   if (portals.a && portals.b) {
  //     enterPortal = crate.checkPortal(
  //       getOppositeSide(directionToCardinal(direction)),
  //       directTarget.row,
  //       directTarget.col
  //     );
  //   }
  //   if (!enterPortal) {
  if (isColliding(walls, direction, directTarget.row, directTarget.col)) {
    aborted = true;
  }
  //   }
  for (const [side, c] of Object.entries(crate.adjacentCrates)) {
    if (aborted) break;
    if (!c) continue;
    if (!c.active) continue;
    if (c.isFalling) continue;

    //If connected to piece in portal?

    if (!crate.connectedTo[side as Cardinal] && movingTowards !== side)
      continue;
    if (c instanceof Crate) {
      movingSet.add(c);

      if (visitedSet.has(c)) {
        continue;
      }
      aborted = prepareMovement(c, direction, movingSet, visitedSet).abort;
      if (aborted) break;
    }
  }

  if (aborted) movingSet.clear();

  return {
    allIncluded: movingSet,
    abort: aborted,
  };
}
