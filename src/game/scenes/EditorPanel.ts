import MainScene from "./MainScene";
import Editor from "../entities/editor";
import Cursor from "../entities/cursor";
class EditorPanel extends Phaser.Scene {
  graphics!: Phaser.GameObjects.Graphics;
  editor!: Editor;
  currentText!: Phaser.GameObjects.Text;
  cursor!: Cursor;
  editorZoomLevel = 2;
  constructor() {
    super({ key: "Editor-Panel" });
  }

  create(main: MainScene) {
    this.editor = main.editor;
    this.cursor = main.cursor;
    main.cameras.main.zoom = this.editorZoomLevel;

    const cellSize = this.registry.get("cellSize");
    const canvasWidth = Number(this.game.config.width);
    const canvasHeight = Number(this.game.config.height);

    this.graphics = this.add.graphics();

    // Create the sidebar container
    const sidebar = this.add.container(0, 0);

    // Create a background for the sidebar
    const sidebarBg = this.add.graphics();
    sidebarBg.fillStyle(0x333333, 1);
    sidebarBg.fillRect(0, 0, 64, Number(this.game.config.height));
    sidebar.add(sidebarBg);

    //Wall options
    this.add
      .text(20, 20, "1 - Dark Wall", { fontSize: "8px" })
      .setInteractive()
      .on("pointerdown", () => {
        this.editor.selected = "Wall";
        console.log("Editor: Wall-Dark Selected");
      });

    // this.add
    //   .text(20, 60, "2 - Light Wall", { fontSize: "8px" })
    //   .setInteractive()
    //   .on("pointerdown", () => {
    //     this.editor.selection = "Wall-Light";
    //     console.log("Editor: Wall-Light Selected");
    //   });

    // this.add
    //   .text(20, 100, "3 - Grate", { fontSize: "8px" })
    //   .setInteractive()
    //   .on("pointerdown", () => {
    //     this.editor.selection = "Wall-Grate";
    //     console.log("Editor: Wall-Grate Selected");
    //   });

    //Movable
    this.add
      .text(20, 180, "4 - Movable Block", { fontSize: "8px" })
      .setInteractive()
      .on("pointerdown", () => {
        this.editor.selected = "Crate";
        console.log("Editor: Movable Selected");
      });
    //Movable
    this.add
      .text(20, 220, "5 - Emancipation Grill", { fontSize: "8px" })
      .setInteractive()
      .on("pointerdown", () => {
        this.editor.selected = "Crate";
        console.log("Editor: Movable Selected");
      });

    //Floor Tiles
    this.add
      .text(20, 300, "7 - Ice", { fontSize: "8px" })
      .setInteractive()
      .on("pointerdown", () => {
        this.editor.selected = "Ice";
        console.log("Editor: Ice Selected");
      });
    this.add
      .text(20, 340, "8 - Water", { fontSize: "8px" })
      .setInteractive()
      .on("pointerdown", () => {
        this.editor.selected = "Water";
        console.log("Editor: Water Selected");
      });
    this.add
      .text(20, 380, "9 - Laser", { fontSize: "8px" })
      .setInteractive()
      .on("pointerdown", () => {
        this.editor.selected = "Water";
        console.log("Editor: Water Selected");
      });

    //Button

    this.add.text(
      20,
      Number(this.game.config.height) - 180,
      "Click to rotate (if possible)",
      {
        fontSize: "4px",
      }
    );
    this.add.text(
      20,
      Number(this.game.config.height) - 140,
      "Right click to copy",
      {
        fontSize: "4px",
      }
    );

    this.add.text(
      20,
      Number(this.game.config.height) - 100,
      "Shift to combine",
      {
        fontSize: "4px",
      }
    );

    this.add.text(20, Number(this.game.config.height) - 60, "CMD to delete", {
      fontSize: "4px",
    });

    this.input.keyboard?.on("keydown", (event: KeyboardEvent) => {
      const camera = main.cameras.main;
      const player = main.player;
      switch (event.key) {
        case "w":
        case "ArrowUp":
          player.place(player.x, (player.y -= main.cellSize));
          player.origin = {
            row: Math.floor(player.y / main.cellSize),
            col: Math.floor(player.x / main.cellSize),
          };
          break;

        case "s":
        case "ArrowDown":
          player.place(player.x, (player.y += main.cellSize));
          player.origin = {
            row: Math.floor(player.y / main.cellSize),
            col: Math.floor(player.x / main.cellSize),
          };
          break;
        case "a":
        case "ArrowLeft":
          player.place((player.x -= main.cellSize), player.y);
          player.origin = {
            row: Math.floor(player.y / main.cellSize),
            col: Math.floor(player.x / main.cellSize),
          };
          break;
        case "d":
        case "ArrowRight":
          player.place((player.x += main.cellSize), player.y);
          player.origin = {
            row: Math.floor(player.y / main.cellSize),
            col: Math.floor(player.x / main.cellSize),
          };
          break;
      }

      this.editor.setScreenBorder();
    });

    // Position the sidebar on the left side of the screen
    sidebar.setPosition(0, 0);
  }
  update() {
    if (this.editor.enabled) {
      this.editor.setScreenBorder();

      if (this.currentText) this.currentText.destroy();
      this.currentText = this.add.text(
        20,
        500,
        `Selection: ${this.editor.selected}`,
        {
          fontSize: "8px",
        }
      );
    }
    this.cursor.update();
  }
}

export default EditorPanel;
