import Letter from "../letter";

export default function getRelevantLetters(
  this: Letter,
  horizontalMap: Map<string, Letter[]>,
  verticalMap: Map<string, Letter[]>
): void {
  const { allLetters, minWordLength } = this.scene;

  const horizontal = [this];
  const vertical = [this];

  //Left and right
  const defineLeft = (row: number, col: number) => {
    const letter = allLetters.get(`${row},${col}`);
    if (letter && letter.letter !== "?") {
      horizontal.unshift(letter);
      defineLeft(row, col - 1);
    }
  };
  const defineRight = (row: number, col: number) => {
    const letter = allLetters.get(`${row},${col}`);
    if (letter && letter.letter !== "?") {
      horizontal.push(letter);
      defineRight(row, col + 1);
    }
  };
  //Up and down
  const defineUp = (row: number, col: number) => {
    const letter = allLetters.get(`${row},${col}`);
    if (letter && letter.letter !== "?") {
      vertical.unshift(letter);
      defineUp(row - 1, col);
    }
  };
  const defineDown = (row: number, col: number) => {
    const letter = allLetters.get(`${row},${col}`);
    if (letter && letter.letter !== "?") {
      vertical.push(letter);
      defineDown(row + 1, col);
    }
  };

  defineLeft(this.row, this.col - 1);
  defineRight(this.row, this.col + 1);
  defineUp(this.row - 1, this.col);
  defineDown(this.row + 1, this.col);

  function pushToHorizontalMap() {
    if (horizontal.length < minWordLength) return;
    const firstLetter = horizontal[0];
    const pos = `${firstLetter.row},${firstLetter.col}`;
    if (!horizontalMap.has(pos)) horizontalMap.set(pos, []);
    if (horizontalMap.get(pos)?.length === 0) {
      for (const letter of horizontal) {
        horizontalMap.get(pos)!.push(letter);
      }
    }
  }

  function pushToVerticalMap() {
    if (vertical.length < minWordLength) return;
    const firstLetter = vertical[0];
    const pos = `${firstLetter.row},${firstLetter.col}`;
    if (!verticalMap.has(pos)) verticalMap.set(pos, []);
    if (verticalMap.get(pos)?.length === 0) {
      for (const letter of vertical) {
        verticalMap.get(pos)!.push(letter);
      }
    }
  }

  pushToHorizontalMap();
  pushToVerticalMap();
}
