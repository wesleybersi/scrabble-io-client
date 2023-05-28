import { Direction, Cardinal } from "../../../types";
import Crate from "../crate";
import {
  directionToAdjacent,
  directionToCardinal,
} from "../../../utils/helper-functions";

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
  const { allWalls, allRamps } = crate.scene;

  let aborted = false;
  const { row: targetRow, col: targetCol } = directionToAdjacent(
    direction,
    crate.row,
    crate.col
  );
  const position = `${targetRow},${targetCol}`;
  const targetWall = allWalls[crate.floor].get(position);
  const targetRamp = allRamps[crate.floor].get(position);

  visitedSet.add(crate);
  if (
    crate.isFalling ||
    targetRamp ||
    (targetWall && targetWall.isColliding(direction))
  ) {
    aborted = true;
  }
  movingSet.add(crate);

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
    ) {
      continue;
    }

    if (visitedSet.has(adjacentCrate)) {
      continue;
    }
    movingSet.add(adjacentCrate);
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
