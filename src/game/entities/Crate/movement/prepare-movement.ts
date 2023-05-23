import { Direction, Cardinal } from "../../../types";
import Crate from "../crate";
import {
  directionToAdjacent,
  directionToCardinal,
} from "../../../utils/opposite";

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
  const { allWalls, allRamps, allCrates } = crate.scene;

  let aborted = false;
  const { row: targetRow, col: targetCol } = directionToAdjacent(
    direction,
    crate.row,
    crate.col
  );
  const position = `${targetRow},${targetCol}`;
  const targetWall = allWalls.get(position);

  movingSet.add(crate);
  visitedSet.add(crate);

  if (
    targetWall &&
    targetWall.collidesOn.includes(crate.floor) &&
    targetWall.isColliding(direction)
  ) {
    aborted = true;
  }

  for (const [side, adjacentCrate] of Object.entries(crate.adjacentCrates)) {
    if (aborted) break;
    if (!adjacentCrate || !adjacentCrate.active) continue;
    if (adjacentCrate.isFalling) {
      aborted = true;
      break;
    }

    if (
      !crate.connectedTo[side as Cardinal] &&
      directionToCardinal(direction as Direction) !== side &&
      side !== "above"
    )
      continue;

    movingSet.add(adjacentCrate);

    if (visitedSet.has(adjacentCrate)) {
      continue;
    }
    aborted = prepareMovement(
      adjacentCrate,
      direction,
      movingSet,
      visitedSet
    ).abort;
  }

  if (aborted) movingSet.clear();

  return {
    allIncluded: movingSet,
    abort: aborted,
  };
}
