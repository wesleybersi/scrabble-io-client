import MainScene from "../../scenes/MainScene";
import {
  connectSurroundingWalls,
  disconnectSurroundingWalls,
} from "./wall-tiles/detect-surrounding-walls";
import { adjacentToTileIndex } from "./wall-tiles/detect-surrounding-walls";
import Cracks from "../cracks";
import CornerPiece from "../cornerpiece";
// import { detectCornerPiece } from "./wall-tiles/detect-surrounding-walls";

export default class BasicTilemap {
  scene: MainScene;
  floorMap: Phaser.Tilemaps.Tilemap;
  wallMap: Phaser.Tilemaps.Tilemap;
  floorTiles!: Phaser.Tilemaps.Tileset;
  wallTiles!: Phaser.Tilemaps.Tileset;
  floor!: Phaser.Tilemaps.TilemapLayer;
  walls!: Phaser.Tilemaps.TilemapLayer;
  constructor(scene: MainScene) {
    this.scene = scene as MainScene;
    //The map keeping track of all the layers
    this.floorMap = scene.make.tilemap({
      tileWidth: 32,
      tileHeight: 32,
      width: scene.colCount,
      height: scene.rowCount,
    });
    this.wallMap = scene.make.tilemap({
      tileWidth: 32,
      tileHeight: 32,
      width: scene.colCount,
      height: scene.rowCount,
    });

    //The tiles in PNG
    const floorTiles = this.floorMap.addTilesetImage("floor-tileset");
    if (floorTiles) this.floorTiles = floorTiles;

    const wallTiles = this.wallMap.addTilesetImage("wall-tileset");
    if (wallTiles) this.wallTiles = wallTiles;

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
    const wallLayer = this.wallMap.createBlankLayer(
      "Wall Layer",
      this.wallTiles,
      0,
      0,
      scene.colCount,
      scene.rowCount,
      32,
      32
    );

    if (baseLayer) this.floor = baseLayer;
    if (wallLayer) this.walls = wallLayer;

    this.floor.setDepth(0);
    this.walls.setDepth(5);

    this.placeInitialWalls();

    // this.placeEmptyFloorTile(this.scene.player.col, this.scene.player.row);

    // Define the size of the rectangle
    const rectangleWidth = 7;
    const rectangleHeight = 7;

    // Calculate the starting position of the rectangle
    const startX = this.scene.player.col - Math.floor(rectangleWidth / 2);
    const startY = this.scene.player.row - Math.floor(rectangleHeight / 2);

    // Loop through the tiles and call the placeEmptyFloorTile function
    for (let x = startX; x < startX + rectangleWidth; x++) {
      for (let y = startY; y < startY + rectangleHeight; y++) {
        this.placeEmptyFloorTile(x, y);
      }
    }
  }

  placeVoid(col: number, row: number) {
    disconnectSurroundingWalls(this.walls, row, col);
    this.walls.removeTileAt(col, row);

    const newTile = this.floor.putTileAt(0, col, row);
    newTile.setCollision(false, false, false, false);
    newTile.properties = { name: "Void" };
  }

  placeEmptyFloorTile(col: number, row: number) {
    disconnectSurroundingWalls(this.walls, row, col);

    this.removeWall(col, row);

    // const randomTile = Math.floor(Math.random() * 3);
    const newTile = this.floor.putTileAt(3, col, row);
    newTile.setCollision(false, false, false, false);
    newTile.properties = { name: "Empty" };
    newTile.alpha = 0.85;
  }

  placeIceTile(col: number, row: number) {
    disconnectSurroundingWalls(this.walls, row, col);

    this.removeWall(col, row);

    // const randomTile = Math.floor(Math.random() * 3);
    const newTile = this.floor.putTileAt(4, col, row);
    newTile.setCollision(false, false, false, false);
    newTile.properties = { name: "Ice" };
    newTile.alpha = 0.85;
  }
  addCornerPiece(col: number, row: number) {
    const { cellSize } = this.scene;
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
        col * cellSize + cellSize / 2,
        row * cellSize + cellSize / 2,
        row,
        col,
        iceTile
      );
    }
  }

  placeWall(col: number, row: number) {
    const {
      top,
      bottom,
      left,
      right,
      topLeft,
      topRight,
      bottomLeft,
      bottomRight,
    } = connectSurroundingWalls(this.walls, row, col);

    const tileIndex = adjacentToTileIndex(
      top,
      bottom,
      left,
      right,
      topLeft,
      topRight,
      bottomLeft,
      bottomRight
    );

    this.floor.removeTileAt(col, row);

    const newTile = this.walls.putTileAt(tileIndex, col, row);
    newTile.setCollision(true, true, true, true);
    newTile.properties = {
      name: "Wall",
      portalable: false,
      connectedTo: {
        top,
        bottom,
        left,
        right,
        topLeft,
        topRight,
        bottomLeft,
        bottomRight,
      },
    };
    newTile.alpha = 0.45;
  }
  removeWall(col: number, row: number) {
    const wall = this.walls.getTileAt(col, row);
    if (wall) {
      wall.properties.cracks?.destroy();
      this.walls.removeTileAt(col, row);
    }
  }
  addWallCracks(col: number, row: number) {
    const { cellSize } = this.scene;
    const wall = this.walls.getTileAt(col, row);
    if (wall.properties.cracks) return;
    wall.properties.cracks = new Cracks(
      this.scene,
      col * cellSize + cellSize / 2,
      row * cellSize + cellSize / 2,
      row,
      col
    );
  }

  placeInitialWalls() {
    this.walls.forEachTile((tile) => {
      tile.properties.connectedTo = {
        top: true,
        bottom: true,
        left: true,
        right: true,
      };
      this.placeWall(tile.x, tile.y);
    });
  }
}
