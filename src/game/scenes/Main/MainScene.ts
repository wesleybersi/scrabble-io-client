import Phaser from "phaser";
import { Player } from "../../entities/Player/player";
import Start from "../../entities/Player/start-tile";
import Tile from "../../entities/Tile/letter";
import Wall from "../../entities/Wall/wall";
import preload from "./methods/preload";
import create from "./methods/create";
import BasicTilemap from "../../entities/Tilemap/tilemap";
import LoadingScene from "../Loading/LoadingScene";
import Flag from "../../entities/Flag/Flag";
import { Socket } from "socket.io-client";
import { Direction } from "../../types";
import { oneIn, randomNum } from "../../utils/helper-functions";
import GoTo from "../../entities/GoTo/GoTo";
import { INITIAL_RESPAWN_COUNTER } from "./constants";
import Movement from "../../entities/Movement/Movement";
import Pointer from "../../entities/Pointer/Pointer";
import { Arrows } from "../../entities/Arrows/Arrows";

export default class MainScene extends Phaser.Scene {
  socket!: Socket;
  socketID!: string;
  hasLoaded = false;
  deadzoneRect!: Phaser.GameObjects.Rectangle;
  deadZoneNudge = { y: 0, x: 0 };
  tilemap!: BasicTilemap;
  loadingScene!: LoadingScene;
  loadingMessage = "";
  resetAll = false;

  rowCount!: number;
  colCount!: number;
  isBot = false;
  respawnCounter = INITIAL_RESPAWN_COUNTER;

  pointer = {
    x: 0,
    y: 0,
    isHolding: false,
  };
  arrows?: Arrows;

  goto?: GoTo;
  pointerMovement: {
    from: { row: number; col: number; graphic: Movement } | null;
    to: { row: number; col: number; graphic: Movement } | null;
  } | null = null;
  heldTile: Tile | null = null;
  selectedTile: Tile | null = null;

  hoverTile: Tile | null = null;

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

  //Controls
  buttons = { shift: false, r: false };
  cursors: Direction[] = [];
  isMoving = false;
  isMouseControls = false;

  //Players
  start!: Start;
  player!: Player;
  playersByID = new Map<string, Player>();
  pointersByID = new Map<string, Pointer>();

  //Tiles
  tilesByPosition = new Map<string, Tile>();
  tilesByID = new Map<string, Tile>();

  //Words
  // words = new Map<string, Tile>();

  //Walls
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
  minWordLength = 3;
  preload = preload;
  create = create;
  letterPool: string[] = [];
  constructor() {
    super({ key: "Main" });
  }
  hasWall(row: number, col: number) {
    const wall = this.allWalls.get(`${row},${col}`);
    if (wall) return true;
    else return false;
  }
  hasWallInDirection(direction: Direction, row: number, col: number) {
    if (direction === "up") row--;
    else if (direction === "down") row++;
    else if (direction === "left") col--;
    else if (direction === "right") col++;

    const wall = this.allWalls.get(`${row},${col}`);
    if (wall) return true;
    else return false;
  }

  update(time: number, delta: number) {
    if (!this.hasLoaded) return;
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

    if (!this.isMoving) {
      if (this.deadZoneNudge.x > 0) this.deadZoneNudge.x -= 4;
      if (this.deadZoneNudge.y > 0) this.deadZoneNudge.y -= 4;
      if (this.deadZoneNudge.x < 0) this.deadZoneNudge.x += 4;
      if (this.deadZoneNudge.y < 0) this.deadZoneNudge.y += 4;
    }

    if (
      this.goto &&
      this.isMouseControls &&
      (this.goto.row !== this.player.row ||
        this.goto.col !== this.player.col) &&
      !this.isMoving
    ) {
      const chooseRows =
        Math.abs(this.goto.row - this.player.row) >
        Math.abs(this.goto.col - this.player.col);

      if (chooseRows) {
        if (this.goto.row < this.player.row) {
          if (this.hasWallInDirection("up", this.player.row, this.player.col)) {
            if (oneIn(2)) {
              this.socket.emit("Move Request", "right");
            } else {
              this.socket.emit("Move Request", "left");
            }
          } else {
            this.socket.emit("Move Request", "up");
          }
        } else if (this.goto.row > this.player.row) {
          if (
            this.hasWallInDirection("down", this.player.row, this.player.col)
          ) {
            if (oneIn(2)) {
              this.socket.emit("Move Request", "right");
            } else {
              this.socket.emit("Move Request", "left");
            }
          } else {
            this.socket.emit("Move Request", "down");
          }
        }
      } else if (!chooseRows) {
        if (this.goto.col > this.player.col) {
          if (
            this.hasWallInDirection("right", this.player.row, this.player.col)
          ) {
            if (oneIn(2)) {
              this.socket.emit("Move Request", "up");
            } else {
              this.socket.emit("Move Request", "down");
            }
          } else {
            this.socket.emit("Move Request", "right");
          }
        } else if (this.goto.col < this.player.col) {
          if (
            this.hasWallInDirection("left", this.player.row, this.player.col)
          ) {
            if (oneIn(2)) {
              this.socket.emit("Move Request", "up");
            } else {
              this.socket.emit("Move Request", "down");
            }
          } else {
            this.socket.emit("Move Request", "left");
          }
        }
      }
    }
    if (
      this.goto?.row === this.player.row &&
      this.goto?.col === this.player.col
    ) {
      this.goto.remove();
    }

    if (this.isBot && oneIn(5)) {
      const inputs = ["left", "right", "up", "down"];
      if (!this.isMoving) {
        const input = inputs[randomNum(inputs.length)];
        if (
          this.hasWallInDirection(
            input as Direction,
            this.player.row,
            this.player.col
          )
        )
          return;
        this.socket.emit("Move Request", input);
      }
    }

    if (this.buttons.r) {
      this.respawnCounter--;
      if (this.respawnCounter === 0) {
        this.respawnCounter = INITIAL_RESPAWN_COUNTER;
        this.buttons.r = false;
        this.socket.emit(
          "Position Request",
          randomNum(this.rowCount),
          randomNum(this.colCount)
        );
      }
    }

    // this.stateText?.destroy();
    // this.stateText = this.add.text(
    //   camera.worldView.right - CELL_WIDTH * 15,
    //   camera.worldView.bottom - CELL_HEIGHT,
    //   `${this.goto?.row},${this.goto?.col}`
    // );
    // this.stateText.setDepth(200);
  }
}
