import { EditorScene } from "../EditorScene";

export function drawSidebar(scene: EditorScene, noTween?: boolean) {
  const { sidebarWidth, sidebarHeight, sidebar } = scene;

  if (scene.sidebarBg) scene.sidebarBg.destroy();
  scene.sidebarBg = scene.add.graphics();

  scene.sidebarBg.fillStyle(0xffffff, 0.75);
  scene.sidebarBg.fillRect(0, 0, sidebarWidth, sidebarHeight);

  sidebar.add(scene.sidebarBg);

  drawCategoryTabs(scene);
  drawItemGrid(scene);
  drawHideButton(scene, noTween);
}

export const drawCategoryTabs = (scene: EditorScene) => {
  const { sidebarPadding, allCategories } = scene;

  const width = scene.sidebarWidth - scene.sidebarPadding * 2;
  const amount = Object.keys(scene.allCategories).length;

  if (scene.categoryTabs) scene.categoryTabs.destroy();
  scene.categoryTabs = scene.add.container(0, 0);

  const tabConfig = {
    amount, // Number of columns
    itemWidth: width / amount - 10 + 10 / amount,
    itemHeight: 40, // Height of each grid item
    paddingX: 10, // Horizontal padding between items
    paddingY: 0, // Vertical padding between items
  };

  scene.categoryTabs.x = 0 + tabConfig.itemWidth / 2 + sidebarPadding;
  scene.categoryTabs.y = 0 + tabConfig.itemHeight / 2 + sidebarPadding;
  for (let i = 0; i < Object.keys(allCategories).length; i++) {
    const item = scene.add.rectangle(
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

    scene.categoryTabs.add(item);

    item.on(
      "pointerdown",
      (event: PointerEvent) => {
        const keys = Object.keys(allCategories);

        scene.input.stopPropagation();

        scene.events.emit("Selected Category", keys[i]);
      },
      scene
    );
  }
  scene.sidebar.add(scene.categoryTabs);
};
export function drawItemGrid(scene: EditorScene) {
  const { sidebarWidth, sidebarPadding, allCategories } = scene;
  if (scene.itemGrid) scene.itemGrid.destroy();
  scene.itemGrid = scene.add.container(0, 140); // Adjust the position as desired
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

  const topLine = scene.add.graphics();
  scene.itemGrid.add(topLine);
  topLine.fillStyle(0x000000, 0.35);
  topLine.fillRect(-40, -60, 380, 2);

  scene.itemGrid.x = (sidebarWidth - gridWidth) / 2 + sidebarPadding * 2;

  const category = allCategories[scene.selectedCategory];
  if (!category) return;

  for (let i = 0; i < category.items.length; i++) {
    const item = scene.add.image(0, 0, category.items[i].image, 0);
    item.setOrigin(0.5, 0.5);
    item.setInteractive();

    // Calculate the position of the grid item based on the row and column
    const row = Math.floor(i / gridConfig.columns);
    const col = i % gridConfig.columns;
    const x = col * (gridConfig.itemWidth + gridConfig.paddingX);
    const y = row * (gridConfig.itemHeight + gridConfig.paddingY);

    // Set the position of the grid item within the container
    item.setPosition(x, y);

    // Add the grid item to the container
    scene.itemGrid.add(item);

    // Handle click events for the grid item
    item.on(
      "pointerdown",
      (event: PointerEvent) => {
        scene.input.stopPropagation();
        scene.events.emit("Selected Item", i);
      },
      scene
    );
  }
  scene.sidebar.add(scene.itemGrid);
}
const drawHideButton = (scene: EditorScene, noTween?: boolean) => {
  const { sidebarWidth, sidebarHeight } = scene;

  const width = 25;
  const height = 60;
  if (scene.hideButton) scene.hideButton.destroy();
  scene.hideButton = scene.add.rectangle(
    sidebarWidth + width / 2,
    sidebarHeight / 2 - height / 2,
    width,
    height,
    0xffffff,
    0.65
  );

  scene.hideButton.setInteractive({ useHandCursor: true });

  if (!noTween) inOut(scene);

  scene.hideButton.on("pointerdown", () => {
    scene.input.stopPropagation();
    inOut(scene);
  }),
    scene.sidebar.add(scene.hideButton);
};

export function inOut(scene: EditorScene) {
  const { sidebarWidth } = scene;
  const tween = scene.tweens.add({
    targets: [scene.sidebar],
    duration: 400,
    ease: "Sine.Out",
    x: scene.sidebarIsOpen ? -sidebarWidth : 0,
    alpha: scene.sidebarIsOpen ? 0.5 : 1,
    onStart: () => {
      console.log(tween.duration);
    },
    onComplete: () => {
      scene.sidebarIsOpen = scene.sidebarIsOpen ? false : true;
      if (scene.shutdown) {
        scene.shutdown = false;
        scene.scene.stop("Editor");
      }
    },
  });
}
