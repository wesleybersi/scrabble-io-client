import Tile from "../letter";

export default function drawLetter(this: Tile) {
  // return;
  let frame = 0;
  if (this.letter === "?") {
    frame = 28;
  } else {
    if (this.letter === " ") {
      this.letterGraphic?.setAlpha(0);
      return;
    }
    frame = letterToIndex(this.letter);
  }

  if (!this.letterGraphic) {
    this.letterGraphic = this.scene.add.image(
      this.x,
      this.y,
      "alphabet",
      frame
    );
  }
  this.letterGraphic.setTexture(
    this.isSolved ? "alphabet-inverted" : "alphabet"
  );
  this.letterGraphic.setFrame(frame);
  this.letterGraphic.x = this.x;
  this.letterGraphic.y = this.y - 2;
  this.letterGraphic.alpha = 0.95;
  this.letterGraphic.scale = 0.9;
}

function letterToIndex(letter: string) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  return alphabet.indexOf(letter);
}
