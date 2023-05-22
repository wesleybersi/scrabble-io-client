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
  const { allWalls, allRamps } = crate.scene;

  let aborted = false;
  const { row: targetRow, col: targetCol } = directionToAdjacent(
    direction,
    crate.row,
    crate.col
  );
  const position = `${targetRow},${targetCol}`;
  const targetWall = allWalls.get(position);
  const targetRamp = allRamps.get(position);

  movingSet.add(crate);
  visitedSet.add(crate);

  if (targetWall && targetWall.isColliding(direction)) {
    aborted = true;
  }
  if (targetRamp) aborted = true;

  for (const [side, adjacentCrate] of Object.entries(crate.adjacentCrates)) {
    if (aborted) break;
    if (!adjacentCrate || !adjacentCrate.active || adjacentCrate.isFalling)
      continue;

    if (
      !crate.connectedTo[side as Cardinal] &&
      directionToCardinal(direction as Direction) !== side
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
