import { EditorScene } from "../EditorScene";
import Wall from "../../../entities/Wall/wall";
import { getAdjacentTiles } from "../../../utils/opposite";

export function removeItem(scene: EditorScene, by: "click" | "move") {
  const { hover } = scene.main;

  if (!hover.object) return;
  const wasWall = hover.object instanceof Wall;
  const position = { row: hover.object?.row, col: hover.object.col };

  hover.object.remove();

  if (wasWall) {
    const adjacent = getAdjacentTiles(position.row, position.col);
    for (const [side, position] of Object.entries(adjacent)) {
      scene.main.events.emit("Connect Walls", position.row, position.col);
    }
  }
}
