import MainScene from "../../scenes/MainScene";

import Wall from "../wall";

export default class Water extends Phaser.GameObjects.Sprite {
  scene: MainScene;
  level: number;
  row: number;
  col: number;
  floor: number;
  adjacentTiles: {
    top?: Water | Wall;
    bottom?: Water | Wall;
    left?: Water | Wall;
    right?: Water | Wall;
  } = { top: undefined, bottom: undefined, left: undefined, right: undefined };
  constructor(
    scene: MainScene,
    row: number,
    col: number,
    floor: number,
    level: number
  ) {
    super(
      scene as MainScene,
      col * scene.cellWidth + scene.cellWidth / 2,
      row * scene.cellHeight + scene.cellHeight / 2,
      "water"
    );
    this.scene = scene;
    this.row = row;
    this.col = col;
    this.floor = floor;
    this.level = level;
    this.alpha = 0.5;

    this.setOrigin(0.5, 0.5);
    this.setDepth(row + floor);
    this.update();

    this.scene.add.existing(this);
  }
  update() {
    this.y =
      this.row * this.scene.cellHeight + this.scene.cellHeight / 2 - this.level;
  }
  remove() {
    //
  }
}
