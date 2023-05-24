import MainScene from "../scenes/MainScene";

export default class Cursor extends Phaser.GameObjects.Sprite {
  scene: MainScene;
  dot: Phaser.GameObjects.Graphics;
  row: number;
  col: number;
  scalingTween!: Phaser.Tweens.Tween;
  rotationTween!: Phaser.Tweens.Tween;

  constructor(
    scene: MainScene,
    x: number,
    y: number,
    row: number,
    col: number
  ) {
    super(scene as MainScene, x, y, "cursor");
    this.scene = scene;
    this.row = row;
    this.col = col;
    this.setOrigin(0.5, 0.5);
    this.setDepth(200);
    this.scale = 1;
    this.alpha = 1;
    this.dot = scene.add.graphics();
    this.scalingTween = this.scene.tweens.add({
      targets: [this],
      scale: 1.25,
      alpha: 0.35,
      duration: 500,
      ease: "Sine",
      yoyo: true,
      repeat: -1,
    });

    this.rotationTween = this.scene.tweens.add({
      targets: [this],
      angle: 360,
      ease: "Sine.InOut",
      duration: 1000,
      onComplete: () => {
        if (this.scene.buttons.rotate) {
          this.rotationTween = this.scene.tweens.add({
            targets: [this],
            angle: 360,
            ease: "Sine.InOut",
            duration: 1000,
          });
        }
      },
    });
    this.rotationTween.pause();

    this.scene.add.existing(this);
  }
  update(): void {
    const { hover, cellWidth, cellHeight, buttons } = this.scene;

    if (hover.object) {
      this.x = hover.object.x;
      this.y = hover.object.y - 8;
    } else {
      this.x = hover.col * cellWidth + cellWidth / 2;
      this.y = hover.row * cellHeight + cellHeight / 2 + 2;
    }
    if (buttons.meta) {
      this.setTint(0xff0000);
    } else if (buttons.fill) {
      this.setTint(0x0044ff);
    } else {
      this.clearTint();
    }
    if (buttons.rotate) {
      if (!this.rotationTween.isPlaying()) {
        this.rotationTween = this.scene.tweens.add({
          targets: [this],
          angle: 360,
          ease: "Linear",
          duration: 2500,
          onComplete: () => {
            if (this.scene.buttons.rotate) {
              this.rotationTween = this.scene.tweens.add({
                targets: [this],
                angle: 360,
                ease: "Linear",
                duration: 2500,
              });
            }
          },
        });
      }
    } else {
      this.rotationTween.restart();
      this.rotationTween.pause();
    }
  }
}
