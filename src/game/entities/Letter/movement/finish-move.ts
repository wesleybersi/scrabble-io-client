import Letter from "../letter";
import MainScene from "../../../scenes/Main/MainScene";
import { wordCombinations } from "../calculation/word-combinations";
import { MOVE_DURATION } from "../../../scenes/Main/constants";

export default function finishMove(scene: MainScene, letters: Set<Letter>) {
  //ANCHOR All letters to new position
  for (const letter of letters) {
    const oldPos = `${letter.row},${letter.col}`;
    if (scene.allLetters.get(oldPos) === letter) {
      scene.allLetters.delete(oldPos);
    } else {
      for (const [pos, l] of scene.allLetters) {
        if (l === letter) scene.allLetters.delete(pos);
      }
    }

    if (letter.target) {
      letter.x = letter.target.x;
      letter.y = letter.target.y;
      letter.row = letter.target.row;
      letter.col = letter.target.col;
    }

    const newPos = `${letter.row},${letter.col}`;
    scene.allLetters.set(newPos, letter);

    letter.target = null;
    letter.isMoving = false;
  }

  // ANCHOR Update all letters with this information
  for (const letter of letters) {
    letter.update();
  }

  //ANCHOR Update all adajcent tiles with this information
  for (const letter of letters) {
    for (const [, adjacentLetter] of Object.entries(letter.adjacentLetters)) {
      if (adjacentLetter && !letters.has(adjacentLetter)) {
        adjacentLetter.update();
      }
    }
  }

  //ANCHOR Now we scrabble
  const horizontalMap = new Map<string, Letter[]>();
  const verticalMap = new Map<string, Letter[]>();
  for (const letter of letters) {
    if (letter.letter === "?") continue;
    letter.getRelevantLetters(horizontalMap, verticalMap);
  }

  for (const letter of letters) letter.update();

  //Use these unique letters to try and form words.
  wordCombinations(scene, horizontalMap, verticalMap, letters);

  for (const letter of letters) {
    letter.isCalculating = false;
  }

  scene.player.inMovement = false;
}
