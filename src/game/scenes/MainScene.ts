import Phaser from "phaser";
import { Player } from "../entities/Player/player";
import Portal from "../entities/portal";

import Crate from "../entities/Crate/crate";
import Wall from "../entities/wall";
import Ramp from "../entities/ramp";
import Flow from "../entities/WaterFlow/Flow";
import Water from "../entities/Water/water";

import Editor from "../entities/editor";

import tilesetFloor from "../assets/images/tilesets/floor.png";

import spritesheetPlayer from "../assets/images/spritesheets/player-base.png";

// import spritesheetCrates from "../assets/images/spritesheets/crates-36.png";
import spritesheetCrates from "../assets/images/spritesheets/crates-40.png";
// import spritesheetCrates from "../assets/images/spritesheets/crates-48.png";

import spritesheetHalfWall from "../assets/images/spritesheets/walls-40.png";
import spritesheetWall from "../assets/images/spritesheets/walls-56.png";
import spritesheetBigWall from "../assets/images/spritesheets/walls-72.png";

import spritesheetWater from "../assets/images/spritesheets/water.png";

import imageRampHorizontal from "../assets/images/spritesheets/ramp-h.png";
import imageRampVertical from "../assets/images/spritesheets/ramp-v.png";
import imageGrate from "../assets/images/grate.png";

import spritesheetExplosion from "../assets/images/spritesheets/explosion.png";
import spritesheetCracks from "../assets/images/spritesheets/wallcrack.png";
import spritesheetOil from "../assets/images/spritesheets/oil.png";

import imageCornerpiece from "../assets/images/cornerpiece.png";
import imageEntrance from "../assets/images/entrance.png";
import imageSpikes from "../assets/images/spikes.png";
import imageBubble from "../assets/images/bubble.png";

import Laser from "../entities/Laser/laser";
import sfxFireBlue from "../assets/audio/fire-blue.wav";
import sfxFireOrange from "../assets/audio/fire-orange.wav";
import sfxRemover from "../assets/audio/remover.wav";
import sfxEditMode from "../assets/audio/editor-mode.wav";
import sfxSplat from "../assets/audio/splat.wav";

import BasicTilemap from "../entities/tilemap/tilemap";
import Cursor from "../entities/cursor";

export default class MainScene extends Phaser.Scene {
  grid!: Phaser.GameObjects.Grid;
  resetAll = false;
  cursor!: Cursor;
  rowCount = 200;
  colCount = 200;
  cellWidth = 32;
  cellHeight = 24;
  floorHeight = 16;
  maxFloor = 8;
  shadowOffset = { x: 0, y: 16 };
  player!: Player;
  pirates = [];
  gameState: { crates: string } = { crates: "" };

  // originalStateTracker: { crates: Array<Map<string, Crate>> };
  allCrates: Array<Map<string, Crate>> = Array.from(
    { length: this.maxFloor },
    () => new Map<string, Crate>()
  ); //Each index of the array represents a floor.
  allWalls: Map<string, Wall> = new Map();
  allRamps: Array<Map<string, Ramp>> = Array.from(
    { length: this.maxFloor },
    () => new Map<string, Ramp>()
  ); //Each index of the array represents a floor.

  //Water
  allWaterFlows: Array<Map<string, Flow>> = Array.from(
    { length: this.maxFloor },
    () => new Map<string, Flow>()
  ); //Each index of the array represents a floor.
  allWater: Array<Map<string, Water>> = Array.from(
    { length: this.maxFloor },
    () => new Map<string, Water>()
  ); //Each index of the array represents a floor.

  allLasers: Map<string, Laser> = new Map();
  allObjects: Map<string, Crate> = new Map();
  buttons = {
    pointerDown: false,
    meta: false,
    shift: false,
    rotate: false,
    fill: false,
  };
  prevHover = { row: 0, col: 0 };
  hover: {
    row: number;
    col: number;
    floor: number;
    x: number;
    y: number;
    object: Wall | Crate | Ramp | null;
  } = { row: -1, col: -1, floor: 0, x: -1, y: -1, object: null };
  editor!: Editor;
  portals!: {
    a: Portal | null;
    b: Portal | null;
  };
  debugTrigger = false;
  stateText!: Phaser.GameObjects.Text;
  frameCounter = 0;
  baseLayer!: Phaser.Tilemaps.TilemapLayer | null;
  tilemap!: BasicTilemap;
  gameZoomLevel = 2;
  constructor() {
    super({ key: "SceneA" });
  }

