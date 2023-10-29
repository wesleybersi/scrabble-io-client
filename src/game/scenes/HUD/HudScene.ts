import Phaser from "phaser";
import MainScene from "../Main/MainScene";

export default class LoadingScene extends Phaser.Scene {
  main!: MainScene;
  camera!: Phaser.Cameras.Scene2D.Camera;
  constructor() {
    super({ key: "Loading" });
  }
  create(main: MainScene) {
    this.main = main;
    this.camera = this.cameras.main;
  }
  update() {
    this.scene.stop();
  }
}
