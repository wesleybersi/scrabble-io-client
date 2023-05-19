import MainScene from "../scenes/MainScene";

export default class CornerPiece extends Phaser.GameObjects.Sprite {
  scene: MainScene;
  row: number;
  col: number;
  direction: "TopLeft" | "TopRight" | "BottomLeft" | "BottomRight" = "TopLeft";
  parent: Phaser.Tilemaps.Tile;
  constructor(
    scene: MainScene,
    direction: "TopLeft" | "TopRight" | "BottomLeft" | "BottomRight",
    x: number,
    y: number,
    row: number,
    col: number,
    tile: Phaser.Tilemaps.Tile
  ) {
    super(scene as MainScene, x, y, "cornerpiece");
    this.scene = scene;

    this.row = row;
    this.col = col;
    this.setOrigin(0.5, 0.5);
    this.setDepth(1);
    this.parent = tile;
    this.snap();
    this.rotatePiece(this.direction);

    this.scene.add.existing(this);
  }
  snap() {
    const { floor } = this.scene.tilemap;

    const positions = {
      top: floor.getTileAt(this.col, this.row - 1)?.properties.name === "Ice",
      right: floor.getTileAt(this.col + 1, this.row)?.properties.name === "Ice",
      bottom:
        floor.getTileAt(this.col, this.row + 1)?.properties.name === "Ice",
      left: floor.getTileAt(this.col - 1, this.row)?.properties.name === "Ice",
    };
    const { top, right, bottom, left } = positions;

    if (top && right && !bottom && !left) this.direction = "BottomLeft";
    else if (top && !right && !bottom && left) this.direction = "BottomRight";
    else if (!top && right && bottom && !left) this.direction = "TopLeft";
    else if (!top && !right && bottom && left) this.direction = "TopRight";
    else this.direction = "TopLeft";
  }
  rotatePiece(
    direction: "TopLeft" | "TopRight" | "BottomLeft" | "BottomRight"
  ) {
    this.direction = direction;

    if (direction === "TopLeft") {
      this.angle = 0;
    } else if (direction === "TopRight") {
      this.angle = 90;
    } else if (direction === "BottomLeft") {
      this.angle = 270;
    } else if (direction === "BottomRight") {
      this.angle = 180;
    }
  }
}
