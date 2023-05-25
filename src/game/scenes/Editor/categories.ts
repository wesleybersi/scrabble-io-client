export type CategoryKey = "walls" | "floor" | "objects";

export interface Item {
  name: string;
  description: string[];
  image: string;
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
        name: "Half Wall",
        description: [],
        image: "half-wall",
      },
      {
        name: "Wall",
        description: [],
        image: "wall",
      },
      {
        name: "Big Wall",
        description: [],
        image: "big-wall",
      },
      {
        name: "Stairs",
        description: [],
        image: "ramp-horizontal",
        canRotate: true,
      },
      {
        name: "Drain",
        description: [],
        image: "drain",
      },
    ],
  },
  floor: {
    name: "Floor Tiles",
    items: [],
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
      },
      {
        name: "Metal Crate",
        description: [
          "Crafted from solid steel, this crate can be moved around to create barriers and strategically block pathways. Its formidable design makes it hard to destroy, adding an extra layer of challenge for you as you navigate through the game world.",
        ],
        image: "crates",
      },
    ],
  },
};

export default allCategories;
