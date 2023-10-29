import MainScene from "../MainScene";

import tilesetFloor from "../../../assets/images/tilesets/floor-128.png";

import spritesheetPlayer from "../../../assets/images/spritesheets/player-base.png";
import player from "../../../assets/images/tilesets/blue.png";

import spritesheetCrates from "../../../assets/images/spritesheets/crates-30.png";
import spritesheetBlocks from "../../../assets/images/tilesets/blocks-128.png";
// import spritesheetBlocks from "../../../assets/images/tilesets/blocks-144.png";
import spritesheetLetters from "../../../assets/images/tilesets/alphabet.png";

import spritesheetWalls from "../../../assets/images/spritesheets/walls.png";

import spritesheetPillars from "../../../assets/images/spritesheets/pillars.png";

import spritesheetWater from "../../../assets/images/spritesheets/water.png";

import spritesheetAlhabetInverted from "../../../assets/images/tilesets/alphabet-inverted.png";

import imageRampHorizontal from "../../../assets/images/spritesheets/ramp-h.png";
import imageRampVertical from "../../../assets/images/spritesheets/ramp-v.png";

import spritesheetExplosion from "../../../assets/images/spritesheets/explosion.png";
import spritesheetCracks from "../../../assets/images/spritesheets/wallcrack.png";
import spritesheetOil from "../../../assets/images/spritesheets/oil.png";

import spritesheetLadder from "../../../assets/images/spritesheets/ladder.png";

import imageCornerpiece from "../../../assets/images/cornerpiece.png";
import imageEntrance from "../../../assets/images/entrance.png";
import imageTint from "../../../assets/images/tilesets/tint_128.png";

import sfxCreateOn from "../../../assets/audio/create-on.wav";
import sfxCreateOff from "../../../assets/audio/create-off.wav";

import LoadingScene from "../../Loading/LoadingScene";

import shadow6 from "../../../assets/images/shadow-6.png";
import shadow24 from "../../../assets/images/tilesets/shadow-24.png";

import { CELL_HEIGHT, CELL_WIDTH } from "../constants";

export default function preload(this: MainScene) {
  this.scene.launch("Loading", this);
  console.log("Main: Preload");
  this.loadingScene = this.scene.get("Loading") as LoadingScene;

  this.loadingScene.progress("Loading tilesets");
  //Tilesets
  this.load.spritesheet("floor", tilesetFloor, {
    frameWidth: CELL_WIDTH,
    frameHeight: CELL_HEIGHT,
  });

  this.loadingScene.progress("Loading spritesheets");
  this.load.image("cornerpiece", imageCornerpiece);
  this.load.image("entrance", imageEntrance);

  this.load.image("shadow-6", shadow6);
  this.load.image("shadow-24", shadow24);
  this.load.image("tint", imageTint);

  //Spritsheets
  this.load.spritesheet("alphabet", spritesheetLetters, {
    frameWidth: CELL_WIDTH,
    frameHeight: CELL_HEIGHT,
  });
  this.load.spritesheet("alphabet-inverted", spritesheetAlhabetInverted, {
    frameWidth: CELL_WIDTH,
    frameHeight: CELL_HEIGHT,
  });
  this.load.spritesheet("blocks", spritesheetBlocks, {
    frameWidth: CELL_WIDTH,
    frameHeight: CELL_HEIGHT,
  });
  this.load.spritesheet("pillars", spritesheetPillars, {
    frameWidth: 32,
    frameHeight: 40,
  });
  this.load.spritesheet("ladder", spritesheetLadder, {
    frameWidth: 32,
    frameHeight: 16,
  });

  this.load.spritesheet("ramp-horizontal", imageRampHorizontal, {
    frameWidth: 64,
    frameHeight: 40,
  });
  this.load.spritesheet("ramp-vertical", imageRampVertical, {
    frameWidth: 32,
    frameHeight: 64,
  });

  this.load.spritesheet("walls", spritesheetBlocks, {
    frameWidth: CELL_WIDTH,
    frameHeight: CELL_HEIGHT,
  });

  this.load.spritesheet("water", spritesheetWater, {
    frameWidth: 32,
    frameHeight: 24,
  });

  this.load.spritesheet("player", player, {
    frameWidth: CELL_WIDTH,
    frameHeight: CELL_HEIGHT,
  });

  this.load.spritesheet("explosion", spritesheetExplosion, {
    frameWidth: CELL_WIDTH,
    frameHeight: CELL_HEIGHT,
  });
  this.load.spritesheet("cracks", spritesheetCracks, {
    frameWidth: CELL_WIDTH,
    frameHeight: CELL_HEIGHT,
  });
  this.load.spritesheet("oil", spritesheetOil, {
    frameWidth: CELL_HEIGHT,
    frameHeight: CELL_HEIGHT,
  });

  this.loadingScene.progress("Loading audio assets");
  this.load.audio("create-on", sfxCreateOn);
  this.load.audio("create-off", sfxCreateOff);
}
