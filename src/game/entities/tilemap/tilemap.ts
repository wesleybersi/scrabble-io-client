import { CELL_HEIGHT, CELL_WIDTH } from "../../scenes/Main/constants";
import MainScene from "../../scenes/Main/MainScene";

export default class BasicTilemap {
  scene: MainScene;
  floorMap: Phaser.Tilemaps.Tilemap;
  floorTiles!: Phaser.Tilemaps.Tileset;
  floor!: Phaser.Tilemaps.TilemapLayer;
  constructor(scene: MainScene) {
    this.scene = scene as MainScene;
    this.floorMap = scene.make.tilemap({
      tileWidth: CELL_WIDTH,
      tileHeight: CELL_HEIGHT,
      width: scene.colCount,
      height: scene.rowCount,
    });

    const floorTiles = this.floorMap.addTilesetImage("floor");
    if (floorTiles) this.floorTiles = floorTiles;

    const baseLayer = this.floorMap.createBlankLayer(
      "Base Layer",
      this.floorTiles,
      0,
      0,
      scene.colCount,
      scene.rowCount,
      CELL_WIDTH,
      CELL_HEIGHT
    );

    if (baseLayer) this.floor = baseLayer;

    this.floor.setDepth(0);

    this.placeInitialTiles();
  }

  placeEmptyFloorTile(col: number, row: number) {
    const newTile = this.floor.putTileAt(0, col, row);
    if (!newTile) return;
    newTile.alpha = Math.max(Math.random() * 0.1, 0.05);
  }

  placeInitialTiles() {
    const doubleWord = { chance: 250, color: 0xad4052 };
    const tripleWord = { chance: 500, color: 0xefc350 };
    const doubleLetter = { chance: 250, color: 0x489ad9 };
    const tripleLetter = { chance: 500, color: 0x6de36b };

    this.floor.forEachTile((tile) => {
      // if (!Math.floor(Math.random() * doubleWord.chance)) {
      //   const newTile = this.floor.putTileAt(0, tile.x, tile.y);
      //   newTile.properties = { multiplier: "Double Word" };
      //   newTile.tint = doubleWord.color;
      // } else if (!Math.floor(Math.random() * tripleWord.chance)) {
      //   const newTile = this.floor.putTileAt(0, tile.x, tile.y);
      //   newTile.properties = { multiplier: "Triple Word" };
      //   newTile.tint = tripleWord.color;
      // } else if (!Math.floor(Math.random() * doubleLetter.chance)) {
      //   const newTile = this.floor.putTileAt(0, tile.x, tile.y);
      //   newTile.properties = { multiplier: "Double Letter" };
      //   newTile.tint = doubleLetter.color;
      // } else if (!Math.floor(Math.random() * tripleLetter.chance)) {
      //   const newTile = this.floor.putTileAt(0, tile.x, tile.y);
      //   newTile.properties = { multiplier: "Triple Letter" };
      //   newTile.tint = tripleLetter.color;
      // } else {
      this.placeEmptyFloorTile(tile.x, tile.y);
      // }
    });
  }
}
