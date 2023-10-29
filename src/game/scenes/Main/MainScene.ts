import Phaser from "phaser";
import { Player } from "../../entities/Player/player";
import Start from "../../entities/Player/start-tile";
import Letter from "../../entities/Letter/letter";
import Wall from "../../entities/Wall/wall";
import preload from "./methods/preload";
import create from "./methods/create";
import BasicTilemap from "../../entities/Tilemap/tilemap";
import Dictionary from "../../entities/dictionary";
import LoadingScene from "../Loading/LoadingScene";
import updateViewport from "./methods/update-viewport";
import Flag from "../../entities/Flag/Flag";
import { CELL_HEIGHT, CELL_WIDTH } from "./constants";

export default class MainScene extends Phaser.Scene {
  hasLoaded = false;
  deadzoneRect!: Phaser.GameObjects.Rectangle;
  deadZoneNudge = { y: 0, x: 0 };
  tilemap!: BasicTilemap;
  loadingScene!: LoadingScene;
  loadingMessage = "";
  procedure = {
    letterDensity: 4,
    wallDensity: 12,
    distribution: { wildcards: 60, questionMarks: 100 },
  };
  resetAll = false;
  rowCount = 75;
  colCount = 125;
  flags: { a: Flag | null; b: Flag | null; c: Flag | null } = {
    a: null,
    b: null,
    c: null,
  };
  viewport = {
    startRow: 0,
    startCol: 0,
    visibleCols: 0,
    visibleRows: 0,
  };
  start!: Start;
  player!: Player;
  allLetters = new Map<string, Letter>();
  allWalls: Map<string, Wall> = new Map();
  stateText!: Phaser.GameObjects.Text;
  frameCounter = 0;

  hover: {
    row: number;
    col: number;
    x: number;
    y: number;
  } = { row: -1, col: -1, x: -1, y: -1 };
  //External Methods
  dictionary = new Dictionary();
  minWordLength = 3;
  preload = preload;
  create = create;
  updateViewport = updateViewport;
  language!: "Dutch" | "English";
  letterPool: string[] = [];
  constructor() {
    super({ key: "Main" });
  }

  update(time: number, delta: number) {
    const camera = this.cameras.main;
    this.frameCounter++;
    if (this.frameCounter % 60 === 0) {
      this.frameCounter = 0;
    }

    camera.setFollowOffset(this.deadZoneNudge.x, this.deadZoneNudge.y);
    camera.deadzone?.setSize(
      camera.worldView.width * 0.3,
      camera.worldView.height * 0.25
    );
    if (this.deadzoneRect && camera.deadzone) {
      this.deadzoneRect.x = camera.deadzone.x + camera.deadzone.width / 2;
      this.deadzoneRect.y = camera.deadzone.y + camera.deadzone.height / 2;
      this.deadzoneRect.width = camera.deadzone.width;
      this.deadzoneRect.height = camera.deadzone.height;
      this.deadzoneRect.setDepth(2000);
      this.deadzoneRect.setOrigin(0.5);
    }

    if (!this.player.inMovement) {
      if (this.deadZoneNudge.x > 0) this.deadZoneNudge.x -= 4;
      if (this.deadZoneNudge.y > 0) this.deadZoneNudge.y -= 4;
      if (this.deadZoneNudge.x < 0) this.deadZoneNudge.x += 4;
      if (this.deadZoneNudge.y < 0) this.deadZoneNudge.y += 4;
    }

    camera.on("followupdate", this.updateViewport, this);

    // this.cameras.main.on("followupdate", this.updateViewport, this);

    this.player.update();
    this.tweens.update();

    this.stateText?.destroy();
    this.stateText = this.add.text(
      camera.worldView.right - CELL_WIDTH * 15,
      camera.worldView.bottom - CELL_HEIGHT,
      `${this.player.moving.map((direction) => direction)}`
    );
    this.stateText.setDepth(200);
  }
}
