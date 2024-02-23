import MainScene from "../../scenes/Main/MainScene";

class Emitter extends Phaser.GameObjects.Particles.ParticleEmitter {
  scene: MainScene;
  constructor(scene: MainScene) {
    super({});
    this.scene = scene;
  }
}

export default Emitter;
