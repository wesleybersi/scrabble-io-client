import { EditorScene } from "../EditorScene";
import { Item } from "../categories";

export function removeItem(scene: EditorScene) {
  console.log("Removing");

  const { main } = scene;
  const { allWalls, hover } = main;

  let pos = "";
  if (hover.object) {
    pos = `${hover.object.row},${hover.object.col}`;
  } else {
    pos = `${hover.row},${hover.col}`;
  }

  const wall = allWalls.get(pos);
  if (wall) {
    wall.remove();
    main.events.emit("Walls Updated");
  }
}
