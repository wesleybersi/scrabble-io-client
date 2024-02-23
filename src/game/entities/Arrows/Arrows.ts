import MainScene from "../../scenes/Main/MainScene";
import { CELL_HEIGHT, CELL_WIDTH } from "../../scenes/Main/constants";

export class Arrows extends Phaser.GameObjects.Container {
  arrowUp: Phaser.GameObjects.Polygon;
  arrowDown: Phaser.GameObjects.Polygon;
  arrowLeft: Phaser.GameObjects.Polygon;
  arrowRight: Phaser.GameObjects.Polygon;

  rectUp: Phaser.GameObjects.Rectangle;
  rectDown: Phaser.GameObjects.Rectangle;
  rectLeft: Phaser.GameObjects.Rectangle;
  rectRight: Phaser.GameObjects.Rectangle;
  constructor(scene: MainScene, x: number, y: number) {
    super(scene, x, y);
    const color = 0x222222;

    const data = [0, 20, 84, 20, 84, 0, 120, 50, 84, 100, 84, 80, 0, 80];
    this.arrowUp = this.scene.add.polygon(0, 0, data, color);
    this.arrowUp.y -= CELL_HEIGHT;
    this.arrowUp.setAngle(-90);
    this.arrowUp.setScale(0.35);

    this.arrowDown = this.scene.add.polygon(0, 0, data, color);
    this.arrowDown.y += CELL_HEIGHT;
    this.arrowDown.setAngle(90);
    this.arrowDown.setScale(0.35);

    this.arrowLeft = this.scene.add.polygon(0, 0, data, color);
    this.arrowLeft.x -= CELL_WIDTH;
    this.arrowLeft.setAngle(180);
    this.arrowLeft.setScale(0.35);

    this.arrowRight = this.scene.add.polygon(0, 0, data, color);
    this.arrowRight.x += CELL_WIDTH;
    this.arrowRight.setScale(0.35);

    // this.add([this.arrowUp, this.arrowDown, this.arrowLeft, this.arrowRight]);

    this.rectUp = this.scene.add
      .rectangle(0, -CELL_HEIGHT, CELL_WIDTH, CELL_HEIGHT)
      .setFillStyle(color);

    this.rectDown = this.scene.add
      .rectangle(0, CELL_HEIGHT, CELL_WIDTH, CELL_HEIGHT)
      .setFillStyle(color);

    this.rectLeft = this.scene.add
      .rectangle(-CELL_WIDTH, 0, CELL_WIDTH, CELL_HEIGHT)
      .setFillStyle(color);

    this.rectRight = this.scene.add
      .rectangle(CELL_WIDTH, 0, CELL_WIDTH, CELL_HEIGHT)
      .setFillStyle(color);
    this.add([this.rectUp, this.rectDown, this.rectLeft, this.rectRight]);
    this.setDepth(Infinity);
    // this.setAlpha(0);
    // this.scene.tweens.add({
    //   targets: this,
    //   alpha: 0.05,
    //   duration: 500,
    //   ease: "Sine.Out",
    //   onComplete: () => {
    //     this.setAlpha(0.05);
    //   },
    // });

    this.setAlpha(0.075);

    this.setAlpha(0);
    this.scene.events.on("Clear Arrows", () => {
      this.delete();
    });

    this.scene.add.existing(this);
  }
  update(x: number, y: number) {
    this.setPosition(x, y);
  }
  delete() {
    this.rectUp.destroy();
    this.rectDown.destroy();
    this.rectLeft.destroy();
    this.rectRight.destroy();
    this.destroy();
  }
}
