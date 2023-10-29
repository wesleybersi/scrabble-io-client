import Phaser from "phaser";
import MainScene from "../Main/MainScene";

export default class LandingScene extends Phaser.Scene {
  main!: MainScene;
  camera!: Phaser.Cameras.Scene2D.Camera;
  playButton!: Phaser.GameObjects.Arc;
  initialSettings: {
    client: string;
    id: string;
    mode: "Free For All" | "Teams" | "Country";
    language: "English" | "Dutch";
  };
  constructor() {
    super({ key: "Landing" });
    this.initialSettings = {
      client: "",
      id: "",
      mode: "Free For All",
      language: "Dutch",
    };
  }
  create() {
    this.camera = this.cameras.main;
    this.playButton = this.add.circle();
    this.playButton.x = this.camera.centerX;
    this.playButton.y = this.camera.centerY;
    this.playButton.setFillStyle(0x44ff44);
    this.playButton.radius = 64;

    this.playButton.setInteractive();

    console.info(navigator.language);

    this.playButton.on("pointerdown", (event: Phaser.Input.Pointer) => {
      this.scene.launch("Main", this.initialSettings);
      this.scene.stop();
    });
  }
}
