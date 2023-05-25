import MainScene from "../scenes/Main/MainScene";

import { Cardinal, Direction } from "../types";
import { Player } from "./Player/player";
import Laser from "./Laser/laser";
import Crate from "./Crate/crate";
import Wall from "./wall";
import Ramp from "./ramp";
import Drain from "./drain";
import Flow from "./WaterFlow/Flow";
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
    | "Ramp"
    | "HalfWall"
    | "BigWall"
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
    | "Drain"
    | "Propulsion" = "Wall";
  placement!: Cardinal;
  camera!: Phaser.Cameras.Scene2D.Camera;
  startPos!: { row: number; col: number } | null;
  lastPlaced: { row: number; col: number };
  currentRotation: Direction = "right";
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
          this.selected = "HalfWall";
          break;
        case "2":
          this.selected = "Wall";
          break;
        case "3":
          this.selected = "BigWall";
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
          this.selected = "Ramp";
          break;
        case "9":
          this.selected = "Laser";
          break;
        case "-":
          this.selected = "Water";
          break;
        case "g":
          this.selected = "Drain";
          break;
        case "r":
          if (this.currentRotation === "up") this.currentRotation = "right";
          else if (this.currentRotation === "right")
            this.currentRotation = "down";
          else if (this.currentRotation === "down")
            this.currentRotation = "left";
          else if (this.currentRotation === "left") this.currentRotation = "up";
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
      // if (this.buttons.fill) {
      //   if (this.buttons.meta) {
      //     const area = this.fillArea(
      //       true,
      //       this.scene.hover.row,
      //       this.scene.hover.col,
      //       "Clear"
      //     );
      //     console.log(area);
      //     return;
      //   }

      //   if (this.selected === "Ice" || this.selected === "Wall") {
      //     const area = this.fillArea(
      //       true,
      //       this.scene.hover.row,
      //       this.scene.hover.col,
      //       this.selected
      //     );
      //     console.log(area);
      //     return;
      //   }
      // }

      // if (!this.enabled) return;
      this.startPos = { row: this.scene.hover.row, col: this.scene.hover.col };
      if (!pointer.rightButtonDown()) {
        // const { hover } = this.scene;

        this.placeSelection(hover.row, hover.col, true);
      } else {
        const { tilemap, allLasers, allCrates, allWalls, hover } = this.scene;
        const { floor } = tilemap;
        //Copying

        // const crate = allCrates.get(`${hover.row},${hover.col}`);
        // if (crate) {
        //   this.selected === "Crate";
        //   return;
        // }

        const wall = allWalls.get(`${hover.row},${hover.col}`);
        if (wall) {
          if (wall.wallType === "wall") this.selected = "Wall";
          else if (wall.wallType === "half-wall") this.selected = "HalfWall";
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

    const {
      player,
      allLasers,
      allWalls,
      allRamps,
      tilemap,
      cellWidth,
      cellHeight,
      hover,
    } = this.scene;

    const { floor } = tilemap;

    const position = `${row},${col}`;
    const wall = allWalls.get(position);
    const floorTile = floor.getTileAt(col, row);

    if (this.buttons.meta) {
      if (hover.object instanceof Crate) hover.object.remove();

      if (hover.object instanceof Ramp) {
        hover.object.remove();
        return;
      }

      if (wall) {
        wall.remove();
        return;
      }
      if (hover.object instanceof Wall) {
        hover.object.setActive(false);
        hover.object.remove();
        this.scene.events.emit("Walls Updated");
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
      case "HalfWall":
        if (!wall) new Wall(this.scene, "half-wall", row, col);
        break;
      case "Wall":
        if (!wall) new Wall(this.scene, "wall", row, col);
        break;
      case "BigWall":
        if (!wall) new Wall(this.scene, "big-wall", row, col);
        break;
      case "Ramp":
        {
          const { allRamps } = this.scene;

          let placeRow = row;
          let placeCol = col;
          let floorPlacement = 0;
          if (hover.object instanceof Wall) {
            floorPlacement = Math.max(...hover.object.collidesOn) + 1;
            placeRow = hover.object.row;
            placeCol = hover.object.col;
          }
          //TODO also check second tile
          if (allRamps[floorPlacement].has(position)) return;

          new Ramp(
            this.scene,
            this.currentRotation,
            placeRow,
            placeCol,
            floorPlacement
          );
        }
        break;
      case "Crate":
        {
          if (player.row === row && player.col === col) return;
          let floorPlacement = 0;
          let placeRow = row;
          let placeCol = col;
          if (hover.object) {
            if (
              hover.object instanceof Crate &&
              hover.object.floor <= this.scene.maxFloor &&
              !hover.object.adjacentCrates.above
            ) {
              floorPlacement += hover.object.floor + 1;
              placeRow = hover.object.row;
              placeCol = hover.object.col;
            }
            if (hover.object instanceof Wall) {
              floorPlacement = Math.max(...hover.object.collidesOn) + 1;
              placeRow = hover.object.row;
              placeCol = hover.object.col;
            }

            if (hover.object instanceof Crate) {
              if (this.buttons.shift) {
                hover.object.connectShape();
                return;
              }
            }
          }
          if (!placeByClicking) return;
          new Crate(
            this.scene as MainScene,
            "Wood",
            { row: 0, col: 0 },
            placeRow,
            placeCol,
            floorPlacement,
            placeCol * cellWidth,
            placeRow * cellHeight,
            this.buttons.shift //Hold CMD to connect blocks
          );
        }
        break;
      case "Metal Crate":
        {
          if (player.row === row && player.col === col) return;
          let floorPlacement = 0;
          let placeRow = row;
          let placeCol = col;
          if (hover.object) {
            if (
              hover.object instanceof Crate &&
              hover.object.floor <= this.scene.maxFloor &&
              !hover.object.adjacentCrates.above
            ) {
              floorPlacement += hover.object.floor + 1;
              placeRow = hover.object.row;
              placeCol = hover.object.col;
            }
            if (hover.object instanceof Wall) {
              floorPlacement = Math.max(...hover.object.collidesOn) + 1;
              placeRow = hover.object.row;
              placeCol = hover.object.col;
            }

            if (hover.object instanceof Crate) {
              if (this.buttons.shift) {
                hover.object.connectShape();
                return;
              }
            }
          }
          if (!placeByClicking) return;
          new Crate(
            this.scene as MainScene,
            "Metal",
            { row: 1, col: 0 },
            placeRow,
            placeCol,
            floorPlacement,
            placeCol * cellWidth,
            placeRow * cellHeight,
            this.buttons.shift //Hold CMD to connect blocks
          );
        }
        break;
      case "Water":
        {
          if (!placeByClicking) return;
          const initialWaterLevel = 13;
          new Flow(this.scene, row, col, 0, initialWaterLevel);
        }
        break;
      case "Drain":
        if (!placeByClicking) return;
        new Drain(this.scene, row, col);
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
    const { floor } = tilemap;

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
            // tilemap.placeWall(col, row);
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
      // const wall = walls.getTileAt(tile.col, tile.row);
      // if (type === "Clear" && !wall) continue;
      // if (type !== "Clear" && wall) continue;
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
              // tilemap.placeWall(tile.col, tile.row);
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
