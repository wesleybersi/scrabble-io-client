import Wall from "../wall";

export default function autoTile(this: Wall) {
  const adjacentToTileIndex = (
    top: boolean,
    bottom: boolean,
    left: boolean,
    right: boolean
  ): number => {
    if (right && !left && !top && !bottom) return 1;
    else if (!right && left && !top && !bottom) return 2;
    else if (!right && !left && !top && bottom) return 3;
    else if (!right && !left && top && !bottom) return 4;
    else if (!right && !left && top && bottom) return 5;
    else if (right && left && !top && !bottom) return 6;
    else if (right && !left && !top && bottom) return 7;
    else if (right && !left && top && !bottom) return 9;
    else if (!right && left && !top && bottom) return 8;
    else if (!right && left && top && !bottom) return 10;
    else if (right && left && top && !bottom) return 13;
    else if (right && left && !top && bottom) return 14;
    else if (!right && left && top && bottom) return 12;
    else if (right && !left && top && bottom) return 11;
    else if (right && left && top && bottom) return 15;
    else return 0;
  };

  this.setFrame(
    adjacentToTileIndex(
      this.connectedTo.top,
      this.connectedTo.bottom,
      this.connectedTo.left,
      this.connectedTo.right
    )
  );

  this.shadowGraphic?.setFrame(
    adjacentToTileIndex(
      this.connectedTo.top,
      this.connectedTo.bottom,
      this.connectedTo.left,
      this.connectedTo.right
    )
  );
}
