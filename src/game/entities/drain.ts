import MainScene from "../scenes/MainScene";
import Flow from "./WaterFlow/Flow";
import Water from "./Water/water";

export default class Drain extends Phaser.GameObjects.Sprite {
  scene: MainScene;
  row: number;
  col: number;
  draining = false;
  constructor(scene: MainScene, row: number, col: number) {
    super(
      scene as MainScene,
      col * scene.cellWidth + scene.cellWidth / 2,
      row * scene.cellHeight + scene.cellHeight / 2,
      "grate"
    );
    this.scene = scene;
    this.row = row;
    this.col = col;
    this.setOrigin(0.5, 0.5);
    this.setDepth(this.row - 1);

    this.scene.add.existing(this);

    this.scene.events.on("Water Flowing", (waterMap: Map<string, Water>) => {
      const drainPos = `${row},${col}`;
      const water = waterMap.get(drainPos);
      if (water) {
        water.isBeingDrained = true;
      }
    });
  }
}
