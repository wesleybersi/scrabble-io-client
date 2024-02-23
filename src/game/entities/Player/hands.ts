import MainScene from "../../scenes/Main/MainScene";
import { CELL_HEIGHT, CELL_WIDTH } from "../../scenes/Main/constants";
import { Player } from "./player";

interface Hand {
  type: "left" | "right";
  sprite: Phaser.GameObjects.Sprite;
  shadow: Phaser.GameObjects.Sprite;
  position: "up" | "down" | "center";
}

export class Hands extends Phaser.GameObjects.Container {
  scene: MainScene;
  player: Player;
  areMoving = false;
  leftHand: Hand;
  rightHand: Hand;
  constructor(scene: MainScene, player: Player) {
    super(scene, player.x, player.y);
    this.setSize(CELL_WIDTH, CELL_HEIGHT);
    this.scene = scene;
    this.player = player;
    this.leftHand = {
      type: "left",
      sprite: new Phaser.GameObjects.Sprite(scene, 0, -8, "player"),
      shadow: new Phaser.GameObjects.Sprite(scene, 0, -8, "player"),
      position: "up",
    };
    this.rightHand = {
      type: "right",
      sprite: new Phaser.GameObjects.Sprite(scene, 0, -8, "player"),
      shadow: new Phaser.GameObjects.Sprite(scene, 0, -8, "player"),
      position: "down",
    };

    this.setDepth(player.row);
    this.leftHand.sprite.setTint(player.color);
    this.rightHand.sprite.setTint(player.color);
    this.leftHand.sprite.setAlpha(0.85);
    this.rightHand.sprite.setAlpha(0.85);
    this.leftHand.sprite.setOrigin(1.25, 0.5);
    this.rightHand.sprite.setOrigin(-0.25, 0.5);

    this.leftHand.sprite.setScale(0.3);
    this.rightHand.sprite.setScale(0.3);

    this.leftHand.shadow.setTint(0x000000);
    this.rightHand.shadow.setTint(0x000000);
    this.leftHand.shadow.setAlpha(0.1);
    this.rightHand.shadow.setAlpha(0.1);
    this.leftHand.shadow.setOrigin(1.25, 0.25);
    this.rightHand.shadow.setOrigin(-0.25, 0.25);

    this.leftHand.shadow.setScale(0.3);
    this.rightHand.shadow.setScale(0.3);

    this.add(this.leftHand.shadow);
    this.add(this.rightHand.shadow);

    this.add(this.leftHand.sprite);
    this.add(this.rightHand.sprite);

    this.scene.add.existing(this);
    this.setAlpha(0);
  }
  movement(duration: number) {
    const createTween = (hand: Hand) => {
      const offset = CELL_HEIGHT / 8;
      let targetY = 0;
      if (hand.position === "up") {
        targetY = offset;
      } else if (hand.position === "down") {
        targetY = -offset;
      }
      this.scene.tweens.add({
        targets: [hand.sprite, hand.shadow],
        y: targetY,
        duration: duration - 10,
        onComplete: () => {
          if (hand.position === "up") hand.position = "down";
          else if (hand.position === "down") hand.position = "up";
          this.scene.tweens.add({
            targets: [hand.sprite, hand.shadow],
            y: -8,
            duration: 200,
          });
        },
      });
    };
    createTween(this.leftHand);
    createTween(this.rightHand);
    this.setDepth(this.player.row + 2);
  }
  pushOrPull(duration: number) {
    const createTween = (hand: Hand) => {
      const offset = CELL_HEIGHT / 2 + 4;
      let targetY = 0;
      if (hand.position === "up") {
        targetY = -offset * 0.85;
      } else if (hand.position === "down") {
        targetY = -offset;
      }

      this.scene.tweens.add({
        targets: [hand.sprite, hand.shadow],
        y: targetY,
        x: hand.type === "left" ? 3 : -3,
        duration: duration,
        onComplete: () => {
          if (hand.position === "up") hand.position = "down";
          else if (hand.position === "down") hand.position = "up";
          this.scene.tweens.add({
            targets: [hand.sprite, hand.shadow],

            y: -8,
            x: 0,
            duration: 200,
          });
        },
      });
    };
    createTween(this.leftHand);
    createTween(this.rightHand);
    this.setDepth(this.player.row + 2);
  }
}
