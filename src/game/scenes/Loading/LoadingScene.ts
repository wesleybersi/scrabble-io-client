import Phaser from "phaser";
import MainScene from "../Main/MainScene";

export default class LoadingScene extends Phaser.Scene {
  main!: MainScene;
  background!: Phaser.GameObjects.Graphics;
  centerSprite!: Phaser.GameObjects.Sprite;
  loadComplete = false;
  startTime = Date.now();
  currentMessageText!: Phaser.GameObjects.Text;
  currentMessage = "";

  constructor() {
    super({ key: "Loading" });
  }
  //   preload() {}
  create(main: MainScene) {
    console.log("Loading: Create");

    this.main = main;

    const camera = this.cameras.main;
    this.main.scene.setVisible(false);
    this.background = this.add.graphics();
    this.background.fillStyle(0x222222, 1);
    this.background.fillRect(0, 0, window.innerWidth, window.innerHeight);

    this.centerSprite = this.add.sprite(
      camera.centerX,
      camera.centerY,
      "loading"
    );

    this.centerSprite.setOrigin(0.5);
    this.centerSprite.setDepth(6000);
  }
  update() {
    if (this.main.hasLoaded) {
      this.main.scene.setVisible(true);
      const elapsedTime = Date.now() - this.startTime;
      console.info("Loading completed in", elapsedTime, "ms");
      this.scene.stop();
    }
  }

  progress(message: string) {
    if (this.centerSprite) this.centerSprite.angle++;
    if (this.currentMessageText) {
      this.currentMessageText.setText(message);
      this.currentMessageText.updateText();
      console.log(message);
    } else {
      this.currentMessageText = this.add.text(
        this.cameras.main.centerX,
        this.cameras.main.centerY + 150,
        message
      );
      this.currentMessageText.setOrigin(0.5);
      this.currentMessageText.setColor("white");
      this.currentMessageText.setFontSize("20px");
      this.currentMessageText.setDepth(6000);
      console.log(message);
      this.currentMessageText.updateText();
    }
  }
}
