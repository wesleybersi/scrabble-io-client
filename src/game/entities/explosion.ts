import MainScene from "../scenes/MainScene";
import { isWithinGrace } from "../utils/opposite";

export default class Explosion extends Phaser.GameObjects.Sprite {
  scene: MainScene;
  row: number;
  col: number;
  constructor(
    scene: MainScene,
    x: number,
    y: number,
    row: number,
    col: number
  ) {
    super(scene as MainScene, x, y, "explosion");
    this.scene = scene;
    this.row = row;
    this.col = col;
    this.setOrigin(0.5, 0.5);
    this.setDepth(200);

    this.anims.create({
      key: "Explode",
      frames: this.anims.generateFrameNumbers("explosion", {
        start: 0,
        end: 5,
      }),
      frameRate: 12,
      repeat: 0,
      hideOnComplete: true,
    });

    this.on(
      Phaser.Animations.Events.ANIMATION_COMPLETE,
      () => {
        this.destroy();
      },
      this
    );

    this.scene.add.existing(this);
    this.destruct();
  }
  destruct() {
    const { cellSize, player, allCrates, tilemap } = this.scene;
    const { walls, floor } = tilemap;

    if (
      isWithinGrace(player.x, this.x, cellSize) &&
      isWithinGrace(player.y, this.y, cellSize)
    ) {
      player.state = "Dead";
    }

    const pos = `${this.row},${this.col}`;
    const crate = allCrates.get(pos);
    // if (crate && crate.hp < Infinity) crate.remove();
    if (crate && crate.active && crate.hp < Infinity) crate.setActive(false);

    const wall = walls.getTileAt(this.col, this.row);

    if (wall) {
      if (wall.properties.cracks) {
        wall.alpha = 0;
        wall.properties.cracks.destroy();
        tilemap.placeEmptyFloorTile(this.col, this.row);

        //Remember destruction and recreate on editor
      } else {
        this.destroy();

        //If editor, place wall with cracks at
        return;
      }
    }

    this.anims.play("Explode");
  }
}
