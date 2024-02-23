import MainScene from "../../scenes/Main/MainScene";
import { CELL_HEIGHT, CELL_WIDTH } from "../../scenes/Main/constants";
import { oneIn } from "../../utils/helper-functions";
import { Hands } from "./hands";
export class Player extends Phaser.GameObjects.Sprite {
  scene: MainScene;
  id: string;
  name: string;
  shadow!: Phaser.GameObjects.Sprite;
  rotationTween: Phaser.Tweens.Tween | null = null;
  movementTween: Phaser.Tweens.Tween | null = null;
  predictionTween: Phaser.Tweens.Tween | null = null;
  particles?: Phaser.GameObjects.Particles.ParticleEmitter;
  hands: Hands;
  facing: "up" | "down" | "left" | "right" = "up";
  row: number;
  col: number;
  color: number;
  constructor(
    scene: MainScene,
    id: string,
    name: string,
    color: number,
    row: number,
    col: number
  ) {
    super(
      scene as MainScene,
      col * CELL_WIDTH + CELL_WIDTH / 2,
      row * CELL_HEIGHT + CELL_HEIGHT / 2,
      "player",
      0
    );
    this.scene = scene;
    this.name = name;
    this.id = id;
    this.color = color;
    this.row = row;
    this.col = col;
    this.shadow = this.scene.add.sprite(this.x, this.y, "player");
    this.hands = new Hands(scene, this);
    this.setAlpha(0);

    this.setOrigin(0.5);
    this.setTint(this.color);
    this.generateShadow();
    this.setDepth(this.row + 1);

    this.setScale(0);
    this.scene.tweens.add({
      targets: [this, this.shadow],
      scale: 1,
      duration: 250,
      onComplete: () => {
        this.setScale(0.65);
        this.shadow.setScale(0.65);
        this.shadow.setAlpha(0);

        // this.setScale(1);
        // this.shadow.setScale();
        // this.scene.tweens.add({
        //   targets: this,
        //   scale: 1.25,
        //   duration: 750,
        //   yoyo: true,
        //   repeat: Infinity,
        // });
      },
    });

    scene.add.existing(this);
  }
  generateShadow() {
    return;
    this.shadow.x = this.x;
    this.shadow.y = this.y + 12;
    this.shadow.setDepth(this.depth - 1);
    this.shadow.setTint(0x000000);
  }
  move(
    target: { row: number; col: number },
    duration: number,
    isPush: boolean,
    isPull: boolean,
    onMovementComplete?: (row: number, col: number) => void
  ) {
    if (this.movementTween) return;
    // if (this.id === this.scene.socketID && this.scene.isMoving) return;
    const { row, col } = target;
    const x = col * CELL_WIDTH + CELL_WIDTH / 2;
    const y = row * CELL_HEIGHT + CELL_HEIGHT / 2;

    this.movementTween = this.scene.tweens.add({
      targets: [this, this.hands],
      // ease: "linear",
      x,
      y,
      duration,
      onStart: () => {
        if (row < this.row) this.facing = "up";
        if (row > this.row) this.facing = "down";
        if (col < this.col) this.facing = "left";
        if (col > this.col) this.facing = "right";
        if (isPush) console.log("Pushing");
        if (isPull) console.log("Pulling");
        if (!isPush && !isPull) this.hands.movement(duration);
        else this.hands.pushOrPull(duration);
      },
      onUpdate: () => {
        this.setDepth(this.row + 3);
        this.shadow.setDepth(this.row + 1);
        this.generateShadow();
        this.rotate(duration, isPull);

        if ((isPush || isPull) && oneIn(80) && this.movementTween) {
          this.emitDrops();
        }
      },
      onComplete: () => {
        this.row = row;
        this.col = col;
        this.update();
        this.movementTween = null;

        if (onMovementComplete) onMovementComplete(row, col);
      },
    });
  }

  isInViewport() {
    const { left, right, top, bottom } = this.scene.cameras.main.worldView;
    if (
      this.x < left - CELL_WIDTH ||
      this.x > right + CELL_WIDTH ||
      this.y < top - CELL_HEIGHT ||
      this.y > bottom + CELL_HEIGHT
    ) {
      return false;
    } else return true;
  }

  rotate(duration: number, pull: boolean) {
    let target = 0;
    if (this.facing === "up") {
      target = pull ? 180 : 0;
    } else if (this.facing === "right") {
      target = pull ? -90 : 90;
    } else if (this.facing === "down") {
      target = pull ? 0 : 180;
    } else if (this.facing === "left") {
      target = pull ? 90 : -90;
    }
    const startAngle = this.angle;
    if (startAngle === -90 && target === 180) {
      target = -180;
    }
    if (
      !this.rotationTween &&
      target !== this.angle &&
      this.state !== "Pulling"
    ) {
      this.rotationTween = this.scene.tweens.add({
        targets: [this, this.hands],
        angle: target,

        duration: duration * 0.5,
        ease: "Sine.Out",
        onStart: () => {
          if (startAngle === 0 && target === 270) {
            this.setAngle(360);
            this.hands.setAngle(360);
          } else if (startAngle === 180 && target === -90) {
            this.setAngle(-180);
            this.hands.setAngle(-180);
          }
        },
        onComplete: () => {
          this.setAngle(target);
          if (this.angle === -180) {
            this.setAngle(180);
            this.hands.setAngle(180);
          }
          this.rotationTween = null;
        },
      });
    }
  }
  emitDrops(speed = 175, lifespan = 400) {
    if (!this.particles?.active) {
      let x = this.x;
      let y = this.y;
      if (this.facing === "up") {
        y += 16;
      } else if (this.facing === "down") {
        y -= 16;
      } else if (this.facing === "left") {
        x += 16;
      } else if (this.facing === "right") {
        x -= 16;
      }
      this.particles = this.scene.add.particles(x, y, "player", {
        frame: "white",
        color: [0xffffff, 0x00aaff, 0x44eeff],
        // color: [0xffffff],
        colorEase: "quad.out",
        lifespan,
        // angle: { min: -100, max: -80 },
        scale: { start: 0.25, end: 0, ease: "sine.out" },
        speed,

        advance: 1500,
        frequency: 150,
        deathCallback: () => {
          this.particles?.stop();
          delete this.particles;
        },
        // blendMode: "ADD",
      });
      this.particles.setDepth(this.row + 2);
    }
  }

  remove() {
    this.scene.playersByID.delete(this.id);
    this.movementTween?.destroy();
    this.rotationTween?.destroy();
    this.shadow.destroy();
    this.hands.destroy();
    this.destroy();
  }
}
