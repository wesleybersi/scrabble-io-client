import Crate from "../crate";

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

  const { portals, allCrates, cellSize } = crate.scene;
  crate.target = { row: crate.row, col: crate.col, x: crate.x, y: crate.y };

  if (direction === "up") {
    crate.target.y -= cellSize;
    crate.target.row--;
  } else if (direction === "down") {
    crate.target.y += cellSize;
    crate.target.row++;
  } else if (direction === "left") {
    crate.target.x -= cellSize;
    crate.target.col--;
  } else if (direction === "right") {
    crate.target.x += cellSize;
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
      if (allCrates.get(oldPos) === crate) {
        allCrates.delete(oldPos);
      }

      let newPos = "";
      if (crate.portalTrigger) {
        newPos = `${crate.portalTrigger.to.row},${crate.portalTrigger.to.col}`;
      } else if (crate.target) {
        newPos = `${crate.target.row},${crate.target.col}`;
      }
      allCrates.set(newPos, crate);
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
  const { cellSize, allCrates } = crate.scene;
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

  crate.setDepth(5);

  const tile = floor.getTileAt(crate.col, crate.row);
  if (tile) {
    if (tile.properties.name === "Void") {
      allCrates.delete(`${crate.row},${crate.col}`);
      crate.setDepth(0);
      const tween = crate.scene.tweens.add({
        targets: [crate],
        scale: 0,
        duration: 1500,
        ease: "Quad.Out",
        onUpdate: () => {
          if (tween.progress > 0.5) {
            crate.setDepth(0);
          }
        },
        onComplete: () => {
          crate.remove();
          return;
        },
      });
    }
  }
}