  preload() {
    const { cellWidth, cellHeight } = this;

    this.load.audio("portal-a", sfxFireBlue);
    this.load.audio("portal-b", sfxFireOrange);
    this.load.audio("remover", sfxRemover);
    this.load.audio("edit-mode", sfxEditMode);
    this.load.audio("splat", sfxSplat);

    this.load.image("cornerpiece", imageCornerpiece);
    this.load.image("entrance", imageEntrance);
    this.load.image("spikes", imageSpikes);
    this.load.image("bubble", imageBubble);
    this.load.image("grate", imageGrate);

    //Tilesets
    this.load.spritesheet("floor-tileset", tilesetFloor, {
      frameWidth: cellWidth,
      frameHeight: cellWidth,
    });

    //Spritsheets
    this.load.spritesheet("crates", spritesheetCrates, {
      frameWidth: 32,
      frameHeight: 40,
    });
    this.load.spritesheet("ramp-horizontal", imageRampHorizontal, {
      frameWidth: 64,
      frameHeight: 40,
    });
    this.load.spritesheet("ramp-vertical", imageRampVertical, {
      frameWidth: 32,
      frameHeight: 64,
    });

    this.load.spritesheet("half-wall", spritesheetHalfWall, {
      frameWidth: 32,
      frameHeight: 40,
    });
    this.load.spritesheet("wall", spritesheetWall, {
      frameWidth: 32,
      frameHeight: 56,
    });
    this.load.spritesheet("big-wall", spritesheetBigWall, {
      frameWidth: 32,
      frameHeight: 72,
    });

    this.load.spritesheet("water", spritesheetWater, {
      frameWidth: 32,
      frameHeight: 24,
    });

    this.load.spritesheet("player", spritesheetPlayer, {
      frameWidth: 32,
      frameHeight: 48,
    });

    this.load.spritesheet("explosion", spritesheetExplosion, {
      frameWidth: cellWidth,
      frameHeight: cellHeight,
    });
    this.load.spritesheet("cracks", spritesheetCracks, {
      frameWidth: cellWidth,
      frameHeight: cellHeight,
    });
    this.load.spritesheet("oil", spritesheetOil, {
      frameWidth: cellHeight,
      frameHeight: cellHeight,
    });
  }

