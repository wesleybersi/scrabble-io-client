import MainScene from "../../scenes/MainScene";

import Wall from "../wall";

export default class Water extends Phaser.GameObjects.Sprite {
  scene: MainScene;
  level: number;
  row: number;
  col: number;
  floor: number;
  target: { x: number; y: number };
  animationMask?: Phaser.GameObjects.Graphics;
  animating = true;
  adjacentTiles: {
    top?: Water | Wall;
    bottom?: Water | Wall;
    left?: Water | Wall;
    right?: Water | Wall;
  } = { top: undefined, bottom: undefined, left: undefined, right: undefined };
  isBeingDrained = false;
  waterMap: Map<string, Water>;
  constructor(
    scene: MainScene,
    row: number,
    col: number,
    floor: number,
    level: number,
    direction: "up" | "down" | "left" | "right" | "in",
    waterMap: Map<string, Water>
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
    this.y -= this.level;
    this.target = { x: this.x, y: this.y };
    this.waterMap = waterMap;
    const { cellHeight, cellWidth, floorHeight: maxLevel } = this.scene;

    this.alpha = Math.max(Math.min(this.level / maxLevel, 0.8));
    this.animationMask = scene.add.graphics();
    this.animationMask.fillRect(
      this.x - cellWidth / 2,
      this.y - cellHeight / 2,
      cellWidth,
      cellHeight
    );
    this.animationMask.alpha = 0;

    //Set up position for animation
    switch (direction) {
      case "up":
        this.y += cellHeight;
        break;
      case "down":
        this.y -= cellHeight;
        break;
      case "left":
        this.x += cellWidth;
        break;
      case "right":
        this.x -= cellWidth;
        break;
    }
    this.scene.add.existing(this);

    this.setOrigin(0.5, 0.5);
    this.setDepth(row + floor);
    this.animate(direction);
  }
  animate(direction: "up" | "down" | "left" | "right" | "in") {
    if (!this.animationMask) return;
    this.setMask(
      new Phaser.Display.Masks.GeometryMask(this.scene, this.animationMask)
    );
    if (direction === "in") {
      this.clearMask();
      this.animating = false;
      this.animationMask?.destroy();
      return;
    }
    this.scene.tweens.add({
      targets: [this],
      duration: 75,
      x: this.target.x,
      y: this.target.y,
      ease: "Linear",
      onComplete: () => {
        this.clearMask();
        this.animating = false;
        this.animationMask?.destroy();
      },
    });
  }
  update() {
    const { floorHeight: maxLevel } = this.scene;
    this.y =
      this.row * this.scene.cellHeight +
      this.scene.cellHeight / 2 -
      Math.floor(this.level);
    this.alpha = Math.max(Math.min(Math.floor(this.level) / maxLevel, 0.8));
    this.setDepth(this.row + Math.floor(this.level / maxLevel));
  }
  remove() {
    this.waterMap.delete(`${this.row},${this.col}`);
    this.destroy();
  }
}
