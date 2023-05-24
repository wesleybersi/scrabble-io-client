import { connected } from "process";
import Crate from "../crate";
import {
  directionToCardinal,
  getOppositeDirection,
} from "../../../utils/opposite";

export default function makeMove(
  crate: Crate,
  direction: "up" | "down" | "left" | "right",
  allIncluded: Set<Crate>,
  duration: number,
  completed: Set<Crate>
) {
  if (crate.isMoving) return;
  crate.isMoving = true;
  crate.direction = direction;

  const { allCrates, cellWidth, cellHeight } = crate.scene;
  crate.target = { row: crate.row, col: crate.col, x: crate.x, y: crate.y };

  if (direction === "up") {
    crate.target.y -= cellHeight;
    crate.target.row--;
  } else if (direction === "down") {
    crate.target.y += cellHeight;
    crate.target.row++;
  } else if (direction === "left") {
    crate.target.x -= cellWidth;
    crate.target.col--;
  } else if (direction === "right") {
    crate.target.x += cellWidth;
    crate.target.col++;
  }

  //   if (crate.portalTrigger) {
  //     crate.enterPortal(duration);
  //   }
  crate.movementTween = crate.scene.tweens.add({
    targets: crate,
    x: crate.target.x,
    y: crate.target.y,
    ease: "Linear",
    duration: duration,
    onStart: () => {
      //
    },
    onComplete: () => {
      //   if (crate.portalTrigger) {
      //     const { to, connectedTo, exiting, entering } = crate.portalTrigger;

      //     crate.x = to.col * cellSize;
      //     crate.y = to.row * cellSize;
      //     crate.row = to.row;
      //     crate.col = to.col;

      //     if (connectedTo.back) {
      //       const enterPortal = portals[entering];
      //       const exitPortal = portals[exiting];
      //       if (enterPortal && exitPortal) {
      //         const enterPlacement = enterPortal.placement;
      //         const placement = exitPortal.placement;
      //         const oldConnection = getOppositeSide(enterPlacement);
      //         const newConnection = getOppositeSide(placement);
      //         crate.connectedTo[oldConnection] = false;
      //         crate.connectedTo[newConnection] = true;
      //       }
      //     }

      // crate.portalTrigger = null;
      //   } else {

      //   }

      const oldPos = `${crate.row},${crate.col}`;
      if (allCrates[crate.floor].get(oldPos) === crate) {
        allCrates[crate.floor].delete(oldPos);
      }

      let newPos = "";
      if (crate.portalTrigger) {
        newPos = `${crate.portalTrigger.to.row},${crate.portalTrigger.to.col}`;
      } else if (crate.target) {
        newPos = `${crate.target.row},${crate.target.col}`;
      }
      allCrates[crate.floor].set(newPos, crate);
      completed.add(crate);
      //Last one to complete takes care of everyone else
      if (completed.size === allIncluded.size) {
        for (const finishedCrate of completed) {
          moveComplete(finishedCrate);
        }
      }
    },
  });
}

export function moveComplete(crate: Crate) {
  const { allCrates, allWalls } = crate.scene;
  const { floor } = crate.scene.tilemap;

  if (crate.target) {
    crate.x = crate.target.x;
    crate.y = crate.target.y;
    crate.row = crate.target.row;
    crate.col = crate.target.col;
    crate.isMoving = false;
    crate.update();
  }
  crate.target = null;
  console.log(allCrates);

  const ease = crate.floor > 1 ? "Linear" : "Quad";
  function fallingCrate() {
    if (crate.floor > 0) {
      const oppositeSide = directionToCardinal(
        getOppositeDirection(crate.direction)
      );

      //TODO If not all of shape, none of shape
      if (crate.connectedTo[oppositeSide]) return;

      const wall = allWalls.get(`${crate.row},${crate.col}`);
      const otherCrate = allCrates[crate.floor - 1].get(
        `${crate.row},${crate.col}`
      );

      if (
        (!wall || (wall && Math.max(...wall.collidesOn) + 1 < crate.floor)) &&
        !otherCrate
      ) {
        const { cellHeight } = crate.scene;
        allCrates[crate.floor].delete(`${crate.row},${crate.col}`);
        crate.isFalling = true;

        const tween = crate.scene.tweens.add({
          targets: [crate],
          y: crate.y + cellHeight - 8,
          duration: 250 / crate.weight,
          ease,
          onStart: () => {
            crate.shadow.y += crate.scene.floorHeight;
          },
          onComplete: () => {
            crate.floor--;
            allCrates[crate.floor].set(`${crate.row},${crate.col}`, crate);
            crate.update();

            fallingCrate();
            crate.isFalling = false;
            return;
          },
        });
      }
    }
    return;
  }
  fallingCrate();
  const tile = floor.getTileAt(crate.col, crate.row);
  if (tile) {
    switch (tile.properties.name) {
      case "Void":
        {
          const { cellWidth, cellHeight } = crate.scene;
          allCrates[crate.floor].delete(`${crate.row},${crate.col}`);
          crate.setDepth(0);
          crate.isFalling = true;

          const mask = crate.scene.add.graphics();
          // mask.alpha = 0;
          mask.fillRect(
            crate.col * cellWidth,
            crate.row * cellHeight - 16,
            cellWidth,
            cellHeight + 16
          );
          mask.alpha = 0;
          crate.setMask(
            new Phaser.Display.Masks.GeometryMask(crate.scene, mask)
          );

          const tween = crate.scene.tweens.add({
            targets: [crate],
            y: crate.y + cellHeight - 8,
            duration: 1500,
            ease: "Quad",

            onUpdate: () => {
              if (tween.progress > 0.5) {
                crate.setDepth(0);
              }
            },
            onComplete: () => {
              // crate.setActive(false);
              // crate.update();
              // crate.scale = 1;
              // crate.isFalling = false;
              // mask.destroy();
              // crate.clearMask();
              return;
            },
          });
        }
        break;
      case "Ice":
        {
          //TODO multiple crates are preparing movement. Some overlapping. Creaing wonky results
          const { player } = crate.scene;
          const { allIncluded, abort } = crate.prepareMovement(crate.direction);

          console.log(allIncluded);
          if (crate.crateType === "Wood") console.count("Ice");
          if (abort) return;

          let weightMultiplier = 1;
          for (const c of allIncluded) {
            if (c.weight > weightMultiplier) weightMultiplier = c.weight;
          }

          const completedTweens = new Set<Crate>();
          const duration = Math.max(
            ((Math.sqrt(allIncluded.size) * player.initialMoveDuration) / 1.5) *
              0.5,
            player.initialMoveDuration / 1.5
          );
          for (const includedCrate of allIncluded) {
            includedCrate.makeMove(
              crate.direction,
              allIncluded,
              duration * weightMultiplier,
              completedTweens
            );
          }
        }
        break;
      case "Lava":
        if (crate.crateType === "Explosive") {
          crate.explode();
        } else if (crate.crateType === "Wood") {
          allCrates[crate.floor].delete(`${crate.row},${crate.col}`);
          crate.setDepth(0);
          crate.isFalling = true;
          const tween = crate.scene.tweens.add({
            targets: [crate],
            scale: 0,
            alpha: 0,
            duration: 6000,
            ease: "Quad",
            onUpdate: () => {
              if (tween.progress > 0.1) {
                crate.setActive(false);
                crate.update();
                crate.scale = 1;
                crate.isFalling = false;
              }
            },
          });
        }
        break;
    }
  }
}
