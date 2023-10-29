import Letter from "../letter";

export default function autoTile(this: Letter) {
  function returnFrame({
    top,
    bottom,
    left,
    right,
  }: {
    top: Letter | undefined;
    bottom: Letter | undefined;
    left: Letter | undefined;
    right: Letter | undefined;
  }): number {
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
  }

  this.setFrame(returnFrame(this.connectedTo));
  // this.tintGraphic?.setFrame(returnFrame(this.connectedTo));
}
