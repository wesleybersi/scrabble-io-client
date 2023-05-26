import MainScene from "../Main/MainScene";
import Editor from "../../entities/editor";
import Cursor from "../../entities/cursor";

import allCategories, { Category, CategoryKey, Item } from "./categories";
import { drawSidebar, drawItemGrid } from "./draw/sidebar";
import { placeItem } from "./placement/place-item";
import { removeItem } from "./placement/remove-item";
import { copyItem } from "./placement/copy-item";

import { HoverTarget } from "../../types";
import { inOut } from "./draw/sidebar";

export class EditorScene extends Phaser.Scene {
  main!: MainScene;
  sidebar!: Phaser.GameObjects.Container;
  categoryTabs!: Phaser.GameObjects.Container;
  itemGrid!: Phaser.GameObjects.Container;
  graphics!: Phaser.GameObjects.Graphics;
  sidebarBg!: Phaser.GameObjects.Graphics;
  hideButton!: Phaser.GameObjects.Rectangle;
  canvasHeight = window.innerHeight;
  canvasWidth = window.innerWidth;
  allCategories: { walls: Category; floor: Category; objects: Category } =
    allCategories;
  sidebarIsOpen = false;
  sidebarWidth = 420;
  sidebarHeight = window.innerHeight;
  sidebarPadding = 20;
  selectedCategory: "walls" | "floor" | "objects" = "walls";
  selectedItem: Item | null = null;
  editor!: Editor;
  cursor!: Cursor;
  currentItemText!: Phaser.GameObjects.Text;
  options = { alwaysRevertBack: true };

  selection: {
    start: { row: number; col: number };
    end: { row: number; col: number };
    rect: { row: number; col: number }[];
  } = { start: { row: -1, col: -1 }, end: { row: -1, col: -1 }, rect: [] };
  buttons = {
    meta: false,
    shift: false,
  };

  rotation: "up" | "down" | "left" | "right" = "up";
  flip: "horizontal" | "vertical" | "none" = "none";

  shutdown = false;
  constructor() {
    super({ key: "Editor" });
  }

  create(main: MainScene) {
    main.player.resetToOrigin();
    this.sound.play("create-on");
    this.main = main;
    main.cameras.main.zoom = main.editorZoomLevel;

    this.sidebar = this.add.container(-this.sidebarWidth, 0);
    drawSidebar(this);

    //ANCHOR Custom events
    this.events.on("Selected Item", (index: number) => {
      this.currentItemText?.destroy();
      this.currentItemText = this.add.text(0, 0, "Item", { fontSize: "16px" });
      this.itemGrid.add(this.currentItemText);

      this.selectedItem = allCategories[this.selectedCategory].items[index];
    });

    this.events.on("Selected Category", (key: string) => {
      this.selectedCategory = key as CategoryKey;
      drawItemGrid(this);
    });

    //ANCHOR Keyboard events
    this.input.keyboard?.on("keydown", (event: KeyboardEvent) => {
      if (this.shutdown || main.mode === "Play") return;
      const player = main.player;
      const { cellWidth, cellHeight } = main;
      switch (event.key) {
        //Grid movement
        case "W":
        case "w":
        case "ArrowUp":
          player.place(player.x, (player.y -= cellHeight));
          main.start.row--;
          break;
        case "S":
        case "s":
        case "ArrowDown":
          player.place(player.x, (player.y += cellHeight));
          main.start.row++;
          break;
        case "A":
        case "a":
        case "ArrowLeft":
          player.place((player.x -= cellWidth), player.y);
          main.start.col--;
          break;
        case "D":
        case "d":
        case "ArrowRight":
          player.place((player.x += cellWidth), player.y);
          main.start.col++;
          break;

        //Special keys
        case "Meta":
          this.buttons.meta = true;
          break;
        case "Shift":
          this.buttons.shift = true;
          break;
        case "R":
        case "r":
          if (this.rotation === "up") this.rotation = "right";
          else if (this.rotation === "right") this.rotation = "down";
          else if (this.rotation === "down") this.rotation = "left";
          else if (this.rotation === "left") this.rotation = "up";
          break;
        case "p":
        case "P":
          if (this.flip === "none") this.flip = "horizontal";
          else if (this.flip === "horizontal") this.flip = "vertical";
          else if (this.flip === "vertical") this.flip = "none";
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
    });

    //ANCHOR Mouse events
    this.input.mouse?.disableContextMenu();
    this.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
      const { buttons } = this;
      if (this.sidebarIsOpen && pointer.worldX <= this.sidebarWidth) return;
      if (pointer.leftButtonDown() && !pointer.rightButtonDown()) {
        if (buttons.meta) removeItem(this, "move");
        else if (this.selectedItem) placeItem(this, this.selectedItem, "move");
      }
    });

    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      const { buttons } = this;
      const { hover } = main;
      if (this.sidebarIsOpen && pointer.worldX <= this.sidebarWidth) return;
      if (pointer.leftButtonDown() && !pointer.rightButtonDown()) {
        if (buttons.meta) removeItem(this, "click");
        else if (this.selectedItem) {
          placeItem(this, this.selectedItem, "click");
        }
      } else if (!pointer.leftButtonDown() && pointer.rightButtonDown()) {
        if (hover.object) copyItem(this, hover.object);
      }
      //TODO Shift ? Start selection
    });

    this.input.on("pointerup", (pointer: Phaser.Input.Pointer) => {
      //TODO !Shift ? End selection
    });

    //ANCHOR Resize events
    this.scale.on("resize", (gameSize: Phaser.Structs.Size) => {
      this.sidebarHeight = gameSize.height;
      drawSidebar(this, true);
    });

    //TODO Move to editor?
    this.input.on("wheel", (pointer: Phaser.Input.Pointer) => {
      const camera = main.cameras.main;
      if (pointer.deltaY < 0) {
        if (main.editorZoomLevel < 5) {
          main.editorZoomLevel += 1;
          camera.zoom = main.editorZoomLevel;
        }
      } else if (pointer.deltaY > 0) {
        if (main.editorZoomLevel > 1) {
          main.editorZoomLevel -= 1;
          camera.zoom = main.editorZoomLevel;
        }
      }
    });

    //ANCHOR Custom pointer events
    main.events.on("Pointing at", (object: HoverTarget) => {
      main.hover.object = object;
    });
    main.events.on("Remove from pointer", (object: HoverTarget) => {
      if (main.hover.object === object) main.hover.object = null;
    });
  }

  update() {
    if (this.main.mode === "Play" && !this.shutdown) {
      this.shutdown = true;

      if (this.sidebarIsOpen) inOut(this);
      else {
        this.shutdown = false;
        this.scene.stop("Editor");
      }
      return;
    }
    this.canvasHeight = window.innerHeight;

    //Update player start based on input
    this.main.start.update();

    const camera = this.cameras.main;

    this.currentItemText?.destroy();
    this.currentItemText = this.add.text(
      camera.worldView.right - 400,
      camera.worldView.top + 50,
      `${this.selectedItem?.name ?? ""}  ${
        this.selectedItem?.canRotate ? this.rotation : ""
      }`,
      { fontSize: "24px" }
    );
  }
}