  create() {
    //TODO - Full blown local storage function
    //Eventually, we can turn these into JSON files and create levels / arenas
    // const storedCrates = localStorage.getItem("crates");
    // if (storedCrates) {
    //   for (const storedCrate of JSON.parse(storedCrates)) {
    //     const { crateType, frame, row, col, x, y, connectBlocks } =
    //       JSON.parse(storedCrate);
    //     const crate = new Crate(
    //       this,
    //       crateType,
    //       frame,
    //       row,
    //       col,
    //       x,
    //       y,
    //       connectBlocks
    //     );

    //     this.originalStateTracker.crates.set(`${row},${col}`, crate);
    //   }
    // }

    const worldWidth = this.colCount * this.cellWidth;
    const worldHeight = this.rowCount * this.cellHeight;

    //Audio
    this.sound.add("portal-a");
    this.sound.add("portal-b");
    this.sound.add("remover");
    this.sound.add("edit-mode");
    this.sound.add("splat");

    this.portals = { a: null, b: null };

    const playerX = (this.colCount / 2) * this.cellWidth + this.cellWidth / 2;
    const playerY = (this.rowCount / 2) * this.cellHeight + this.cellHeight / 2;
    this.player = new Player(this, playerX, playerY);
    const camera = this.cameras.main;

    camera.setBounds(0, 0, worldWidth, worldHeight);
    camera.zoom = this.gameZoomLevel;

    // camera.setDeadzone(camera.worldView.width / camera.zoom, camera.worldView.height / camera.zoom);
    camera.startFollow(this.player, true, 0.1, 0.1);
    camera.roundPixels = true;
    camera.centerOn(this.player.x, this.player.y);
    this.editor = new Editor(this, camera, this.buttons, this.player);

    this.tilemap = new BasicTilemap(this);

    const tile = this.baseLayer?.getTileAt(8, 5);
    if (tile) console.log(tile);

    //ANCHOR Custom events
    this.events.on(
      "Player Moving",
      (message: string) => {
        console.log(message);
      },
      this
    );

    //ANCHOR Mouse events
    this.input.mouse?.disableContextMenu();

    this.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
      this.hover.x = pointer.worldX;
      this.hover.y = pointer.worldY;
      const hoverObj = this.hover.object;

      if (hoverObj instanceof Crate) {
        const pos = `${hoverObj.row},${hoverObj.col}`;
        if (!this.allCrates[hoverObj.floor].has(pos)) this.hover.object = null;
      }

      //If pointing at floortiles
      const row = Math.floor(pointer.worldY / this.cellHeight);
      const col = Math.floor(pointer.worldX / this.cellWidth);

      this.hover.row = row;
      this.hover.col = col;
      this.hover.floor = 0;
    });

    this.events.on("Pointing at", (object: Wall | Crate | Ramp) => {
      this.hover.object = object;
    });

    this.input.on("pointerup", () => {
      this.buttons.pointerDown = false;
    });
    this.input.on("pointerdown", () => {
      this.buttons.pointerDown = true;
    });

    this.input.on("wheel", (pointer: Phaser.Input.Pointer) => {
      if (pointer.deltaY > 0) {
        if (this.gameZoomLevel < 5) {
          this.gameZoomLevel += 1;
          camera.zoom = this.gameZoomLevel;
          camera.centerOn(this.player.x, this.player.y);
        }
      } else if (pointer.deltaY < 0) {
        if (this.gameZoomLevel > 1) {
          this.gameZoomLevel -= 1;
          camera.zoom = this.gameZoomLevel;
          camera.centerOn(this.player.x, this.player.y);
        }
      }
    });

    //ANCHOR Keyboard events
    this.input.keyboard?.on("keydown", (event: KeyboardEvent) => {
      switch (event.key) {
        case "]":
          if (this.editor.enabled) {
            //PLAY

            //Make copies
            //TODO Function

            // const crateStorage = [];

            // this.originalStateTracker.crates = [];

            // for (const floor of this.allCrates){
            //   this.originalStateTracker.crates.push(floor);
            //   for (const [pos, crate] of floor) {
            //     this.originalStateTracker.crates.set(pos, crate);
            //     crateStorage.push(crate.stringValue);
            //   }
            // }

            // this.gameState.crates = JSON.stringify(crateStorage);
            // localStorage.setItem("crates", this.gameState.crates);

            this.editor.disable();
            this.player.state = "Idle";
            this.sound.play("edit-mode");
            this.scene.stop("Editor-Panel");
            this.buttons.meta = false;
            this.buttons.shift = false;
            this.buttons.fill = false;
            camera.zoom = this.gameZoomLevel;
          } else if (!this.editor.enabled) {
            //EDIT
            // this.resetAll = true;
            this.editor.enable();
            this.player.state = "Editing";
            this.scene.launch("Editor-Panel", this);
            this.sound.play("edit-mode");
          }
          break;
        case "Meta":
          this.buttons.meta = true;
          break;
        case "Shift":
          this.buttons.shift = true;
          break;
        case "r":
          this.buttons.rotate = true;
          break;
        case "f":
          this.buttons.fill = !this.buttons.fill;
          break;
        case "/":
          this.debugTrigger = true;
          break;
        case "c":
          localStorage.setItem("crates", "");
          break;
        case "=":
          if (this.scale.isFullscreen) {
            this.scale.stopFullscreen();
            // On stop fulll screen
          } else {
            this.scale.startFullscreen();
            // On start fulll screen
          }
          break;
      }
      if (this.editor.enabled) {
        this.editor.setScreenBorder();
      }
    });
    this.input.keyboard?.on("keyup", (event: KeyboardEvent) => {
      switch (event.key) {
        case "Meta":
          this.buttons.meta = false;
          break;
        case "Shift":
          this.buttons.shift = false;
          break;
        case "r":
          this.buttons.rotate = false;
      }
      if (this.editor.enabled) {
        this.editor.setScreenBorder();
      }
    });
  }

  update(time: number, delta: number) {
    const camera = this.cameras.main;

    this.frameCounter++;
    if (this.frameCounter % 60 === 0) {
      this.frameCounter = 0;
    }

    // if (this.frameCounter % 20 === 0) {
    this.allWaterFlows.forEach((floor) => {
      for (const [pos, flow] of floor) {
        flow.update();
      }
    });
    // }

    for (const [, laser] of this.allLasers) {
      if (laser && laser.valid) laser.update();
    }

    if (this.resetAll) {
      //Returns all crates to their original states, as stored in the startState object
      //   this.allCrates = [];
      //   for (const floor of this.originalStateTracker.crates) {
      //     this.allCrates.push(floor);
      //   }
      //   for (const [pos, crate] of this.originalStateTracker.crates) {
      //     const resetPos = `${crate.origin.row},${crate.origin.col}`;
      //     this.allCrates.set(resetPos, crate);
      //   }
      // }
    }

    for (const floor of this.allCrates) {
      for (const [, crate] of floor) {
        if (crate) crate.update();
      }
    }

    this.player.update();

    this.stateText?.destroy();
    // this.stateText = this.add.text(
    //   camera.worldView.right - this.cellWidth * 10,
    //   camera.worldView.top + this.cellHeight,
    //   `Row: ${this.hover.row}, Col:${this.hover.col}, Floor:${
    //     this.hover.floor
    //   }${this.hover.object ? `, ${this.hover.object.name}` : ""}`,
    //   { fontSize: "12px" }
    // );

    this.stateText = this.add.text(
      camera.worldView.right - this.cellWidth * 10,
      camera.worldView.top + this.cellHeight,
      `Row: ${this.hover.row}, Col:${this.hover.col}, Floor:${
        this.hover.floor
      }${this.hover.object ? `, ${this.hover.object.name}` : ""}`,
      { fontSize: "12px" }
    );

    if (this.debugTrigger) {
      this.debugTrigger = false;
      console.log(this.tweens.getTweens());
      this.children
        .getAll()
        .filter((obj) => obj.active)
        .forEach((obj) => console.log(obj.name));
    }
    if (this.resetAll) this.resetAll = false;
  }
}
