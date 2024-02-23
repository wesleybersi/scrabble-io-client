import MainScene from "../../scenes/Main/MainScene";
import { Arrows } from "../Arrows/Arrows";

export default class Pointer extends Phaser.GameObjects.Container {
  scene: MainScene;
  id: string;
  color: number;
  circle: Phaser.GameObjects.Arc;
  pointer: Phaser.GameObjects.Image;
  pointerShadow: Phaser.GameObjects.Image;

  line?: Phaser.GameObjects.Line;
  drops?: Phaser.GameObjects.Particles.ParticleEmitter;
  arrows?: Arrows;

  constructor(
    scene: MainScene,
    id: string,
    x: number,
    y: number,
    color: number
  ) {
    super(scene as MainScene, x, y);
    this.id = id;
    this.color = color;
    this.scene = scene;
    this.setDepth(Infinity);

    this.pointer = this.scene.add
      .image(0, 0, "pointer-open")
      .setScale(2.25)
      .setTint(color);

    this.pointerShadow = this.scene.add
      .image(16, 16, "pointer-open")
      .setScale(2.25)
      .setTint(0x222222)
      .setAlpha(0.1);

    this.circle = this.scene.add.arc(0, 0, 24).setStrokeStyle(8, color);
    this.add([this.pointerShadow, this.pointer]);

    this.scene.add.existing(this);
    this.scene.pointersByID.set(id, this);
  }
  update(
    x: number,
    y: number,
    holding?: { x: number; y: number },
    hovering?: boolean,
    scrolling?: boolean
  ) {
    this.setPosition(x, y);

    // if (scrolling) {
    //   this.pointer.setTexture("pointer-grab");
    //   this.pointerShadow.setTexture("pointer-grab");
    //   return;
    // }

    if (hovering && !holding) {
      this.pointerShadow.setTexture("pointer-open");
      this.pointer.setTexture("pointer-open");
      this.revertAngle();
      return;
    }

    if (holding) {
      // this.x = holding.x;
      // this.y = holding.y;
      this.angle = getAngleInDegrees(this.x, this.y, holding.x, holding.y) + 90;

      this.pointer.setTexture("pointer-grab");
      this.pointerShadow.setTexture("pointer-grab");
    } else {
      this.revertAngle();
      this.line?.destroy();
      this.pointerShadow.setTexture("pointer-open");
      this.pointer.setTexture("pointer-open");
    }
  }

  delete() {
    this.scene.pointersByID.delete(this.id);
    this.destroy();
  }
  revertAngle() {
    this.scene.tweens.add({ targets: this, angle: 0, duration: 128 });
  }
}

function getAngleInDegrees(
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number {
  // Calculate the angle in radians using Math.atan2
  const angleInRadians: number = Math.atan2(y2 - y1, x2 - x1);

  // Convert radians to degrees
  const angleInDegrees: number = (angleInRadians * 180) / Math.PI;

  // Ensure the angle is positive (between 0 and 360 degrees)
  const positiveAngle: number = (angleInDegrees + 360) % 360;

  return positiveAngle;
}
