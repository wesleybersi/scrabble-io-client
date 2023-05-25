import { HoverTarget } from "../../../types";
import { EditorScene } from "../EditorScene";

export function copyItem(scene: EditorScene, object: HoverTarget) {
  console.log("Copying", object.name);
}
