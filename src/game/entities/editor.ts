import { FloorTile } from "./../temp/tileProvider";
import { Cardinal, Direction } from "../types";
import { Player } from "./Player/player";

import MainScene from "../scenes/MainScene";
import Laser from "./Laser/laser";
import Crate from "./Crate/crate";
import Bubble from "./bubble";
import { getAdjacentTiles } from "../utils/opposite";

class Editor extends Phaser.GameObjects.Graphics {
  scene: MainScene;
  graphics!: Phaser.GameObjects.Graphics;
  screenBorder!: Phaser.GameObjects.Graphics;
  enabled = false;
  player: Player;
  buttons = { meta: false, shift: false, rotate: false, fill: false };
  selection!: {
    from: { row: number; col: number };
    to: { row: number; col: number };
  };
  selected:
    | "None"
    | "Void"
    | "Oil"
    | "Wall"
    | "Crate"
    | "Metal Crate"
    | "Explosive"
    | "Nuke"
    | "Pipe"
    | "Remover"
    | "Portal"
    | "Ice"
    | "Cornerpiece"
    | "Bubble"
    | "Water"
    | "Laser"
    | "Lava"
    | "Propulsion" = "Wall";
  placement!: Cardinal;
  camera!: Phaser.Cameras.Scene2D.Camera;
  startPos!: { row: number; col: number } | null;
  lastPlaced: { row: number; col: number };
  currentRotation: Direction = "up";
  constructor(
    scene: MainScene,
    camera: Phaser.Cameras.Scene2D.Camera,
    buttons: { meta: boolean; shift: boolean; rotate: boolean; fill: boolean },
    player: Player
  ) {
    super(scene as MainScene);
    this.scene = scene;
    this.name = "Editor";
    this.buttons = buttons;
    this.camera = camera;
    this.player = player;
    this.lastPlaced = { row: -1, col: -1 };
    this.startPos = { row: -1, col: -1 };

    this.addSelectionEvents();

    this.screenBorder = this.scene.add.graphics();
    this.screenBorder.setDepth(100);

    this.setScreenBorder();

    this.scene.add.existing(this);
  }
  addSelectionEvents() {
    this.scene.input.keyboard?.on("keydown", (event: KeyboardEvent) => {
      switch (event.key) {
        case "0":
          this.selected = "Void";
          break;
        case "1":
          this.selected = "Wall";
          break;
        case "2":
          this.selected = "Nuke";
          break;
        case "3":
          this.selected = "Oil";
          break;
        case "4":
          this.selected = "Crate";
          break;
        case "5":
          this.selected = "Metal Crate";
          break;
        case "6":
          this.selected = "Explosive";
          break;
        case "7":
          this.selected = "Ice";
          break;
        case "8":
          this.selected = "Bubble";
          break;
        case "9":
          this.selected = "Laser";
          break;
        case "-":
          this.selected = "Lava";
          break;
        case "r":
          this.selected = "None";
          break;
      }
    });

    this.scene.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
      if (!this.enabled) return;
      const { hover, buttons } = this.scene;
      if (buttons.pointerDown && !pointer.rightButtonDown()) {
        this.placeSelection(hover.row, hover.col, false);

        //Dragging from startPos
        if (!this.startPos) return;
        const { allLasers, tilemap } = this.scene;
        const laser = allLasers.get(
          `${this.startPos.row},${this.startPos.col}`
        );
        const wall = tilemap.walls.getTileAt(hover.col, hover.row);
        if (wall) {
          this.startPos = null;
          return;
        }

        if (laser) {
          if (this.selected !== "None" && this.selected !== "Laser") return;
          if (laser.direction === "down" || laser.direction === "up") {
            if (hover.row === laser.row) {
              if (hover.col > this.startPos.col) {
                laser.expanse = hover.col - this.startPos.col + 1;
                laser.movement = "out";
              }
              if (hover.col < this.startPos.col) {
                laser.expanse = this.startPos.col - hover.col + 1;
                laser.movement = "in";
              }
            }
          } else if (
            laser.direction === "left" ||
            laser.direction === "right"
          ) {
            if (hover.col === laser.col) {
              if (hover.row > this.startPos.row) {
                laser.expanse = hover.row - this.startPos.row + 1;
                laser.movement = "out";
              }
              if (hover.row < this.startPos.row) {
                laser.expanse = this.startPos.row - hover.row + 1;
                laser.movement = "in";
              }
            }
          }
        }
      }
    });
    this.scene.input.on("pointerup", (pointer: Phaser.Input.Pointer) => {
      if (!this.enabled) return;
      this.startPos = null;
    });
    this.scene.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      if (this.buttons.fill) {
        if (this.buttons.meta) {
          const area = this.fillArea(
            true,
            this.scene.hover.row,
            this.scene.hover.col,
            "Clear"
          );
          console.log(area);
          return;
        }

        if (this.selected === "Ice" || this.selected === "Wall") {
          const area = this.fillArea(
            true,
            this.scene.hover.row,
            this.scene.hover.col,
            this.selected
          );
          console.log(area);
          return;
        }
      }

      if (!this.enabled) return;
      this.startPos = { row: this.scene.hover.row, col: this.scene.hover.col };
      if (!pointer.rightButtonDown()) {
        const { hover } = this.scene;

        this.placeSelection(hover.row, hover.col, true);
      } else {
        const { tilemap, allLasers, allCrates, hover } = this.scene;
        const { walls, floor } = tilemap;
        //Copying

        const crate = allCrates.get(`${hover.row},${hover.col}`);
        if (crate) {
          this.selected === "Crate";
          return;
        }

        const wall = walls.getTileAt(hover.col, hover.row);
        if (wall && wall.properties.name === "Wall") {
          this.selected === "Wall";
          return;
        }

        const floorTile = floor.getTileAt(hover.col, hover.row);
        if (floorTile) {
          switch (floorTile.properties.name) {
            case "Ice":
              this.selected = "Ice";
              return;
            case "Water":
              this.selected = "Water";
              return;
          }
        }
        const laser = allLasers.get(`${hover.row},${hover.col}`);

        if (laser) {
          this.selected = "Laser";
          return;
        }
      }
    });
  }
  placeSelection(row: number, col: number, placeByClicking: boolean) {
    if (!this.enabled) return;

    const { player, allLasers, allCrates, tilemap, cellSize } = this.scene;

    const { walls, floor } = tilemap;

    const position = `${row},${col}`;
    const crate = allCrates.get(`${row},${col}`);
    const wall = walls.getTileAt(col, row);
    const floorTile = floor.getTileAt(col, row);

    if (this.buttons.meta) {
      if (crate) {
        crate.remove();
        return;
      }
      const laserInPlace = allLasers.get(`${row},${col}`);
      if (laserInPlace) {
        laserInPlace?.remove();
        return;
      }
      if (
        floorTile &&
        floorTile.properties.name === "Ice" &&
        floorTile.properties.cornerPiece
      ) {
        floorTile.properties.cornerPiece.destroy();
        delete floorTile.properties.cornerPiece;
        return;
      }
      tilemap.placeEmptyFloorTile(col, row);
      return;
    }

    const toggleLaser = () => {
      const laserInPlace = allLasers.get(`${row},${col}`);

      // let oscilate = false;
      // let movement: "in" | "out" = "out";
      // let expanse = 0;

      // if (this.buttons.shift) {
      //   oscilate = true;
      //   let inout: string | null = null;

      //   expanse = Number(prompt("Expanse:")) - 1;
      //   inout = prompt("out = right & down, in = left & up");

      //   if (inout === "in" || inout === "out") {
      //     movement = inout;
      //   }
      // }

      if (!laserInPlace && placeByClicking) {
        new Laser(
          this.scene as MainScene,
          row,
          col,
          0,
          undefined
          // oscilate ? { expanse, movement } : undefined
        );
      } else if (laserInPlace instanceof Laser && placeByClicking) {
        if (this.buttons.rotate) {
          laserInPlace.rotate();
        }
      }
    };

    switch (this.selected) {
      case "Void":
        tilemap.placeVoid(col, row);
        break;
      case "Oil":
        tilemap.addOil(col, row);
        break;
      case "Lava":
        tilemap.placeLavaTile(col, row);
        break;
      case "Bubble":
        if (!placeByClicking) return;
        new Bubble(
          this.scene,
          col * cellSize + cellSize / 2,
          row * cellSize + cellSize / 2,
          row,
          col,
          "left"
        );
        break;
      case "Wall":
        if (wall) {
          if (!placeByClicking) return;
          if (!wall.properties.cracks) {
            tilemap.addWallCracks(col, row);
          } else {
            wall.properties.cracks.destroy();
            delete wall.properties.cracks;
          }
        } else {
          if (floorTile && floorTile.properties.name === "Ice") return;
          if (crate) return;
          tilemap.placeWall(col, row);
        }

        break;
      case "Nuke":
        if (wall) return;
        if (crate && crate instanceof Crate) {
          if (this.buttons.shift) {
            crate.connectShape();
            return;
          }
        }
        if (!crate) {
          if (player.row === row && player.col === col) return;
          new Crate(
            this.scene as MainScene,
            "Nuke",
            8,
            row,
            col,
            col * cellSize,
            row * cellSize,
            this.buttons.shift //Hold CMD to connect blocks
          );
        }
        break;
      case "Crate":
        if (wall) return;
        if (crate && crate instanceof Crate) {
          if (this.buttons.shift) {
            crate.connectShape();
            return;
          }
        }
        if (!crate) {
          if (player.row === row && player.col === col) return;
          new Crate(
            this.scene as MainScene,
            "Wood",
            Math.floor(Math.random() * 6),
            row,
            col,
            col * cellSize,
            row * cellSize,
            this.buttons.shift //Hold CMD to connect blocks
          );
        }
        break;
      case "Metal Crate":
        if (wall) return;
        if (crate && crate instanceof Crate) {
          if (this.buttons.shift && crate.crateType === "Metal") {
            crate.connectShape();
            return;
          }
        }
        if (!crate) {
          if (player.row === row && player.col === col) return;
          new Crate(
            this.scene as MainScene,
            "Metal",
            6,
            row,
            col,
            col * cellSize,
            row * cellSize,
            this.buttons.shift //Hold CMD to connect blocks
          );
        }
        break;
      case "Explosive":
        if (wall) return;
        if (crate && crate instanceof Crate) {
          if (this.buttons.shift && crate.crateType === "Metal") {
            crate.connectShape();
            return;
          }
        }
        if (!crate) {
          if (player.row === row && player.col === col) return;
          new Crate(
            this.scene as MainScene,
            "Explosive",
            7,
            row,
            col,
            col * cellSize,
            row * cellSize,
            this.buttons.shift //Hold CMD to connect blocks
          );
        }
        break;
      case "Ice":
        if (wall) return;
        if (floorTile && placeByClicking) {
          if (floorTile.properties.name === "Ice") {
            tilemap.addCornerPiece(col, row);
          }
        }
        if (floorTile) {
          if (floorTile.properties.name !== "Ice") {
            tilemap.placeIceTile(col, row);
          }
        } else {
          tilemap.placeIceTile(col, row);
        }
        break;
      case "Water":
        if (wall) return;
        // toggleFloorTile("Water");
        break;
      case "Laser":
        if (wall) return;
        toggleLaser();
        break;
    }
  }
  setScreenBorder() {
    // if (this.enabled) {
    //   this.screenBorder.clear();
    //   this.screenBorder.setActive(true);
    //   this.screenBorder.setVisible(true);
    //   this.screenBorder.setDepth(1000);
    //   const size = 8;
    //   if (this.buttons.meta) {
    //     this.screenBorder.lineStyle(size, 0xff0000);
    //   } else if (this.buttons.fill) {
    //     this.screenBorder.lineStyle(size, 0x0000ff);
    //   } else {
    //     this.screenBorder.lineStyle(size, 0xffdd55);
    //   }
    //   this.screenBorder.strokeRect(
    //     this.camera.worldView.left,
    //     this.camera.worldView.top,
    //     this.camera.worldView.width,
    //     this.camera.worldView.height
    //   );
    // } else {
    //   this.screenBorder.setActive(false);
    //   this.screenBorder.setVisible(false);
    // }
  }
  enable() {
    console.log("Editor mode: enabled");
    this.enabled = true;
    this.setScreenBorder();
  }
  disable() {
    console.log("Editor mode: disabled");
    this.enabled = false;
    this.setScreenBorder();
  }

  fillArea(
    initial: boolean,
    row: number,
    col: number,
    type: "Clear" | "Ice" | "Wall",
    area: Set<string> = new Set()
  ): Set<string> {
    const { tilemap, allCrates, player, rowCount, colCount } = this.scene;
    const { walls, floor } = tilemap;

    if (row >= rowCount || col >= colCount || row <= 0 || col <= 0) return area;

    const adjacent = getAdjacentTiles(row, col);
    if (initial) {
      area.add(`${row},${col}`);

      if (type === "Clear") tilemap.placeEmptyFloorTile(col, row);
      else if (type === "Ice") {
        if (floor.getTileAt(col, row)?.properties.name === "Empty") {
          tilemap.placeIceTile(col, row);
        }
      } else if (type === "Wall") {
        if (!allCrates.has(`${row},${col}`)) {
          if (player.row !== row || player.col !== col) {
            tilemap.placeWall(col, row);
          }
        }
      }
    }

    for (const [side, tile] of Object.entries(adjacent)) {
      if (
        tile.row >= rowCount ||
        tile.col >= colCount ||
        tile.row <= 0 ||
        tile.col <= 0
      )
        return area;
      const wall = walls.getTileAt(tile.col, tile.row);
      if (type === "Clear" && !wall) continue;
      if (type !== "Clear" && wall) continue;
      const pos = `${tile.row},${tile.col}`;
      if (!area.has(pos)) {
        area.add(`${tile.row},${tile.col}`);

        if (type === "Clear") tilemap.placeEmptyFloorTile(tile.col, tile.row);
        else if (type === "Ice") {
          if (
            floor.getTileAt(tile.col, tile.row)?.properties.name === "Empty"
          ) {
            tilemap.placeIceTile(tile.col, tile.row);
          }
        } else if (type === "Wall") {
          if (!allCrates.has(pos)) {
            if (player.row !== tile.row || player.col !== tile.col) {
              tilemap.placeWall(tile.col, tile.row);
            }
          }
        }

        this.fillArea(false, tile.row, tile.col, type, area);
      }
    }

    return area;
  }
}

export default Editor;
