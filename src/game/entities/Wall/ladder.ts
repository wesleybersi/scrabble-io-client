import MainScene from "../../scenes/Main/MainScene";

export default class LadderPiece extends Phaser.GameObjects.Sprite {
  scene: MainScene;
  top: Phaser.GameObjects.Sprite | undefined;
  bottom: Phaser.GameObjects.Sprite | undefined;
  row: number;
  col: number;
  floor: number;
  constructor(
    scene: MainScene,
    row: number,
    col: number,
    floor: number,
    end?: { top?: boolean; bottom?: boolean }
  ) {
    super(
      scene as MainScene,
      col * scene.cellWidth + scene.cellWidth / 2,
      row * scene.cellHeight + scene.cellHeight / 2 - floor * scene.floorHeight,
      "ladder",
      Math.floor(Math.random() * 8 + 2)
    );
    this.scene = scene;
    this.row = row;
    this.col = col;
    this.floor = floor;
    this.y += 4;
    this.setOrigin(0.5, 0.5);
    this.setDepth(this.row + this.floor);

    if (end) {
      if (end.top) {
        this.top = scene.add.sprite(this.x, this.y - 16, "ladder", 0);
        this.top.setDepth(this.row + this.floor + 1);
      }
      if (end.bottom) {
        this.bottom = scene.add.sprite(this.x, this.y + 16, "ladder", 1);
        this.bottom.setDepth(this.row + this.floor - 1);
      }
    }

    this.scene.add.existing(this);
  }
}
