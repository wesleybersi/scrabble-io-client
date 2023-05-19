// import { Player } from "../player";

// import Portal from "../../portal";
// import { inFrontOfPortal } from "./reflection";
// import { getOppositeSide } from "../../../utils/opposite";
// import { cardinalToAdjacent } from "../../../utils/opposite";

// export default function placePortal(player: Player, type: "a" | "b") {
//   if (player.state === "Dead" || player.state === "Pushing") return;

//   const { buttons, portals, allWalls, allObjects, hover } = player.scene;
//   const { inSight } = player.crosshair;
//   if (!inSight) return;

//   const surface: "Floor" | "Wall" = buttons.meta ? "Floor" : "Wall";

//   const portal = portals[type];
//   const otherPortal = portals[type === "a" ? "b" : "a"];

//   if (surface === "Wall") {
//     if (!inSight) {
//       return;
//     }

//     const wall = allWalls[inSight.row][inSight.col];

//     if (wall && wall.type === "Light") {
//       if (
//         otherPortal &&
//         otherPortal.row === inSight.row &&
//         otherPortal.col === inSight.col &&
//         otherPortal.placement === inSight.cardinal
//       ) {
//         player.portalReflection?.clone?.destroy();
//         player.portalReflection = null;

//         portals[type === "a" ? "b" : "a"]?.remove();
//         portals[type === "a" ? "b" : "a"] = null;
//       }

//       const { row: adjacentRow, col: adjacentCol } = cardinalToAdjacent(
//         inSight.cardinal,
//         inSight.row,
//         inSight.col
//       );
//       const adjacentWall = allWalls[adjacentRow][adjacentCol];
//       if (adjacentWall) {
//         return;
//       }

//       if (type === "a") player.scene.sound.play("portal-a");
//       else if (type === "b") player.scene.sound.play("portal-b");

//       if (portal) {
//         const targetPos = `${portal.targetRow},${portal.targetCol}`;
//         const objectInPlace = allObjects.get(targetPos);
//         if (portal && objectInPlace && objectInPlace instanceof Block) {
//           objectInPlace.isConnected[getOppositeSide(portal.placement)] = false;
//         }
//       }

//       player.portalReflection?.clone?.destroy();
//       player.portalReflection = null;

//       portals[type]?.remove();
//       portals[type] = new Portal(
//         player.scene,
//         type,
//         "Wall",
//         inSight.row,
//         inSight.col,
//         inSight.cardinal,
//         player
//       );

//       player.crosshair.update();

//       if (
//         portals[type]?.targetRow === player.row &&
//         portals[type]?.targetCol === player.col
//       ) {
//         if (otherPortal && otherPortal.surface === "Floor") {
//           player.portalReflection = {
//             clone: null,
//             from: { row: otherPortal.row, col: otherPortal.col },
//             to: { row: otherPortal.row, col: otherPortal.col },
//             movementType: "In",
//             portal: otherPortal,
//             inFront: true,
//           };
//           inFrontOfPortal(player);
//         }
//       }
//     }
//   } else if (surface === "Floor") {
//     const wall = allWalls[hover.row][hover.col];
//     const target = allObjects.get(`${hover.row},${hover.col}`);

//     if (target || wall) return;

//     if (type === "a") player.scene.sound.play("portal-a");
//     else if (type === "b") player.scene.sound.play("portal-b");

//     player.portalReflection?.clone?.destroy();
//     player.portalReflection = null;
//     portals[type]?.remove();
//     portals[type] = new Portal(
//       player.scene,
//       type,
//       "Floor",
//       hover.row,
//       hover.col,
//       "bottom",
//       player
//     );
//     player.crosshair.update();

//     if (portal) {
//       const targetPos = `${portal.targetRow},${portal.targetCol}`;
//       const objectInPlace = allObjects.get(targetPos);
//       if (portal && objectInPlace && objectInPlace instanceof Block) {
//         objectInPlace.isConnected[getOppositeSide(portal.placement)] = false;
//       }
//     }

//     if (
//       otherPortal?.surface === "Wall" &&
//       otherPortal?.targetRow === player.row &&
//       otherPortal?.targetCol === player.col
//     ) {
//       const portal = portals[type];
//       if (!portal) return;
//       player.portalReflection = {
//         clone: null,
//         from: { row: portal.row, col: portal.col },
//         to: { row: portal.row, col: portal.col },
//         movementType: "In",
//         portal,
//         inFront: true,
//       };
//       inFrontOfPortal(player);
//     }
//   }

//   if (portals.a && portals.b) {
//     portals.a.graphic.alpha = 0.65;
//     portals.b.graphic.alpha = 0.65;
//   } else {
//     if (portals.a) {
//       portals.a.graphic.alpha = 0.35;
//     } else if (portals.b) {
//       portals.b.graphic.alpha = 0.35;
//     }
//   }
// }
