import { Player } from "../player";
import Crate from "../../Crate/crate";

import { isColliding } from "../../tilemap/wall-tiles/detect-collision";

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
  const { portals, allCrates, rowCount, colCount, tilemap } = player.scene;
  const { floor, walls } = tilemap;
  let side = getOppositeSide(directionToCardinal(direction));
  const { row: targetRow, col: targetCol } = directionToAdjacent(
    direction,
    player.row,
    player.col
  );
  const pullDirection = direction;
  if (targetRow < 0 || targetRow >= rowCount) return true; //Out of bounds collision
  if (targetCol < 0 || targetCol >= colCount) return true; //Out of bounds collision
  // let targetObject = allObjects.get(`${targetRow},${targetCol}`);
  let targetFloor = floor.getTileAt(targetCol, targetRow);
  let targetWall = walls.getTileAt(targetCol, targetRow);
  let targetCrate = allCrates.get(`${targetRow},${targetCol}`);

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
      targetWall = tilemap.walls.getTileAt(newTarget.col, newTarget.row);
      targetCrate = allCrates.get(`${newTarget.row},${newTarget.col}`);
    }
  }

  if (targetCrate) {
    console.log(targetCrate);
  }

  //Now we know which targets to work with.
  // const currentTileObject = player.scene.allObjects.get(
  //   `${player.row},${player.col}`
  // );

  // if (currentTileObject && currentTileObject instanceof Remover) {
  //   if (directionToCardinal(direction) === currentTileObject.placement)
  //     player.removePortals = true;
  // }

  if (targetWall) {
    console.log(targetWall);
    if (isColliding(tilemap.walls, direction, targetRow, targetCol))
      return true;
  }
  if (targetFloor) {
    if (isColliding(tilemap.floor, direction, targetRow, targetCol)) {
      return true;
    }
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
        // player.moveDuration = 35;
        // return false;
      }
    }
  }

  let usePullDirection = false;
  let heldCrate: Crate | undefined = undefined;
  if (player.state === "Holding") {
    for (const [side, crate] of Object.entries(player.holding)) {
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

  // if (targetCrate instanceof Remover) {
  //   if (side === targetObject.placement) player.removePortals = true;
  // }

  //TODO ABLE TO MOVE HELD OBJECT THROUGH PORTAL

  if (targetCrate && targetCrate.active) {
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
      Math.sqrt(allIncluded.size + portalSet.size) * player.moveDuration * 1.1,
      player.moveDuration * 1.25
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
