import { MOVE_DURATION } from "./../../../../../../../scrabble-io/src/game/scenes/Main/constants";
import MainScene from "../MainScene.ts";
import { Player } from "../../../entities/Player/player.ts";
import BasicTilemap from "../../../entities/Tilemap/tilemap.ts";
import Tile from "../../../entities/Tile/letter.ts";

import Wall from "../../../entities/Wall/wall.ts";
import Flag from "../../../entities/Flag/Flag.ts";
import {
  CELL_HEIGHT,
  CELL_WIDTH,
  INITIAL_ZOOM,
  MAX_ZOOM,
  MIN_ZOOM,
  ZOOM_FACTOR,
} from "../constants.ts";
import socket from "../../../socket.ts";
import {
  directionToAdjacent,
  generateRandomColor,
  randomNum,
  randomPlaceColor,
} from "../../../utils/helper-functions.ts";
import Start from "../../../entities/Player/start-tile.ts";
import GoTo from "../../../entities/GoTo/GoTo.ts";
import { Direction } from "../../../types.ts";
import Movement from "../../../entities/Movement/Movement.ts";
import { Arrows } from "../../../entities/Arrows/Arrows.ts";
import Pointer from "../../../entities/Pointer/Pointer.ts";

export default function create(this: MainScene) {
  this.socket = socket;

  //ANCHOR Initial user settings
  // this.language = initialSettings.language;

  //ANCHOR Camera

  //ANCHOR Tilemap

  //TODO Move to server
  // const { letterDensity, wallDensity } = this.procedure;

  //Socket server join event
  //1 Receive set of Player data, including
  //DONE 2 Receive set of Wall data
  //2 Receive map of Tile data
  //4 Receive additional data. Time, scores etc...

  socket.emit("Join Game", {
    name: "Anonymous",
    // color: generateRandomColor(),
    color: randomPlaceColor(),
  });

  interface InitialData {
    id: string;
    players: {
      id: string;
      name: string;
      color: number;
      row: number;
      col: number;
    }[];
    grid: {
      rows: number;
      cols: number;
      walls: string[];
      tiles: {
        id: string;
        row: number;
        col: number;
        letter: string;
        value: number;
        color: number;
        isSolved?: boolean;
        isQuestionMark?: boolean;
        top?: boolean;
        bottom?: boolean;
        left?: boolean;
        right?: boolean;
      }[];
      words: {
        word: string;
        tiles: { row: number; col: number };
        formedBy: string;
      }[];
    };
  }

  socket.on("Initial Game Data", (data: InitialData) => {
    const { id, grid, players } = data;
    this.socketID = id;
    this.rowCount = grid.rows;
    this.colCount = grid.cols;
    const worldWidth = this.colCount * CELL_WIDTH;
    const worldHeight = this.rowCount * CELL_HEIGHT;

    //ANCHOR Create tilemap
    this.tilemap = new BasicTilemap(this, grid.rows, grid.cols);

    for (const player of players) {
      const newPlayer = new Player(
        this,
        player.id,
        player.name,
        player.color,
        player.row,
        player.col
      );
      this.playersByID.set(newPlayer.id, newPlayer);
      if (player.id === this.socketID) {
        this.start = new Start(this, player.row, player.col);
        this.player = newPlayer;
      }
    }

    //ANCHOR Create camera / deadzone
    const camera = this.cameras.main;
    camera.setBounds(0, 0, worldWidth, worldHeight);
    camera.zoom = INITIAL_ZOOM;
    camera.centerOn(this.player.x, this.player.y);
    camera.setDeadzone(camera.worldView.width, camera.worldView.height);
    // camera.startFollow(this.player, true);
    camera.setLerp(0.1);
    this.deadzoneRect = this.add.rectangle(
      camera.deadzone?.centerX,
      camera.deadzone?.centerY,
      camera.deadzone?.width,
      camera.deadzone?.height,
      0x222222,
      0
    );
    this.deadzoneRect.setOrigin(0.5, 0.5);

    //ANCHOR Create walls
    for (const pos of grid.walls) {
      const [row, col] = pos.split(",");
      new Wall(this, Number(row), Number(col));
    }

    for (const tile of grid.tiles) {
      new Tile(
        this,
        tile.id,
        tile.row,
        tile.col,
        tile.letter,
        tile.value,
        tile.isSolved,
        tile.color,
        tile.top,
        tile.bottom,
        tile.left,
        tile.right
      );
    }

    this.hasLoaded = true;
  });

  interface NewPlayerData {
    id: string;
    name: string;
    color: number;
    row: number;
    col: number;
  }
  socket.on("Player Joined", (playerData: NewPlayerData) => {
    const { id, name, color, row, col } = playerData;
    if (this.playersByID.has(id)) return;
    this.playersByID.set(
      playerData.id,
      new Player(this, id, name, color, row, col)
    );
  });

  socket.on("Player Left", (playerID: string) => {
    const player = this.playersByID.get(playerID);

    player?.remove();
  });

  // socket.on("New Movement", (movementData: MovementData) => {
  //   console.log("// Movement");
  //   const isClientRequest = movementData.requestID === this.socketID;
  //   const isPullRequest = movementData.isPullRequest ? true : false;
  //   const tileMovement = movementData.movers.filter(
  //     (mover) => mover.type === "tile"
  //   );
  //   const playerMovement = movementData.movers.filter(
  //     (mover) => mover.type === "player"
  //   );
  //   console.log("isClient:", isClientRequest);
  //   console.log("Tiles moving:", tileMovement.length);
  //   console.log("Players moving:", playerMovement.length);

  //   for (const mover of tileMovement) {
  //     const tile = this.tilesByID.get(mover.id);

  //     if (tile) {
  //       tile.move(
  //         { row: mover.target.row, col: mover.target.col },
  //         mover.instant || !tile.isInViewport() ? 0 : movementData.duration
  //       );
  //     }
  //   }

  //   for (const mover of playerMovement) {
  //     if (mover.id === this.socketID && isClientRequest) {
  //       this.isMoving = true;
  //       this.player.move(
  //         {
  //           row: mover.target.row,
  //           col: mover.target.col,
  //         },
  //         mover.instant ? 1 : movementData.duration,
  //         tileMovement.length > 0 || playerMovement.length > 1,
  //         isPullRequest,
  //         (row: number, col: number) => {
  //           this.isMoving = false;
  //           const lastInput = this.cursors[0];
  //           if (lastInput) {
  //             const target = directionToAdjacent(lastInput, row, col);
  //             if (!this.hasWall(target.row, target.col)) {
  //               this.socket.emit(
  //                 "Move Request",
  //                 lastInput,
  //                 this.buttons.shift ? true : undefined
  //               );
  //             }
  //           }
  //         }
  //       );
  //     } else {
  //       const player = this.playersByID.get(mover.id);
  //       if (!player) continue;
  //       const isRequester = player.id === movementData.requestID;

  //       player.move(
  //         {
  //           row: mover.target.row,
  //           col: mover.target.col,
  //         },
  //         mover.instant || !player.isInViewport() ? 1 : movementData.duration,
  //         (isRequester && tileMovement.length > 0) ||
  //           (isRequester && playerMovement.length > 1),
  //         isRequester && isPullRequest
  //       );
  //     }
  //   }

  //   // if (tileMovement.length > 0 && movementData.requestID === this.socketID) {
  //   //   calculateCameraOffset(
  //   //     new Set(),
  //   //     tileSet,
  //   //     movementData.direction,
  //   //     movementData.duration
  //   //   );
  //   // }
  // });

  interface GameFrame {
    players: {
      id: string;
      x: number;
      y: number;
      color: number;
      holding?: { id: string; x: number; y: number };
      hovering?: string; //Tile ID
      scrolling?: boolean;
    }[];
    movingTiles: {
      id: string;
      x: number;
      y: number;
      letter: string;
    }[];
  }

  socket.on("Current Frame", (data: GameFrame) => {
    let isHolding = false;
    for (const {
      id,
      x,
      y,
      color,
      holding,
      hovering,
      scrolling,
    } of data.players) {
      const player = this.pointersByID.get(id);
      if (player) {
        player.update(x, y, holding, hovering ? true : undefined, scrolling);

        if (hovering) {
          const tile = this.tilesByID.get(hovering);
          if (tile) {
            this.hoverTile = tile;
          }
        } else {
          this.hoverTile = null;
        }

        if (holding && player.id === this.socketID) {
          const tile = this.tilesByID.get(holding.id);
          tile?.onHold();
          isHolding = true;
        }
      } else {
        new Pointer(this, id, x, y, color);
      }
    }

    for (const [id, player] of this.pointersByID) {
      const isActive = data.players.find((data) => data.id === id);
      if (!isActive) {
        player.delete();
      }
    }

    for (const { id, x, y, letter } of data.movingTiles) {
      const tile = this.tilesByID.get(id);
      if (!tile) continue;
      console.log(letter);
      // this.tilesByPosition.delete(`${tile.row},${tile.col}`);
      tile.update(x, y, letter);
    }

    if (!isHolding) {
      this.arrows?.destroy();
      delete this.arrows;
    }
  });

  interface MovementData {
    requestID: string;
    movers: Movement[];
    duration: number;
    direction: Direction;
    isPullRequest?: boolean;
  }

  interface Movement {
    type: "player" | "tile";
    id: string;
    target: {
      row: number;
      col: number;
    };
    instant: boolean;
    letter?: string;
  }

  interface WordData {
    value: string;
    solver: string;
    tiles: {
      id: string;
      letter: string;
      solver: string;
      color: number;
      top?: boolean;
      bottom?: boolean;
      right?: boolean;
      left?: boolean;
    }[];
  }

  socket.on("Word Solved", (wordData: WordData) => {
    const { tiles } = wordData;

    for (const tile of tiles) {
      const gridTile = this.tilesByID.get(tile.id);
      if (gridTile) {
        gridTile.letter = tile.letter;
        gridTile.setTint(tile.color);
        if (tile.top) gridTile.connectedTo.top = true;
        if (tile.left) gridTile.connectedTo.left = true;
        if (tile.right) gridTile.connectedTo.right = true;
        if (tile.bottom) gridTile.connectedTo.bottom = true;
        if (!gridTile.isSolved && gridTile.isInViewport()) {
          gridTile.emitSmoke();
        }
        gridTile.isSolved = true;
        gridTile.update(gridTile.x, gridTile.y);
      }
    }
  });

  this.input.keyboard?.on("keydown", (event: KeyboardEvent) => {
    if (!this.hasLoaded || event.repeat) return;
    const { player, socket } = this;
    switch (event.key) {
      case "W":
      case "w":
      case "ArrowUp":
        {
          if (!this.cursors.includes("up")) this.cursors.unshift("up");
          if (this.isMoving || this.hasWall(player.row - 1, player.col)) break;
          const tile = this.tilesByPosition.get(
            `${player.row - 1},${player.col}`
          );
          if (tile?.isMoving) break;
          socket.emit(
            "Move Request",
            "up",
            this.buttons.shift ? true : undefined
          );
        }
        break;
      case "A":
      case "a":
      case "ArrowLeft":
        {
          if (!this.cursors.includes("left")) this.cursors.unshift("left");
          if (this.isMoving || this.hasWall(player.row, player.col - 1)) break;
          const tile = this.tilesByPosition.get(
            `${player.row},${player.col - 1}`
          );
          if (tile?.isMoving) break;

          socket.emit(
            "Move Request",
            "left",
            this.buttons.shift ? true : undefined
          );
        }
        break;
      case "S":
      case "s":
      case "ArrowDown":
        {
          if (!this.cursors.includes("down")) this.cursors.unshift("down");
          if (this.isMoving || this.hasWall(player.row + 1, player.col)) break;
          const tile = this.tilesByPosition.get(
            `${player.row + 1},${player.col}`
          );
          if (tile?.isMoving) break;

          socket.emit(
            "Move Request",
            "down",
            this.buttons.shift ? true : undefined
          );
        }
        break;
      case "D":
      case "d":
      case "ArrowRight":
        {
          if (!this.cursors.includes("right")) this.cursors.unshift("right");
          if (this.isMoving || this.hasWall(player.row, player.col + 1)) break;
          const tile = this.tilesByPosition.get(
            `${player.row},${player.col + 1}`
          );
          if (tile?.isMoving) break;

          socket.emit(
            "Move Request",
            "right",
            this.buttons.shift ? true : undefined
          );
        }
        break;
      case "R":
      case "r":
        this.buttons.r = true;
        break;
      case "b":
        this.isBot = !this.isBot;
        break;
      case "Shift":
        this.buttons.shift = true;
        break;
    }
  });
  this.input.keyboard?.on("keyup", (event: KeyboardEvent) => {
    if (!this.hasLoaded) return;

    switch (event.key) {
      case "W":
      case "w":
      case "ArrowUp":
        this.cursors = this.cursors.filter((direction) => direction !== "up");
        break;
      case "A":
      case "a":
      case "ArrowLeft":
        this.cursors = this.cursors.filter((direction) => direction !== "left");
        break;
      case "S":
      case "s":
      case "ArrowDown":
        this.cursors = this.cursors.filter((direction) => direction !== "down");
        break;
      case "D":
      case "d":
      case "ArrowRight":
        this.cursors = this.cursors.filter(
          (direction) => direction !== "right"
        );
        break;
      case "Shift":
        this.buttons.shift = false;
        break;
      case "R":
      case "r":
        this.buttons.r = false;
        break;
    }
  });

  //ANCHOR Pointer events
  this.input.mouse?.disableContextMenu();
  this.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
    if (!this.hasLoaded) return;

    this.hover.x = Math.floor(pointer.worldX);
    this.hover.y = Math.floor(pointer.worldY);

    if (pointer.rightButtonDown()) {
      const camera = this.cameras.main;
      const deltaX = (pointer.x - pointer.prevPosition.x) / camera.zoom;
      const deltaY = (pointer.y - pointer.prevPosition.y) / camera.zoom;

      // Convert the deltas to the camera's coordinate system
      // const angle = Phaser.Math.DegToRad(this.client.rotation);
      const newDeltaX = deltaX * Math.cos(0) - deltaY * Math.sin(0);
      const newDeltaY = deltaX * Math.sin(0) + deltaY * Math.cos(0);

      // Update the camera position to pan
      camera.scrollX -= newDeltaX;
      camera.scrollY -= newDeltaY;
    }

    this.hover.x = pointer.worldX;
    this.hover.y = pointer.worldY;
    // socket.emit("Position Request", this.hover.row, this.hover.col);
    const row = Math.floor(pointer.worldY / CELL_HEIGHT);
    const col = Math.floor(pointer.worldX / CELL_WIDTH);

    this.hover.row = row;
    this.hover.col = col;

    this.socket.emit("Pointer Move", pointer.worldX, pointer.worldY);

    if (pointer.leftButtonDown()) {
      if (this.hasWall(row, col)) return;

      if (
        this.heldTile &&
        !this.heldTile.isMoving &&
        (this.heldTile.row !== row || this.heldTile.col !== col)
      ) {
        // this.socket.emit("Move Tile Request", this.heldTile.id, { row, col });
        this.events.emit("Clear Arrows");
      }

      // // if (tile) {
      // if (!this.pointerMovement) {
      //   this.pointerMovement = {
      //     from: { row, col, graphic: new Movement(this, row, col) },
      //     to: null,
      //   };
      // } else {
      //   if (
      //     row === this.pointerMovement?.from?.row &&
      //     col === this.pointerMovement?.from?.col
      //   )
      //     return;
      //   if (!this.pointerMovement.to) {
      //     this.pointerMovement = {
      //       ...this.pointerMovement,
      //       to: { row, col, graphic: new Movement(this, row, col) },
      //     };
      //     this.socket.emit(
      //       "Move Tile Request",
      //       this.pointerMovement.from,
      //       this.pointerMovement.to
      //     );
      //     this.pointerMovement.from?.graphic.remove();
      //     this.pointerMovement.to?.graphic.remove();

      //     if (this.pointerMovement.from) {
      //       this.pointerMovement.from = {
      //         row,
      //         col,
      //         graphic: new Movement(this, row, col),
      //       };
      //     }
      //     this.pointerMovement.to = null;
      //   }
      // }
    }
  });

  let lastTime = 0;
  this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
    if (!this.hasLoaded) return;
    const row = this.hover.row;
    const col = this.hover.col;

    //ANCHOR Double Click
    const doubleClickInterval = 250;
    const clickDelay = this.time.now - lastTime;
    lastTime = this.time.now;
    if (clickDelay < doubleClickInterval) {
      this.socket.emit("Double Click");
      return;
    }

    if (this.hasWall(row, col)) return;

    const tile = this.tilesByPosition.get(`${row},${col}`);
    if (this.heldTile) {
      this.events.emit("Clear Arrows");
    }
    if (tile) {
      this.heldTile = tile;
      new Arrows(this, row, col);
    }

    if (pointer.leftButtonDown()) {
      this.socket.emit("Pointer Down", "left", true);
    }
    if (pointer.rightButtonDown()) {
      this.socket.emit("Pointer Down", "right", true);
    }
    // if (tile) {
    //   if (!this.pointerMovement) {
    //     this.pointerMovement = {
    //       from: { row, col, graphic: new Movement(this, row, col) },
    //       to: null,
    //     };
    //   }
    // }

    if (this.goto) {
      this.goto.place(row, col);
    } else {
      this.goto = new GoTo(this, row, col);
    }

    if (!pointer.rightButtonDown()) return;

    if (this.allWalls.has(`${row},${col}`)) return;

    // const flagInPlace = Object.values(this.flags).find(
    //   (flag) => flag && flag.row === row && flag.col === col
    // );

    // if (flagInPlace) {
    //   flagInPlace.remove();
    // } else {
    //   for (const [key, flag] of Object.entries(this.flags)) {
    //     if (flag) continue;
    //     if (key !== "a" && key !== "b" && key !== "c") continue;
    //     this.flags[key] = new Flag(this, row, col, key);
    //     break;
    //   }
    // }
  });

  this.input.on("pointerup", (pointer: Phaser.Input.Pointer) => {
    if (pointer.leftButtonReleased()) {
      this.socket.emit("Pointer Down", "left", false);
    }
    if (pointer.rightButtonReleased()) {
      this.socket.emit("Pointer Down", "right", false);
    }
  });

  //ANCHOR Keyboard events
  this.input.keyboard?.on("keydown", (event: KeyboardEvent) => {
    if (!this.hasLoaded) return;
    switch (event.key) {
      case "Home":
        this.cameras.main.zoom = INITIAL_ZOOM;
        break;
      case "=":
        if (this.scale.isFullscreen) {
          this.scale.stopFullscreen();
        } else {
          this.scale.startFullscreen();
        }
        break;
    }
  });

  this.input.on(
    "wheel",
    (pointer: Phaser.Input.Pointer) => {
      const camera = this.cameras.main;
      const prevZoom = camera.zoom;
      const zoomFactor = 1.12;

      if (pointer.deltaY < 0) {
        camera.zoom *= zoomFactor;
      } else if (pointer.deltaY > 0) {
        camera.zoom /= zoomFactor;
        camera.zoom = Math.max(MIN_ZOOM, camera.zoom); // Cap the zoom at 2
      }

      // Calculate the zoom ratio and the difference in camera position
      const zoomRatio = camera.zoom / prevZoom;
      const dx = (pointer.worldX - camera.worldView.centerX) * (1 - zoomRatio);
      const dy = (pointer.worldY - camera.worldView.centerY) * (1 - zoomRatio);

      // Adjust the camera position to keep the pointer position fixed during zoom
      camera.scrollX -= dx;
      camera.scrollY -= dy;
    },
    this
  );
}
