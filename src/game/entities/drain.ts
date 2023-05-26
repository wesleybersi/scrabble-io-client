import MainScene from "../scenes/Main/MainScene";
import Flow from "./WaterFlow/Flow";
import Water from "./Water/water";

export default class Drain extends Phaser.GameObjects.Sprite {
  scene: MainScene;
  row: number;
  col: number;
  floor: number;
  draining: Set<Water> = new Set();
  constructor(scene: MainScene, row: number, col: number, floor: number) {
    super(
      scene as MainScene,
      col * scene.cellWidth + scene.cellWidth / 2,
      row * scene.cellHeight + scene.cellHeight / 2,
      "drain"
    );
    this.name = "Drain";
    this.scene = scene;
    this.row = row;
    this.col = col;
    this.floor = floor;
    this.setOrigin(0.5, 0.5);
    this.setDepth(this.row - 1);
    this.setInteractive();

    this.scene.add.existing(this);

    this.on("pointerover", () => {
      console.log("Hal");
      this.scene.events.emit("Pointing at", this);
    });
    this.on("pointerout", () => {
      this.scene.events.emit("Remove from pointer", this);
    });

    this.scene.events.on("Water Flowing", (waterMap: Map<string, Water>) => {
      if (!this.active) return;
      const drainPos = `${row},${col}`;
      const water = waterMap.get(drainPos);
      if (water) {
        water.isBeingDrained = true;
        this.draining.add(water);
      }
    });
  }
  remove() {
    if (!this.scene) return;
    this.setActive(false);
    this.scene.events.emit("Remove from pointer", this);

    console.log(this.draining);
    for (const water of this.draining) {
      water.isBeingDrained = false;
      console.log(water);
    }

    this.destroy();
  }
}
