import Phaser from "phaser";
import { Player } from "../../entities/Player/player";
import Portal from "../../entities/portal";
import Start from "../../entities/start-tile";

import Crate from "../../entities/Crate/crate";
import Wall from "../../entities/Wall/wall";
import Ramp from "../../entities/ramp";
import Flow from "../../entities/WaterFlow/Flow";

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
  start!: Start;
  player!: Player;
  pirates = [];
  gameState: { crates: string } = { crates: "" };

  // originalStateTracker: { crates: Array<Map<string, Crate>> };
  allCrates: Array<Map<string, Crate>> = Array.from(
    { length: this.maxFloor },
    () => new Map<string, Crate>()
  );
  allWalls: Array<Map<string, Wall>> = Array.from(
    { length: this.maxFloor },
    () => new Map<string, Wall>()
  ); //Each index of the array represents a floor.

  allRamps: Array<Map<string, Ramp>> = Array.from(
    { length: this.maxFloor },
    () => new Map<string, Ramp>()
  ); //Each index of the array represents a floor.

  allWaterFlows: Array<Map<string, Flow>> = Array.from(
    { length: this.maxFloor },
    () => new Map<string, Flow>()
  );

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
  playZoomLevel = 3;
  editorZoomLevel = 2;
  hover: {
    row: number;
    col: number;
    floor: number;
    x: number;
    y: number;
    object: HoverTarget | null;
  } = { row: -1, col: -1, floor: 0, x: -1, y: -1, object: null };

  //External Methods
  preload = preload;
  constructor() {
    super({ key: "SceneA" });
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

    // Phaser.GameObjects.GameObject.prototype.customMethod = customMethod;

    this.portals = { a: null, b: null };

    const startCol = Math.floor(this.colCount / 2);
    const startRow = Math.floor(this.rowCount / 2);
    const startFloor = 0;
    this.start = new Start(this, startCol, startRow, startFloor);
    this.player = new Player(this);

    const camera = this.cameras.main;

    camera.setBounds(0, 0, worldWidth, worldHeight);
    camera.zoom = this.playZoomLevel;

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

    //ANCHOR Keyboard events
    this.input.keyboard?.on("keydown", (event: KeyboardEvent) => {
      switch (event.key) {
        case "]":
          if (this.mode === "Create") {
            this.mode = "Play";
            this.sound.play("create-off");
            camera.zoom = this.playZoomLevel;
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
        case "PageUp":
        case "PageDown":
          this.allCrates.forEach((floor) => {
            for (const [pos, crate] of floor) {
              if (event.key === "PageDown" && crate.historyIndex <= 0) continue;
              if (
                event.key === "PageUp" &&
                crate.historyIndex >= crate.history.length - 1
              )
                continue;
              const { allIncluded, abort } = crate.prepareMovement(
                crate.history[crate.historyIndex].oppositeDirection
              );

              if (abort) return;

              let weightMultiplier = 1;
              for (const c of allIncluded) {
                if (c.weight > weightMultiplier) weightMultiplier = c.weight;
              }

              const completedTweens = new Set<Crate>();
              const duration = Math.max(
                ((Math.sqrt(allIncluded.size) *
                  this.player.initialMoveDuration) /
                  1.5) *
                  0.5,
                this.player.initialMoveDuration / 1.5
              );
              for (const includedCrate of allIncluded) {
                includedCrate.makeMove(
                  crate.history[crate.historyIndex].oppositeDirection,
                  allIncluded,
                  duration * weightMultiplier,
                  completedTweens,
                  false
                );
              }
              if (event.key === "PageDown" && crate.historyIndex <= 1) return;
              if (
                event.key === "PageUp" &&
                crate.historyIndex >= crate.history.length - 2
              )
                return;
              if (event.key === "PageUp") crate.historyIndex++;
              else if (event.key === "PageDown") crate.historyIndex--;
            }
          });

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
    if (this.mode === "Play") return;
    this.stateText = this.add.text(
      camera.worldView.right - this.cellWidth * 10,
      camera.worldView.bottom - this.cellHeight,
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
