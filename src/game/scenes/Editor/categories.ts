export type CategoryKey = "walls" | "floor" | "objects";

export interface Item {
  name: string;
  description: string[];
  image: string;
  frame?: number;
  canRotate?: boolean;
}

export interface Category {
  name: string;
  items: Item[];
}

const allCategories: { walls: Category; floor: Category; objects: Category } = {
  walls: {
    name: "Wall Tiles",
    items: [
      {
        name: "Wall",
        description: [],
        image: "wall-tier1",
      },
      {
        name: "Ramp",
        description: [],
        image: "ramp-horizontal",
        canRotate: true,
      },
      {
        name: "Stairs",
        description: [],
        image: "ramp-horizontal",
        canRotate: true,
      },
      {
        name: "Ladder",
        description: [],
        image: "ladder",
        frame: 3,
      },
    ],
  },
  floor: {
    name: "Floor Tiles",
    items: [
      {
        name: "Water",
        description: [],
        image: "water",
      },
      {
        name: "Drain",
        description: [],
        image: "drain",
      },
    ],
  },
  objects: {
    name: "Objects",
    items: [
      {
        name: "Wooden Crate",
        description: [
          "The wooden crate is a lightweight container that breaks easily when subjected to pressure.",
        ],
        image: "crates",
        frame: 0,
      },
      {
        name: "Metal Crate",
        description: [
          "Crafted from solid steel, this crate can be moved around to create barriers and strategically block pathways. Its formidable design makes it hard to destroy, adding an extra layer of challenge for you as you navigate through the game world.",
        ],
        image: "crates",
        frame: 5,
      },
      {
        name: "Pillar",
        description: [],
        image: "pillars",
        frame: 0,
      },
      {
        name: "Pillar Horizontal",
        description: [],
        image: "pillars",
        frame: 1,
      },
      {
        name: "Pillar Vertical",
        description: [],
        image: "pillars",
        frame: 2,
      },
      {
        name: "Pillar Diagonal",
        description: [],
        image: "pillars",
        frame: 3,
      },
    ],
  },
};

export default allCategories;
