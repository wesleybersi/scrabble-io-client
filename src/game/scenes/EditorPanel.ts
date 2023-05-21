import MainScene from "./MainScene";
import Editor from "../entities/editor";
import Cursor from "../entities/cursor";
class EditorPanel extends Phaser.Scene {
  graphics!: Phaser.GameObjects.Graphics;
  sidebarBg!: Phaser.GameObjects.Graphics;

  selectedCategory: "walls" | "floor" | "objects" = "objects";

  categoryTabs!: Phaser.GameObjects.Container;
  itemGrid!: Phaser.GameObjects.Container;
  hideButton!: Phaser.GameObjects.Graphics;

  editor!: Editor;
  currentItemText!: Phaser.GameObjects.Text;
  cursor!: Cursor;
  alwaysRevertToOriginalState = true;
  canvasHeight = window.innerHeight;
  canvasWidth = window.innerWidth;
  isOpen = true;
  constructor() {
    super({ key: "Editor-Panel" });
  }

  create(main: MainScene) {
    this.editor = main.editor;
    this.cursor = main.cursor;

    const sidebarWidth = 420;
    const sidebarHeight = window.innerHeight;
    const padding = 20;

    this.sidebarBg = this.add.graphics();
    this.sidebarBg.fillStyle(0xffffff, 0.65);
    this.sidebarBg.fillRect(0, 0, sidebarWidth, sidebarHeight);

    //ANCHOR Grid with walls

    const createCategoryTabs = () => {
      const width = sidebarWidth - padding * 2;
      const amount = Object.keys(categories).length;

      this.categoryTabs = this.add.container(0, 0);

      const tabConfig = {
        amount, // Number of columns
        itemWidth: width / amount - 10 + 10 / amount,
        itemHeight: 40, // Height of each grid item
        paddingX: 10, // Horizontal padding between items
        paddingY: 0, // Vertical padding between items
      };

      this.categoryTabs.x = 0 + tabConfig.itemWidth / 2 + padding;
      this.categoryTabs.y = 0 + tabConfig.itemHeight / 2 + padding;
      for (let i = 0; i < Object.keys(categories).length; i++) {
        const item = this.add.rectangle(
          0,
          0,
          tabConfig.itemWidth,
          tabConfig.itemHeight,
          0xffffff
        );
        item.setInteractive();

        const x = i * (tabConfig.itemWidth + tabConfig.paddingX);
        const y = 0;

        item.setPosition(x, y);

        this.categoryTabs.add(item);

        item.on(
          "pointerdown",
          (event: PointerEvent) => {
            const keys = Object.keys(categories);

            this.input.stopPropagation();

            this.events.emit("Selected Category", keys[i]);
          },
          this
        );
      }
    };
    const createItemGrid = () => {
      if (this.itemGrid) this.itemGrid.destroy();

      this.itemGrid = this.add.container(0, 140); // Adjust the position as desired
      const gridConfig = {
        rows: 4, // Number of rows
        columns: 4, // Number of columns
        itemWidth: 80, // Width of each grid item
        itemHeight: 80, // Height of each grid item
        paddingX: 20, // Horizontal padding between items
        paddingY: 20, // Vertical padding between items
      };

      const gridWidth =
        gridConfig.columns * (gridConfig.itemWidth + gridConfig.paddingX) -
        gridConfig.paddingX;
      const gridHeight =
        gridConfig.rows * (gridConfig.itemHeight + gridConfig.paddingY) -
        gridConfig.paddingY;

      const topLine = this.add.graphics();
      this.itemGrid.add(topLine);
      topLine.fillStyle(0x000000, 0.35);
      topLine.fillRect(-40, -60, 380, 2);

      this.itemGrid.x = (sidebarWidth - gridWidth) / 2 + padding * 2;

      const category = categories[this.selectedCategory as CategoryKey];
      if (!category) return;

      for (let i = 0; i < category.items.length; i++) {
        const item = this.add.rectangle(
          0,
          0,
          gridConfig.itemWidth,
          gridConfig.itemHeight,
          0xffffff
        ); // Adjust the appearance of the grid item as desired
        item.setInteractive(); // Enable interactivity for the grid item

        // Calculate the position of the grid item based on the row and column
        const row = Math.floor(i / gridConfig.columns);
        const col = i % gridConfig.columns;
        const x = col * (gridConfig.itemWidth + gridConfig.paddingX);
        const y = row * (gridConfig.itemHeight + gridConfig.paddingY);

        // Set the position of the grid item within the container
        item.setPosition(x, y);

        // Add the grid item to the container
        this.itemGrid.add(item);

        // Handle click events for the grid item
        item.on(
          "pointerdown",
          (event: PointerEvent) => {
            this.input.stopPropagation();

            this.events.emit("Selected Item", i);
          },
          this
        );
      }
    };
    const createHideButton = () => {
      this.hideButton = this.add.graphics();

      const width = 20;
      const height = 60;

      this.hideButton.fillStyle(0xffffff, 0.65);
      this.hideButton.fillRoundedRect(
        sidebarWidth,
        sidebarHeight / 2 - height / 2,
        width,
        height,
        { tl: 0, tr: 16, bl: 0, br: 16 }
      );

      this.hideButton.setInteractive().on(
        "pointerdown",
        () => {
          console.log("Hello");
          // this.input.stopPropagation();
          this.tweens.add({
            targets: [this.sidebarBg, this.itemGrid, this.categoryTabs],
            duration: 350,
            ease: "Quad.InOut",
            x: -sidebarWidth,
          });
        },
        this
      );
    };
    createCategoryTabs();
    createItemGrid();
    createHideButton();

    this.events.on("Selected Item", (index: number) => {
      this.currentItemText?.destroy();
      this.currentItemText = this.add.text(0, 0, "Item", { fontSize: "16px" });
      this.itemGrid.add(this.currentItemText);
    });

    this.events.on("Selected Category", (key: string) => {
      this.selectedCategory = key as CategoryKey;
      createItemGrid();
    });

    this.sidebarBg.on("pointerdown", () => {
      this.input.stopPropagation();
    });

    this.input.keyboard?.on("keydown", (event: KeyboardEvent) => {
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
  }
  update() {
    if (this.editor.enabled) {
      this.canvasHeight = window.innerHeight;
    }
    this.cursor.update();
  }
}

export default EditorPanel;

type CategoryKey = "walls" | "floor" | "objects";

const categories = {
  walls: { name: "Wall Tiles", items: ["Grey Wall", "White Wall", "Grate"] },
  floor: {
    name: "Floor Tiles",
    items: [
      "Empty",
      "Ice",
      "Water",
      "Lava",
      "Sand",
      "Empty",
      "Ice",
      "Water",
      "Lava",
      "Sand",
      "Empty",
      "Ice",
      "Water",
      "Lava",
      "Sand",
    ],
  },
  objects: {
    name: "Objects",
    items: [
      {
        name: "Wooden Crate",
        description:
          "The wooden crate is a lightweight container that breaks easily when subjected to pressure.",
      },
      {
        name: "Metal Crate",
        description:
          "Crafted from solid steel, this crate can be moved around to create barriers and strategically block pathways. Its formidable design makes it hard to destroy, adding an extra layer of challenge for you as you navigate through the game world.",
      },
      "Explosive Crate",
      "Portal Crate",
      "Laser",
      "Oil Spill",
      "Bubble Shooter",
    ],
  },
};
