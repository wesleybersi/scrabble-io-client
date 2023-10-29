import MainScene from "../MainScene.ts";
import { Player } from "../../../entities/Player/player.ts";
import BasicTilemap from "../../../entities/Tilemap/tilemap.ts";
import Letter from "../../../entities/Letter/letter.ts";
import { letterDistribution } from "../../../utils/letters.ts";
import { english } from "../../../dictionaries/english.ts";
import { dutch } from "../../../dictionaries/dutch.ts";

import { wordCombinations } from "../../../entities/Letter/calculation/word-combinations.ts";

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
import { oneIn, randomNum } from "../../../utils/helper-functions.ts";

export default function create(
  this: MainScene,
  initialSettings: { language: "English" | "Dutch" }
) {
  const worldWidth = this.colCount * CELL_WIDTH;
  const worldHeight = this.rowCount * CELL_HEIGHT;

  //ANCHOR Initial user settings
  this.language = initialSettings.language;

  let words: string[] = [];
  if (this.language === "Dutch") words = dutch;
  else if (this.language === "English") words = english;
  for (const word of words) {
    this.dictionary.addWord(word.toUpperCase());
  }

  const startCol = Math.floor(Math.random() * this.colCount - 2) + 1;
  const startRow = Math.floor(Math.random() * this.rowCount - 2) + 1;
  this.player = new Player(this, startRow, startCol);

  //ANCHOR Camera
  const camera = this.cameras.main;
  camera.setBounds(0, 0, worldWidth, worldHeight);
  camera.zoom = INITIAL_ZOOM;
  camera.roundPixels = true;
  camera.centerOn(this.player.x, this.player.y);
  camera.setDeadzone(camera.worldView.width, camera.worldView.height);
  camera.startFollow(this.player, true);
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

  //ANCHOR Tilemap
  this.tilemap = new BasicTilemap(this);

  const { letterDensity, wallDensity } = this.procedure;

  for (const letter in letterDistribution) {
    for (let i = 0; i < letterDistribution[letter]; i++) {
      this.letterPool.push(letter);
    }
  }

  //ANCHOR Populate grid
  for (let row = 0; row < this.rowCount; row++) {
    for (let col = 0; col < this.colCount; col++) {
      if (row !== startRow && col !== startCol) {
        if (
          row === 0 ||
          row === this.rowCount - 1 ||
          col === 0 ||
          col === this.colCount - 1 ||
          oneIn(wallDensity)
        ) {
          //Borders
          new Wall(this, row, col);
        } else {
          if (oneIn(letterDensity)) {
            new Letter(this, row, col);
          }
        }
      }
    }
  }

  //ANCHOR Find and remove all initially formed words
  const horizontalMap = new Map<string, Letter[]>();
  const verticalMap = new Map<string, Letter[]>();
  for (const [, letter] of this.allLetters) {
    if (letter.isWildcard || letter.letter === "?") continue;
    letter.getRelevantLetters(horizontalMap, verticalMap);
    letter.update();
  }
  wordCombinations(
    this,
    horizontalMap,
    verticalMap,
    new Set(this.allLetters.values())
  );
  for (const [_, letter] of this.allLetters) {
    if (letter.isPartOfWord.length > 0) {
      //Remove all accidentally formed words
      letter.remove();
    }
  }

  //ANCHOR Pointer events
  this.input.mouse?.disableContextMenu();
  this.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
    this.hover.x = pointer.worldX;
    this.hover.y = pointer.worldY;
    const row = Math.floor(pointer.worldY / CELL_HEIGHT);
    const col = Math.floor(pointer.worldX / CELL_WIDTH);

    this.hover.row = row;
    this.hover.col = col;
  });

  this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
    const row = this.hover.row;
    const col = this.hover.col;

    if (pointer.rightButtonDown()) return;

    if (this.allWalls.has(`${row},${col}`)) return;

    const flagInPlace = Object.values(this.flags).find(
      (flag) => flag && flag.row === row && flag.col === col
    );

    if (flagInPlace) {
      flagInPlace.remove();
    } else {
      for (const [key, flag] of Object.entries(this.flags)) {
        if (flag) continue;
        if (key !== "a" && key !== "b" && key !== "c") continue;
        this.flags[key] = new Flag(this, row, col, key);
        break;
      }
    }
  });

  //ANCHOR Keyboard events
  this.input.keyboard?.on("keydown", (event: KeyboardEvent) => {
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
      const prevZoom = camera.zoom;

      if (pointer.deltaY < 0) {
        camera.zoom *= ZOOM_FACTOR;
        camera.zoom = Math.min(MAX_ZOOM, camera.zoom); // Cap the zoom
      } else if (pointer.deltaY > 0) {
        camera.zoom /= ZOOM_FACTOR;
        camera.zoom = Math.max(MIN_ZOOM, camera.zoom); // Cap the zoom
      }

      // Calculate the zoom ratio and the difference in camera position
      const zoomRatio = camera.zoom / prevZoom;
      const dx = (this.player.x - camera.worldView.centerX) * (1 - zoomRatio);
      const dy = (this.player.y - camera.worldView.centerY) * (1 - zoomRatio);

      // Adjust the camera position to keep the pointer position fixed during zoom
      camera.scrollX -= dx;
      camera.scrollY -= dy;
    },
    this
  );

  this.hasLoaded = true;
}
