import Phaser from "phaser";
import { Player } from "../entities/Player/player";
import Portal from "../entities/portal";
import Explosion from "../entities/explosion";
import Crate from "../entities/Crate/crate";

import Editor from "../entities/editor";

import tilesetFloor from "../assets/images/tilesets/floor.png";
import tilesetWalls from "../assets/images/tilesets/walls.png";

import spritesheetPlayer from "../assets/images/spritesheets/player.png";
import spritesheetCrates from "../assets/images/spritesheets/crates.png";
import spritesheetExplosion from "../assets/images/spritesheets/explosion.png";
import spritesheetCracks from "../assets/images/spritesheets/wallcrack.png";

import imageCornerpiece from "../assets/images/cornerpiece.png";

import cursor from "../assets/images/bigger-cursor.png";

import { randomPosition } from "../utils/opposite";

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
  cursor!: Cursor;
  rowCount = 100;
  colCount = 100;
  cellSize = 32;
  player!: Player;
  allCrates: Map<string, Crate> = new Map();
  allLasers: Map<string, Laser> = new Map();
  buttons = {
    pointerDown: false,
    meta: false,
    shift: false,
    rotate: false,
    fill: false,
  };
  prevHover = { row: 0, col: 0 };
  hover = { row: 0, col: 0, x: 0, y: 0 };
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
    this.load.audio("portal-a", sfxFireBlue);
    this.load.audio("portal-b", sfxFireOrange);
    this.load.audio("remover", sfxRemover);
    this.load.audio("edit-mode", sfxEditMode);
    this.load.audio("splat", sfxSplat);

    this.load.image("cornerpiece", imageCornerpiece);

    this.load.spritesheet("cursor", cursor, {
      frameWidth: 38,
      frameHeight: 38,
    });

    //Tilesets
    this.load.spritesheet("floor-tileset", tilesetFloor, {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet("wall-tileset", tilesetWalls, {
      frameWidth: 32,
      frameHeight: 32,
    });

    //Spritsheets
    this.load.spritesheet("crates", spritesheetCrates, {
      frameWidth: 32,
      frameHeight: 32,
    });

    this.load.spritesheet("player", spritesheetPlayer, {
      frameWidth: 32,
      frameHeight: 32,
    });

    this.load.spritesheet("explosion", spritesheetExplosion, {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet("cracks", spritesheetCracks, {
      frameWidth: 32,
      frameHeight: 32,
    });
  }

  create() {
    const canvasWidth = Number(this.game.config.width);
    const canvasHeight = Number(this.game.config.height);
    const worldWidth = this.colCount * this.cellSize;
    const worldHeight = this.rowCount * this.cellSize;

    this.cursor = new Cursor(
      this,
      this.hover.col * this.cellSize + this.cellSize / 2,
      this.hover.row * this.cellSize + this.cellSize / 2,
      this.hover.row,
      this.hover.col
    );
    // this.game.canvas.style.cursor = "none";

    //Audio
    this.sound.add("portal-a");
    this.sound.add("portal-b");
    this.sound.add("remover");
    this.sound.add("edit-mode");
    this.sound.add("splat");

    this.portals = { a: null, b: null };

    const { x: playerX, y: playerY } = randomPosition(
      this.rowCount,
      this.colCount,
      this.cellSize
    );
    this.player = new Player(this, playerX, playerY);
    const camera = this.cameras.main;

    camera.setBounds(0, 0, worldWidth, worldHeight);
    camera.zoom = this.gameZoomLevel;
    camera.setDeadzone(
      (canvasWidth * 0.5) / camera.zoom,
      (canvasHeight * 0.5) / camera.zoom
    );
    camera.startFollow(this.player, true, 0.1, 0.1);
    camera.roundPixels = true;
    camera.centerOn(this.player.x, this.player.y);
    this.editor = new Editor(this, camera, this.buttons, this.player);

    this.tilemap = new BasicTilemap(this);

    const tile = this.baseLayer?.getTileAt(8, 5);
    if (tile) console.log(tile);

    //ANCHOR Mouse events
    this.input.mouse?.disableContextMenu();
    this.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
      const row = Math.floor(pointer.worldY / this.cellSize);
      const col = Math.floor(pointer.worldX / this.cellSize);

      this.hover.row = row;
      this.hover.col = col;
      this.hover.x = pointer.worldX;
      this.hover.y = pointer.worldY;
    });
    this.input.on("pointerup", () => {
      this.buttons.pointerDown = false;
    });
    this.input.on("pointerdown", () => {
      this.buttons.pointerDown = true;
    });

    //ANCHOR Keyboard events
    this.input.keyboard?.on("keydown", (event: KeyboardEvent) => {
      switch (event.key) {
        case "]":
          if (this.editor.enabled) {
            //PLAY
            this.editor.disable();
            this.player.state = "Idle";
            this.sound.play("edit-mode");
            this.scene.stop("Editor-Panel");
            this.cursor.setVisible(false);
            this.buttons.meta = false;
            this.buttons.shift = false;
            this.buttons.fill = false;
            camera.zoom = this.gameZoomLevel;
          } else if (!this.editor.enabled) {
            //EDIT
            this.editor.enable();
            this.player.state = "Editing";
            this.scene.launch("Editor-Panel", this);
            this.sound.play("edit-mode");
            this.cursor.setVisible(true);
            this.cursor.update();
          }
          break;
        case "Meta":
          this.buttons.meta = true;
          break;
        case "Shift":
          this.buttons.shift = true;
          break;
        case "r":
          this.buttons.rotate = !this.buttons.rotate;
          break;
        case "f":
          this.buttons.fill = !this.buttons.fill;
          break;
        case "/":
          this.debugTrigger = true;
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
      }
      if (this.editor.enabled) {
        this.editor.setScreenBorder();
      }
    });
  }

  update(time: number, delta: number) {
    this.frameCounter++;
    if (this.frameCounter % 60 === 0) {
      this.frameCounter = 0;
    }

    if (this.allLasers.size > 0) {
      for (const [pos, laser] of this.allLasers) {
        if (laser && laser.valid) laser.update();
      }
    }

    if (this.allCrates.size > 0) {
      for (const [pos, crate] of this.allCrates) {
        if (crate) crate.update();
      }
    }

    this.player.update();

    this.stateText?.destroy();
    this.stateText = this.add.text(
      this.cameras.main.worldView.left + this.colCount * this.cellSize - 75,
      this.cameras.main.worldView.top + this.cellSize,
      `${this.player.state}`,
      { fontSize: "12px" }
    );
    this.stateText.setDepth(200);

    if (this.debugTrigger) {
      this.debugTrigger = false;
      console.log(this.tweens.getTweens());
      this.children
        .getAll()
        .filter((obj) => obj.active)
        .forEach((obj) => console.log(obj.name));
    }
  }
}
