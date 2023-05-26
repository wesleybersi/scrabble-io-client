import { Player } from "../player";
import { getOppositeSide } from "../../../utils/helper-functions";

export default function resetPortals(player: Player) {
  const { portals, allCrates } = player.scene;
  for (const [type, portal] of Object.entries(portals)) {
    if (!portal) continue;
    const targetPos = `${portal.targetRow},${portal.targetCol}`;
    const crateInPlace = allCrates.get(targetPos);
    if (crateInPlace) {
      crateInPlace.connectedTo[getOppositeSide(portal.placement)] = undefined;
    }
    portal.remove();
    player.portalReflection?.clone?.destroy();
    player.portalReflection = null;
  }

  portals.a = null;
  portals.b = null;
  player.scene.sound.play("remover");
  portalRemoved(player);
}

export function portalRemoved(player: Player) {
  if (player.portalReflection) {
    if (player.portalReflection.clone) {
      player.portalReflection.clone.destroy();
    }
    player.portalReflection = null;
  }
  if (player.portalClone) {
    player.portalClone.destroy();
    player.portalClone = null;
  }
}
