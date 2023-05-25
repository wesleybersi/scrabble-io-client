import { EditorScene } from "../EditorScene";
import { Item } from "../categories";
import Wall from "../../../entities/wall";
import Drain from "../../../entities/drain";

export function placeItem(
  scene: EditorScene,
  item: Item,
  by: "click" | "move"
) {
  console.log("Placing", item.name, "by", by);

  const { main } = scene;
  const { allWalls, hover } = main;

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
    case "Stairs":
      break;
    case "Drain":
      if (by !== "click") return;
      new Drain(main, hover.row, hover.col);
      break;
  }
}
