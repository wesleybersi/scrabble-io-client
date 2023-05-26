import { HoverTarget } from "../../../types";
import { EditorScene } from "../EditorScene";
import Wall from "../../../entities/Wall/wall";

export function copyItem(scene: EditorScene, object: HoverTarget) {
  console.log("Copying", object.name);
}
