import Portal from "../../portal";
import { Player } from "../player";
import { Cardinal, Direction } from "../../../types";
import { cardinalToDirection } from "../../../utils/opposite";
import MainScene from "../../../scenes/MainScene";
import { Clone } from "../clone";

export default function redirectTargetToPortal(
  player: Player,
  targetRow: number,
  targetCol: number,
  side: Cardinal,
  portals: { a: Portal | null; b: Portal | null }
): {
  newTarget: { row: number; col: number };
  newSide: Cardinal;
  newDirection: Direction;
  invalid: boolean;
} {
  for (const [type, portal] of Object.entries(portals)) {
    if (!portal) break;

    //If target is portal
    if (portal.row === targetRow && portal.col === targetCol) {
      const exitPortal = type === "a" ? portals.b : portals.a;
      if (!exitPortal) break;

      player.portalClone = new Clone(
        player.scene as MainScene,
        { row: exitPortal.row, col: exitPortal.col }, //From
        { row: exitPortal.targetRow, col: exitPortal.targetCol } //To
      );

      if (portal.surface === "Wall") {
        if (portal.placement === side) {
          return {
            newTarget: { row: exitPortal.targetRow, col: exitPortal.targetCol },
            newSide: exitPortal.placement,
            newDirection: cardinalToDirection(exitPortal.placement),
            invalid: false,
          };
        }
      }
    }
  }
  return {
    newTarget: { row: targetRow, col: targetCol },
    newSide: side,
    newDirection: "down",
    invalid: true,
  };
}
