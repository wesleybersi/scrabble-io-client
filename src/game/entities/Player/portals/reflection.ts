import { Player } from "../player";
import { Clone } from "../clone";
import Portal from "../../portal";
import { Direction } from "../../../types";
import MainScene from "../../../scenes/MainScene";

export function setPortalReflection(
  player: Player,
  direction: Direction,
  targetRow: number,
  targetCol: number,
  portals: { a: Portal | null; b: Portal | null }
) {
  for (const [type, portal] of Object.entries(portals)) {
    if (!portal) return;
    const otherPortal = type === "a" ? portals.b : portals.a;
    if (!otherPortal) return;
    if (portal.surface === "Floor") {
      if (targetRow === portal.row && targetCol === portal.col) {
        // player.portalClone = {
        //   clone: null,
        //   from: { row: otherPortal.row, col: otherPortal.col },
        //   to: { row: otherPortal.targetRow, col: otherPortal.targetCol },
        // };
        player.portalReflection = {
          clone: null,
          from: { row: portal.row, col: portal.col },
          to: { row: portal.row, col: portal.col },
          movementType: "In",
          portal: otherPortal,
          inFront: true,
        };
      }
    } else if (portal.surface === "Wall" && otherPortal.surface === "Floor") {
      const from = { row: otherPortal?.row, col: otherPortal.col };
      const to = { row: otherPortal.row, col: otherPortal.col };
      let movementType: "In" | "Out" = "In";
      let inFront = player.portalReflection?.inFront ? true : false;

      if (portal.placement === "top" || portal.placement === "bottom") {
        if (portal.targetRow === targetRow && portal.targetCol === targetCol) {
          if (direction === "right") {
            from.col++;
          } else if (direction === "left") {
            from.col--;
          }
          inFront = false;
          if (direction === "up" || direction === "down") inFront = true;
          movementType = "In";
        } else if (
          portal.targetRow === player.row &&
          portal.targetCol === player.col
        ) {
          if (direction === "right") {
            to.col--;
          } else if (direction === "left") {
            to.col++;
          }
          inFront = false;
          movementType = "Out";
          if (direction === "up" || direction === "down") inFront = true;
        }
      } else if (portal.placement === "left" || portal.placement === "right") {
        if (portal.targetRow === targetRow && portal.targetCol === targetCol) {
          if (direction === "up") {
            from.col--;
          } else if (direction === "down") {
            from.col++;
          }
          inFront = false;
          if (direction === "left" || direction === "right") inFront = true;
          movementType = "In";
        } else if (
          portal.targetRow === player.row &&
          portal.targetCol === player.col
        ) {
          if (direction === "up") {
            to.col++;
          } else if (direction === "down") {
            to.col--;
          }
          inFront = false;
          if (direction === "left" || direction === "right") inFront = true;
          movementType = "Out";
        }
      } else return;

      if (from.row !== to.row || from.col !== to.col || inFront) {
        let clone: Clone | null = null;
        if (player.portalReflection && player.portalReflection.clone) {
          if (movementType === "Out") {
            clone = player.portalReflection.clone;
          }
        }

        player.portalReflection = {
          clone,
          from,
          to,
          movementType,
          portal: otherPortal,
          inFront,
        };
      } else {
        if (player.portalReflection && player.portalReflection.clone) {
          player.portalReflection.clone.destroy();
          player.portalReflection = null;
        }
      }
    }
  }
}

export function inFrontOfPortal(player: Player) {
  if (!player.portalReflection) return;

  const { cellSize } = player.scene;
  const { from, to, portal, inFront, movementType } = player.portalReflection;

  //Eventually turn new Player into new Clone. Right now fuck it.
  // const mask = this.scene.add.graphics();
  if (!player.portalReflection.clone) {
    player.portalReflection.clone = new Clone(
      player.scene as MainScene,
      {
        row: from.row * cellSize + cellSize / 2,
        col: from.col * cellSize + cellSize / 2,
      },
      {
        row: to.row * cellSize + cellSize / 2,
        col: to.col * cellSize + cellSize / 2,
      }
    );
  }
  const clone = player.portalReflection.clone;
  if (inFront) {
    clone.alpha = movementType === "In" ? 0 : 1;
  }

  if (portal) {
    clone.setMask(
      new Phaser.Display.Masks.GeometryMask(player.scene, portal.graphic)
    );
  }

  if (inFront) {
    player.scene.tweens.add({
      targets: clone,
      alpha: movementType === "In" ? 1 : 0,
      ease: "Sine",
      duration: player.moveDuration * 2,
      onComplete: () => {
        if (player.portalReflection?.movementType === "Out") {
          clone?.destroy();
          player.portalReflection = null;
        }
      },
    });
  } else {
    player.scene.tweens.add({
      targets: clone,
      x: to.col * cellSize + cellSize / 2,
      y: to.row * cellSize + cellSize / 2,
      ease: player.ease,
      duration: player.moveDuration,
      onComplete: () => {
        if (player.portalReflection?.movementType === "Out") {
          clone?.destroy();
          player.portalReflection = null;
        }
      },
    });
  }
}
