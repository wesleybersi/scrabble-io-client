import MainScene from "../../scenes/Main/MainScene";
import CornerPiece from "../cornerpiece";

export default class BasicTilemap {
  scene: MainScene;
  floorMap: Phaser.Tilemaps.Tilemap;
  floorTiles!: Phaser.Tilemaps.Tileset;
  wallTiles!: Phaser.Tilemaps.Tileset;
  floor!: Phaser.Tilemaps.TilemapLayer;
  constructor(scene: MainScene) {
    this.scene = scene as MainScene;
    //The map keeping track of all the layers
    this.floorMap = scene.make.tilemap({
      tileWidth: scene.cellWidth,
      tileHeight: scene.cellHeight,
      width: scene.colCount,
      height: scene.rowCount,
    });

    //The tiles in PNG
    const floorTiles = this.floorMap.addTilesetImage("floor-tileset");
    if (floorTiles) this.floorTiles = floorTiles;

    //Where base tiles like walls and floor tiles are placed
    const baseLayer = this.floorMap.createBlankLayer(
      "Base Layer",
      this.floorTiles,
      0,
      0,
      scene.colCount,
      scene.rowCount,
      32,
      32
    );

    if (baseLayer) this.floor = baseLayer;

    this.floor.setDepth(0);

    this.placeInitialTiles();
  }

  placeVoid(col: number, row: number) {
    const newTile = this.floor.putTileAt(0, col, row);
    newTile.setCollision(false, false, false, false);
    newTile.properties = { name: "Void" };
  }

  placeEmptyFloorTile(col: number, row: number) {
    const newTile = this.floor.putTileAt(1, col, row);
    newTile.setCollision(false, false, false, false);
    newTile.properties = { name: "Empty" };
    newTile.alpha = 0.65;
  }

  placeIceTile(col: number, row: number) {
    const newTile = this.floor.putTileAt(2, col, row);
    newTile.setCollision(false, false, false, false);
    newTile.properties = { name: "Ice" };
    newTile.alpha = 0.85;
  }

  placeLavaTile(col: number, row: number) {
    const newTile = this.floor.putTileAt(3, col, row);
    newTile.setCollision(false, false, false, false);
    newTile.properties = { name: "Lava" };
    newTile.alpha = 0.85;
  }

  addCornerPiece(col: number, row: number) {
    const { cellWidth, cellHeight } = this.scene;
    const iceTile = this.floor.getTileAt(col, row);
    const cornerPiece = iceTile.properties.cornerPiece;
    if (cornerPiece) {
      if (cornerPiece.direction === "TopLeft")
        cornerPiece.rotatePiece("TopRight");
      else if (cornerPiece.direction === "TopRight")
        cornerPiece.rotatePiece("BottomRight");
      else if (cornerPiece.direction === "BottomRight")
        cornerPiece.rotatePiece("BottomLeft");
      else if (cornerPiece.direction === "BottomLeft")
        cornerPiece.rotatePiece("TopLeft");
    } else {
      iceTile.properties.cornerPiece = new CornerPiece(
        this.scene,
        "TopLeft",
        col * cellWidth + cellWidth / 2,
        row * cellHeight + cellHeight / 2,
        row,
        col,
        iceTile
      );
    }
  }

  placeInitialTiles() {
    this.floor.forEachTile((tile) => {
      this.placeEmptyFloorTile(tile.x, tile.y);
    });
  }
}
