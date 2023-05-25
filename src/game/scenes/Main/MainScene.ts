import Phaser from "phaser";
import { Player } from "../../entities/Player/player";
import Portal from "../../entities/portal";

import Crate from "../../entities/Crate/crate";
import Wall from "../../entities/wall";
import Ramp from "../../entities/ramp";
import Flow from "../../entities/WaterFlow/Flow";
import Water from "../../entities/Water/water";
import { HoverTarget } from "../../types";
import preload from "./methods/preload";

import Laser from "../../entities/Laser/laser";
import BasicTilemap from "../../entities/tilemap/tilemap";

export default class MainScene extends Phaser.Scene {
  mode: "Play" | "Create" = "Play";
  grid!: Phaser.GameObjects.Grid;
  resetAll = false;
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
  hover: {
    row: number;
    col: number;
    floor: number;
    x: number;
    y: number;
    object: HoverTarget | null;
  } = { row: -1, col: -1, floor: 0, x: -1, y: -1, object: null };
  constructor() {
    super({ key: "SceneA" });
  }

  preload() {
    preload(this);
  }

  create() {
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

    this.tilemap = new BasicTilemap(this);

    const tile = this.baseLayer?.getTileAt(8, 5);
    if (tile) console.log(tile);

    //ANCHOR Pointer events
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
      this.hover.floor = hoverObj ? hoverObj.floor : 0;
    });

    //TODO Move to editor?
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
          if (this.mode === "Create") {
            this.mode = "Play";
            this.sound.play("create-off");
            this.player.state = "Idle";
            this.player.z = 0;
            this.player.floor = 0;
            camera.zoom = this.gameZoomLevel;
          } else if (this.mode === "Play") {
            this.mode = "Create";
            this.player.state = "Editing";
            this.scene.launch("Editor", this);
          }
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
    });
  }

  update(time: number, delta: number) {
    const camera = this.cameras.main;

    this.frameCounter++;
    if (this.frameCounter % 60 === 0) {
      this.frameCounter = 0;
    }

    this.allWaterFlows.forEach((floor) => {
      for (const [pos, flow] of floor) {
        flow.update();
      }
    });

    for (const [, laser] of this.allLasers) {
      if (laser && laser.valid) laser.update();
    }

    for (const floor of this.allCrates) {
      for (const [, crate] of floor) {
        if (crate) crate.update();
      }
    }

    this.player.update();

    this.stateText?.destroy();
    if (this.mode === "Create") return;
    // this.stateText = this.add.text(
    //   camera.worldView.right - this.cellWidth * 10,
    //   camera.worldView.top + this.cellHeight,
    //   `Row: ${this.hover.row}, Col:${this.hover.col}, Floor:${
    //     this.hover.floor
    //   }${this.hover.object ? `, ${this.hover.object.name}` : ""}`,
    //   { fontSize: "12px" }
    // );

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
