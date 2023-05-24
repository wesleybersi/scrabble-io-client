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
  let targetRamp = allRamps[player.floor].get(targetPos);
  let targetCrate = allCrates[player.floor].get(targetPos)?.active
    ? allCrates[player.floor].get(targetPos)
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
      targetRamp = allRamps[player.floor].get(
        `${newTarget.row},${newTarget.col}`
      );
      targetCrate = allCrates[player.floor].get(
        `${newTarget.row},${newTarget.col}`
      );
      if (targetCrate && !targetCrate.active) targetCrate = undefined;
    }
  }

  //Ramps
  //ANCHOR Currently on ramp
  const currentRamp = allRamps[player.floor].get(`${player.row},${player.col}`);
  const { floorHeight } = player.scene;
  if (currentRamp && currentRamp.floor === player.floor) {
    if (
      currentRamp.low.row === player.row &&
      currentRamp.low.col === player.col
    ) {
      if (direction === currentRamp.direction) {
        //If moving up the ramp
        player.z = currentRamp.high.zValue;
      } else if (direction === getOppositeDirection(currentRamp.direction)) {
        //If moving down > off the ramp
        // player.floor--;
        player.z = player.floor * floorHeight;
      } else return true;
    } else if (
      currentRamp.high.row === player.row &&
      currentRamp.high.col === player.col
    ) {
      if (direction === currentRamp.direction) {
        if (
          (targetWall && Math.max(...targetWall.collidesOn) === player.floor) ||
          targetCrate
        ) {
          //If moving to next floor
          player.floor++;
          player.z = player.floor * floorHeight;
        } else return true;
      } else if (direction === getOppositeDirection(currentRamp.direction)) {
        //If moving down the ramp
        player.z = currentRamp.low.zValue;
      } else return true;
    }
    return false;
  }

  //ANCHOR Entering ramp

  if (!targetRamp && player.floor > 0) {
    //If no ramp is found. It will look for a ramp on the floor below.
    //Which is always the case when going down a ramp
    targetRamp = allRamps[player.floor - 1].get(targetPos);
  }
  if (targetRamp) {
    if (targetRamp.low.row === targetRow && targetRamp.low.col === targetCol) {
      //If entering ramp from below
      if (direction === targetRamp.direction) player.z = targetRamp.low.zValue;
      else return true;
    } else if (
      targetRamp.high.row === targetRow &&
      targetRamp.high.col === targetCol &&
      player.floor > 0
    ) {
      //If entering ramp from above
      if (direction === getOppositeDirection(targetRamp.direction)) {
        //When you enter, floor gets reduced
        player.floor--;
        return false;
      } else return true;
    } else return true;
  }
  //TODO Crate next to targetRamp.low?

  if (targetWall) {
    if (targetWall.collidesOn.includes(player.floor)) {
      if (targetWall.isColliding(direction)) return true;
    }
    if (Math.max(...targetWall.collidesOn) + 1 < player.floor) {
      return true;
    }
  }

  if (player.floor > 0 && !targetWall && !targetCrate && !targetRamp) {
    //Check floor below
    const crate = allCrates[player.floor - 1].get(targetPos)?.active
      ? allCrates[player.floor - 1].get(targetPos)
      : undefined;
    if (crate) return false;
    return true;
  }

  if (player.floor === 0 && targetFloor) {
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
