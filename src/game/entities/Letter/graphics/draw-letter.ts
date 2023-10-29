import Letter from "../letter";

export default function drawLetter(this: Letter) {
  if (this.isWildcard) return;

  let frame = letterToIndex(this.letter);
  if (this.letter === "?") {
    frame = 26;
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
    this.isPartOfWord.length > 0 ? "alphabet-inverted" : "alphabet"
  );
  this.letterGraphic.setFrame(frame);
  this.letterGraphic.x = this.x;
  this.letterGraphic.y = this.y - 2;
  this.letterGraphic.alpha = this.isPartOfWord.length > 0 ? 1 : 1;
  this.letterGraphic.scale = 0.9;

  // this.letterGraphic.alpha = 0;
}

function letterToIndex(letter: string) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  return alphabet.indexOf(letter);
}
