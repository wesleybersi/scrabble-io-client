import { Cardinal } from "../types";
import { Player } from "./Player/player";
import MainScene from "../scenes/Main/MainScene";

class Portal extends Phaser.GameObjects.Graphics {
  scene: MainScene;
  graphic!: Phaser.GameObjects.Graphics;
  placement!: Cardinal;
  surface!: "Floor" | "Wall";
  color!: 0x2255ff | 0xcc7722;
  row!: number;
  col!: number;
  targetRow!: number;
  targetCol!: number;
  player!: Player;
  id!: "a" | "b";
  constructor(
    scene: MainScene,
    type: "a" | "b",
    surface: "Floor" | "Wall",
    row: number,
    col: number,
    position: Cardinal,
    player: Player
  ) {
    super(scene as MainScene);
    this.name = "Portal";
    this.scene = scene;
    this.color = type === "a" ? 0x2255ff : 0xcc7722;
    this.graphic = this.scene.add.graphics();
    this.player = player;
    this.surface = surface;
    this.placement = position;
    this.row = row;
    this.col = col;
    this.setTargetTile();
    this.x = col * this.scene.cellWidth;
    this.y = row * this.scene.cellHeight;

    this.graphic.alpha = 0.5;

    this.draw();
    this.scene.add.existing(this);
  }
  setTargetTile() {
    this.targetRow = this.row;
    this.targetCol = this.col;
    switch (this.placement) {
      case "top":
        this.targetRow = this.row - 1;
        break;
      case "bottom":
        this.targetRow = this.row + 1;
        break;
      case "left":
        this.targetCol = this.col - 1;
        break;
      case "right":
        this.targetCol = this.col + 1;
        break;
    }
  }

  draw() {
    const { cellWidth, cellHeight } = this.scene;
    const size = 3;
    if (this.surface === "Wall") {
      this.graphic.setDepth(100);
      let portalX = this.x;
      let portalY = this.y;
      let width = 0;
      let height = 0;
      const radii = { tl: 0, tr: 0, bl: 0, br: 0 };
      if (this.placement === "bottom") {
        portalY += cellHeight;
        width = cellWidth;
        height = size;
        radii.bl = size;
        radii.br = size;
      } else if (this.placement === "top") {
        portalY -= size;
        width = cellWidth;
        height = size;
        radii.tl = size;
        radii.tr = size;
      } else if (this.placement === "left") {
        portalX -= size;
        width = size;
        height = cellHeight;
        radii.tl = size;
        radii.bl = size;
      } else if (this.placement === "right") {
        portalX += cellWidth;
        width = size;
        height = cellHeight;
        radii.tr = size;
        radii.br = size;
      }
      this.graphic.clear();
      this.graphic.fillStyle(this.color);
      this.graphic.fillRoundedRect(portalX, portalY, width, height, radii);
    } else if (this.surface === "Floor") {
      this.setDepth(0);
      this.graphic.fillStyle(this.color);
      this.graphic.fillRoundedRect(
        this.x - size / 2,
        this.y - size / 2,
        cellWidth + size,
        cellHeight + size,
        8
      );
    }
  }
  remove() {
    //TODO
    // const targetPos = `${this.targetRow},${this.targetCol}`;
    // const objectInPlace = this.allObjects.get(targetPos);
    // if (objectInPlace) {
    //   objectInPlace.isConnected[getOppositeSide(portal.placement)] = false;
    //   objectInPlace.draw();
    // }
    this.scene.portals[this.id] = null;
    this.player.portalRemoved();
    this.graphic.clear();
    this.graphic.destroy();
    this.destroy();
  }
}
export default Portal;
