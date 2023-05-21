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

  const { portals, allCrates, cellWidth, cellHeight, resetAll } = crate.scene;
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
  const { allCrates } = crate.scene;
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

  crate.setDepth(0);

  const tile = floor.getTileAt(crate.col, crate.row);
  if (tile) {
    switch (tile.properties.name) {
      case "Void":
        {
          allCrates.delete(`${crate.row},${crate.col}`);
          crate.setDepth(0);
          crate.isFalling = true;
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
              crate.setActive(false);
              crate.update();
              crate.scale = 1;
              crate.isFalling = false;
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
          allCrates.delete(`${crate.row},${crate.col}`);
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
