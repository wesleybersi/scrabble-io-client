import { EditorScene } from "../EditorScene";
import { Item } from "../categories";
import Wall from "../../../entities/Wall/wall";
import Drain from "../../../entities/drain";
import Crate from "../../../entities/Crate/crate";
import Flow from "../../../entities/WaterFlow/Flow";
import Ramp from "../../../entities/ramp";

export function placeItem(
  scene: EditorScene,
  item: Item,
  by: "click" | "move",
  size?: number
) {
  console.log("Placing", item.name, "by", by);

  const { main } = scene;
  const { allWalls, hover, player } = main;

  const objPos = `${hover.object?.row},${hover.object?.col}`;
  const pos = `${hover.row},${hover.col}`;
  const wall = allWalls.get(pos);

  switch (item.name) {
    case "Half Wall":
      if (!wall) new Wall(main, "half-wall", hover.row, hover.col);
      break;
    case "Wall":
      if (!wall) new Wall(main, "wall", hover.row, hover.col);
      break;
    case "Big Wall":
      if (!wall) new Wall(main, "big-wall", hover.row, hover.col);
      break;
    case "Ramp":
      {
        if (by !== "click") return;
        const { allRamps } = main;

        let placeRow = hover.row;
        let placeCol = hover.col;
        let floorPlacement = 0;
        if (hover.object instanceof Ramp) return;
        if (hover.object instanceof Wall) {
          floorPlacement = Math.max(...hover.object.collidesOn) + 1;
          placeRow = hover.object.row;
          placeCol = hover.object.col;
        }

        let low = { row: placeRow, col: placeCol };
        let high = { row: placeRow, col: placeCol };
        switch (scene.rotation) {
          case "right":
            low = { row: placeRow, col: placeCol };
            high = { row: placeRow, col: placeCol + 1 };
            break;
          case "left":
            low = { row: placeRow, col: placeCol + 1 };
            high = { row: placeRow, col: placeCol };
            break;
          case "up":
            low = { row: placeRow, col: placeCol };
            high = { row: placeRow - 1, col: placeCol };
            break;
          case "down":
            low = { row: placeRow, col: placeCol };
            high = { row: placeRow + 1, col: placeCol };
            break;
        }

        if (allRamps[floorPlacement].has(`${placeRow},${placeCol}`)) return;
        if (allRamps[floorPlacement].has(`${low.row},${low.col}`)) return;
        if (allRamps[floorPlacement].has(`${high.row},${high.col}`)) return;

        new Ramp(main, scene.rotation, placeRow, placeCol, floorPlacement);
      }
      break;
    case "Stairs":
      break;
  }

  switch (item.name) {
    case "Water":
      {
        const { allWaterFlows, floorHeight } = main;
        for (const [pos, flow] of allWaterFlows[0]) {
          if (flow) {
            //If already water. Remove.
            if (flow.waterMap.has(`${hover.row},${hover.col}`)) {
              if (flow.level < floorHeight) flow.level++;
              return;
            }
          }
        }

        if (by !== "click") return;
        const initialWaterLevel = 8;
        new Flow(main, hover.row, hover.col, 0, initialWaterLevel);
      }
      break;
    case "Drain":
      if (by !== "click") return;
      new Drain(main, hover.row, hover.col, hover.floor);
      break;
  }

  switch (item.name) {
    case "Wooden Crate":
    case "Metal Crate":
      {
        const { allCrates } = main;
        let floorPlacement = 0;
        let placeRow = hover.row;
        let placeCol = hover.col;
        let crateType: "Wood" | "Metal" = "Wood";
        const frame = { texture: "crates", row: 0, col: 0 };
        if (item.name === "Metal Crate") {
          crateType = "Metal";
          frame.row++;
        }
        if (hover.object) {
          if (
            hover.object instanceof Crate &&
            hover.object.floor <= main.maxFloor &&
            !hover.object.adjacentCrates.above
          ) {
            floorPlacement += hover.object.floor + 1;
            placeRow = hover.object.row;
            placeCol = hover.object.col;
          } else if (hover.object instanceof Wall) {
            floorPlacement = Math.max(...hover.object.collidesOn) + 1;
            placeRow = hover.object.row;
            placeCol = hover.object.col;
          } else return;
        }

        if (allCrates[floorPlacement].has(`${placeRow},${placeCol}`)) return;
        if (player.row === placeRow && player.col === placeCol) return;
        if (hover.object && by !== "click") return;
        new Crate(main, crateType, frame, placeRow, placeCol, floorPlacement);
      }
      break;
    case "Pillar":
    case "Pillar Horizontal":
    case "Pillar Vertical":
    case "Pillar Diagonal": {
      const { allCrates } = main;
      let placeFloor = 0;
      let placeRow = hover.row;
      let placeCol = hover.col;
      if (hover.object) {
        if (
          hover.object instanceof Crate &&
          hover.object.floor <= main.maxFloor &&
          !hover.object.adjacentCrates.above
        ) {
          placeFloor += hover.object.floor + 1;
          placeRow = hover.object.row;
          placeCol = hover.object.col;
        } else if (hover.object instanceof Wall) {
          placeFloor = Math.max(...hover.object.collidesOn) + 1;
          placeRow = hover.object.row;
          placeCol = hover.object.col;
        } else return;
      }

      if (allCrates[placeFloor].has(`${placeRow},${placeCol}`)) return;
      if (player.row === placeRow && player.col === placeCol) return;
      if (hover.object && by !== "click") return;

      const createPillar = (size: number) => {
        const piece = {
          frame: { texture: "pillars", row: 0, col: 0 },
          row: 0,
          col: 0,
          floor: 0,
        };
        const pillar = Array(size)
          .fill(undefined)
          .map(() => ({ ...piece }));

        const createdPieces: Crate[] = [];
        pillar.forEach((piece, index) => {
          console.count("ping?");
          if (index === 0) {
            piece.frame.row = 2;
            piece.frame.col = 0;
          } else if (index === 1) {
            piece.frame.row = 1;
            piece.frame.col = 1;
          } else if (index === size - 1) {
            piece.frame.row = 0;
            if (item.name === "Pillar Horizontal") piece.frame.col = 1;
            else if (item.name === "Pillar Vertical") piece.frame.col = 2;
            else if (item.name === "Pillar Diagonal") piece.frame.col = 3;
            else if (item.name === "Pillar") piece.frame.col = 0;
          } else {
            piece.frame.row = 1;
            piece.frame.col = 0;
          }
          let crateType:
            | "Pillar"
            | "Pillar Horizontal"
            | "Pillar Vertical"
            | "Pillar Diagonal" = "Pillar";
          if (item.name === "Pillar Horizotnal")
            crateType = "Pillar Horizontal";
          if (item.name === "Pillar Horizotnal") crateType = "Pillar Vertical";
          if (item.name === "Pillar Diaongal") crateType = "Pillar Diagonal";

          piece.row = placeRow;
          piece.col = placeCol;
          piece.floor = placeFloor + index;
          createdPieces.push(
            new Crate(
              main,
              crateType,
              piece.frame,
              piece.row,
              piece.col,
              piece.floor
            )
          );
        });
        createdPieces.forEach((piece, index) => {
          if (index === 0) {
            piece.connectShape(["above"]);
          } else if (index > 0 && index < size - 1) {
            piece.connectShape(["above", "below"]);
            piece.hasInteraction = false;
            piece.shadow.destroy();
          } else if (index === size - 1) {
            piece.connectShape(["below"]);
            piece.hasInteraction = false;
            piece.shadow.destroy();
          }
        });
      };
      createPillar(4);
    }
  }
}
