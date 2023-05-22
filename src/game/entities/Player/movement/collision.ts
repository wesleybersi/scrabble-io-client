import { Player } from "../player";
import Crate from "../../Crate/crate";

import { Direction, Cardinal } from "../../../types";
import {
  getOppositeSide,
  directionToCardinal,
  directionToAdjacent,
  cardinalToDirection,
  getOppositeDirection,
} from "../../../utils/opposite";

import { setPortalReflection } from "../portals/reflection";
import redirectTargetToPortal from "../portals/redirectTarget";

//Function that returns true if player is unable to move.
//Object interaction is taken care of along the way.
export function isObstructed(player: Player, direction: Direction) {
  const {
    portals,
    allCrates,
    allWalls,
    allRamps,
    rowCount,
    colCount,
    tilemap,
  } = player.scene;
  const { floor } = tilemap;
  let side = getOppositeSide(directionToCardinal(direction));
  const { row: targetRow, col: targetCol } = directionToAdjacent(
    direction,
    player.row,
    player.col
  );
  const pullDirection = direction;
  if (targetRow < 0 || targetRow >= rowCount) return true; //Out of bounds
  if (targetCol < 0 || targetCol >= colCount) return true; //Out of bounds

  const targetPos = `${targetRow},${targetCol}`;
  let targetFloor = floor.getTileAt(targetCol, targetRow);
  let targetWall = allWalls.get(targetPos);
  let targetRamp = allRamps.get(targetPos);
  let targetCrate = allCrates.get(targetPos)?.active
    ? allCrates.get(targetPos)
    : undefined;

  //If portals are active, new target?
  if (portals.a && portals.b) {
    //If standing in front of portal, and other portal is on floor
    setPortalReflection(player, direction, targetRow, targetCol, portals);

    const { newTarget, newSide, newDirection, invalid } =
      redirectTargetToPortal(player, targetRow, targetCol, side, portals);

    if (!invalid) {
      side = newSide;
      direction = newDirection;

      targetFloor = tilemap.floor.getTileAt(newTarget.col, newTarget.row);
      targetWall = allWalls.get(`${newTarget.row},${newTarget.col}`);
      targetRamp = allRamps.get(`${newTarget.row},${newTarget.col}`);
      targetCrate = allCrates.get(`${newTarget.row},${newTarget.col}`);
      if (targetCrate && !targetCrate.active) targetCrate = undefined;
    }
  }

  //Ramps

  const currentRamp = allRamps.get(`${player.row},${player.col}`);

  if (currentRamp) {
    if (
      currentRamp.low.row === player.row &&
      currentRamp.low.col === player.col
    ) {
      if (direction === currentRamp.direction) {
        player.z = currentRamp.high.zValue;
      } else if (direction === getOppositeDirection(currentRamp.direction)) {
        player.z = 0;
        player.floor = 0;
      } else return true;
    } else if (
      currentRamp.high.row === player.row &&
      currentRamp.high.col === player.col
    ) {
      if (direction === currentRamp.direction) {
        if (
          (targetWall && targetWall.wallType === "half-wall") ||
          targetCrate
        ) {
          player.z = 16;
          player.floor = 1;
        } else return true;
      } else if (direction === getOppositeDirection(currentRamp.direction)) {
        player.z = currentRamp.low.zValue;
      } else return true;
    }
    return false;
  }

  if (targetRamp) {
    if (targetRamp.low.row === targetRow && targetRamp.low.col === targetCol) {
      if (direction === targetRamp.direction) player.z = targetRamp.low.zValue;
      else return true;
    } else if (
      targetRamp.high.row === targetRow &&
      targetRamp.high.col === targetCol &&
      player.floor > 0
    ) {
      if (direction === getOppositeDirection(targetRamp.direction)) {
        return false;
      } else return true;
    } else return true;
  }
  //TODO Crate next to targetRamp.low?

  if (targetWall) {
    if (player.z !== targetWall.zValue) {
      if (targetWall.isColliding(direction)) return true;
    }
  }

  if (player.floor > 0 && !targetWall && !targetCrate && !targetRamp)
    return true;

  if (targetFloor) {
    switch (targetFloor.properties.name) {
      case "Void":
        player.state = "Falling";
        return false;
        break;
      case "Water":
        return true;
      case "Ice": {
        console.log("Ice forcing movement", direction);

        const cornerPiece = targetFloor.properties.cornerPiece;

        if (!targetCrate) {
          if (!cornerPiece) {
            player.forceMovement[direction] = true;
          } else if (cornerPiece) {
            if (cornerPiece.direction === "TopLeft") {
              if (direction === "up") {
                player.forceMovement.right = true;
              } else if (direction === "left") {
                player.forceMovement.down = true;
              } else {
                player.forceMovement[direction] = true;
              }
            } else if (cornerPiece.direction === "TopRight") {
              if (direction === "up") {
                player.forceMovement.left = true;
              } else if (direction === "right") {
                player.forceMovement.down = true;
              } else {
                player.forceMovement[direction] = true;
              }
            } else if (cornerPiece.direction === "BottomLeft") {
              if (direction === "down") {
                player.forceMovement.right = true;
              } else if (direction === "left") {
                player.forceMovement.up = true;
              } else {
                player.forceMovement[direction] = true;
              }
            } else if (cornerPiece.direction === "BottomRight") {
              if (direction === "down") {
                player.forceMovement.left = true;
              } else if (direction === "right") {
                player.forceMovement.up = true;
              } else {
                player.forceMovement[direction] = true;
              }
            }
          }

          player.state = "Sliding";
          player.moveDuration = Math.floor(player.initialMoveDuration / 1.5);
          // return false;
        }
      }
    }
    if (targetFloor.properties.oil) {
      player.moveDuration = player.initialMoveDuration * 3;
      // player.ease = "Quad.Out";
    }
  }

  let usePullDirection = false;
  let heldCrate: Crate | undefined = undefined;
  if (player.state === "Holding") {
    for (const [side, crate] of Object.entries(player.holding)) {
      if (crate && !crate.active) continue;
      if (crate) {
        if (
          direction !== cardinalToDirection(side as Cardinal) &&
          direction !==
            getOppositeDirection(cardinalToDirection(side as Cardinal))
        )
          return true;
        usePullDirection = true;
        heldCrate = crate;
      } else if (targetCrate === crate) {
        heldCrate = crate;
        player.state = "Idle";
        player.holding[side as Cardinal] = null;
      }
    }
    if (heldCrate) {
      if (targetCrate && targetCrate !== heldCrate) {
        console.log("Cant push and pull");
        return true;
      } else if (targetCrate === heldCrate) {
        player.state = "Idle";
        player.holding[side as Cardinal] = null;
      } else {
        targetCrate = heldCrate;
      }
    }
  }

  if (targetCrate && targetCrate.active && targetCrate.floor === player.floor) {
    const { allIncluded, abort } = targetCrate.prepareMovement(
      usePullDirection ? pullDirection : direction
    );

    for (const [side, spikes] of Object.entries(targetCrate.extension)) {
      if (player.state !== "Holding") {
        if (
          spikes &&
          getOppositeDirection(cardinalToDirection(side as Cardinal)) ===
            direction
        ) {
          player.spiked = true;
          return false;
        }
      }
    }

    if (abort) {
      console.log("Aborted");
      return true;
    }

    // const movableEnteringPortal = Array.from(allIncluded).find(
    //   (movable) => movable.portalTrigger
    // );

    const portalSet = new Set<Crate>();
    // let portalDirection: Direction = direction;
    // if (movableEnteringPortal && movableEnteringPortal.portalTrigger) {
    //   const portalPosition = `${movableEnteringPortal.portalTrigger.to.row},${movableEnteringPortal.portalTrigger.to.col}`;
    //   const portalTarget = allObjects.get(portalPosition);

    //   if (portalTarget && portalTarget instanceof Movable) {
    //     const { allIncluded, abort } = portalTarget.prepareMovement(
    //       movableEnteringPortal.portalTrigger.direction
    //     );
    //     if (abort) {
    //       console.log("Aborted by portalset");
    //       return true;
    //     }
    //     portalSet = allIncluded;
    //     portalDirection = movableEnteringPortal.portalTrigger.direction;
    //   }
    // }

    let weightMultiplier = 1;
    for (const crate of allIncluded) {
      if (crate.weight > weightMultiplier) weightMultiplier = crate.weight;
    }

    const completedTweens = new Set<Crate>();

    const duration = Math.max(
      Math.sqrt(allIncluded.size + portalSet.size) * player.moveDuration * 0.5,
      player.moveDuration
    );

    for (const crate of allIncluded) {
      if (crate.state === "Moving") return true;
      crate.makeMove(
        usePullDirection ? pullDirection : direction,
        allIncluded,
        duration * weightMultiplier,
        completedTweens
      );
    }
    // const completedPortalTweens = new Set<Crate>();
    // if (portalSet.size > 0) {
    //   for (const obj of portalSet) {
    //     if (obj.moving) return true;
    //     obj.move(portalDirection, portalSet, duration, completedPortalTweens);
    //   }
    // }
    player.moveDuration = duration * weightMultiplier;
    player.ease = "Linear";

    // if (targetCrate.crateType === "Metal") return true;

    if (player.state === "Holding") player.state = "Pulling";
    else player.state = "Pushing";

    return false;
  }
}
