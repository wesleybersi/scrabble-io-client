import MainScene from "../../../scenes/Main/MainScene";
import Letter from "../letter";
import { shuffledAlphabet } from "../../../utils/constants";
import { match } from "assert";

export interface ValidWord {
  letters: string;
  objects: Letter[];
  direction: "Vertical" | "Horizontal";
}

export function wordCombinations(
  scene: MainScene,
  horizontal: Map<string, Letter[]>,
  vertical: Map<string, Letter[]>,
  movingSet: Set<Letter>
): Set<Letter> {
  const transformedLetters = new Set<Letter>();
  // logCombinations(horizontal, vertical);

  function findMatches(): ValidWord[] {
    const matchingWords: ValidWord[] = [];
    for (const [firstPos, combination] of [...horizontal, ...vertical]) {
      const direction: "Vertical" | "Horizontal" = combination
        .slice(1)
        .some((letter: Letter) => letter.col === combination[0].col)
        ? "Vertical"
        : "Horizontal";

      combination.forEach((letter, index) => {
        for (
          //Shorten word with each iteration
          let length = combination.length;
          length >= scene.minWordLength;
          length--
        ) {
          const objects = [];
          let stringValue = "";
          const wildcardIndexes: number[] = [];
          let tooShort = false;
          if (length - index < scene.minWordLength) tooShort = true;
          if (!tooShort) {
            for (let i = index; i < length; i++) {
              //Increase starting point within each iteration
              stringValue += combination[i].letter;
              objects.push(combination[i]);
              if (combination[i].isWildcard) wildcardIndexes.push(i);
            }
          }

          if (wildcardIndexes.length > 0 && wildcardIndexes.length < 3) {
            for (const index of wildcardIndexes) {
              if (stringValue.length >= scene.minWordLength) {
                const alphabet = shuffledAlphabet();

                for (const replacement of alphabet) {
                  const letters = stringValue.split("");
                  letters.splice(index, 1, replacement);
                  let wildcardWord = letters.join("");

                  let wordExists = false;

                  if (
                    wildcardIndexes.length > 1 &&
                    wildcardIndexes.indexOf(index) === 0
                  ) {
                    const alphabet = shuffledAlphabet();
                    for (const replacement of alphabet) {
                      if (wildcardWord.length >= scene.minWordLength) {
                        const letters = wildcardWord.split("");
                        letters.splice(wildcardIndexes[1], 1, replacement);
                        wildcardWord = letters.join("");
                        wordExists = scene.dictionary.searchWord(wildcardWord);
                        if (wordExists) break;
                      }
                    }
                  } else if (wildcardIndexes.length === 1) {
                    wordExists = scene.dictionary.searchWord(wildcardWord);
                  }
                  if (wordExists) {
                    // console.log(
                    //   `%c ${wildcardWord}`,
                    //   "background-color: gold; color: white"
                    // );
                    //Because the alphabet is shuffled we can simply use the first match and then break the loop
                    matchingWords.push({
                      letters: wildcardWord,
                      objects,
                      direction,
                    });
                    //Letter will be changed back later, if word won't be used
                    break;
                  }
                }
              }
            }
          } else {
            if (stringValue.length >= scene.minWordLength) {
              const wordExists = scene.dictionary.searchWord(stringValue);
              if (wordExists) {
                // console.log(
                //   `%c ${stringValue}`,
                //   "background-color: #0066ff; color: white; font-weight: bold"
                // );
                //If word exists in dictionary, add to array
                matchingWords.push({
                  letters: stringValue,
                  objects,
                  direction,
                });
              }
            }
          }
        }
      });
    }
    return matchingWords;
  }

  const matchingWords = findMatches();
  logWords(matchingWords);
  const validWords = eliminateSmallerWords(matchingWords);
  // logWords(validWords);

  for (const validWord of validWords) {
    let invalid = false;
    let atLeastOneMoving = false;
    for (const object of validWord.objects) {
      if (invalid) break;
      if (movingSet.has(object)) {
        //One of the letters had to be part of the moving letters
        atLeastOneMoving = true;
      }
      for (const word of object.isPartOfWord) {
        if (
          //Word already exists on board
          word.letters === validWord.letters &&
          word.direction === validWord.direction
        ) {
          console.log("Word already exists on board");
          invalid = true;
          break;
        }

        if (
          //Another word already exists on board and this word does not extend it
          !validWord.letters.includes(word.letters) &&
          validWord.direction === word.direction
        ) {
          console.log(
            "Another word already exists on board and this word does not extend it"
          );
          invalid = true;
          break;
        }
      }
    }
    if (!atLeastOneMoving) invalid = true;
    if (invalid) continue;

    validWord.objects.forEach((letter, index) => {
      let removeIndex = -1;
      letter.isPartOfWord.forEach((word, index) => {
        if (
          //Word can be replaced by new longer word
          validWord.letters.includes(word.letters) &&
          word.direction === validWord.direction
        ) {
          removeIndex = index;
        }
      });
      if (removeIndex >= 0) letter.isPartOfWord.splice(removeIndex, 1);
      letter.isPartOfWord.push(validWord);

      //Wildcard will turn into a letter
      if (letter.isWildcard) {
        //FIXME If wildcard is part of both horizontal and vertical, both need to be the same letter.
        letter.isWildcard = false;
        letter.letter = validWord.letters[index];
      }
      letter.update();

      //Connect pieces together
      if (index === 0) {
        validWord.direction === "Horizontal"
          ? letter.connectShape(["right"])
          : letter.connectShape(["bottom"]);
      } else if (index === validWord.letters.length - 1) {
        validWord.direction === "Horizontal"
          ? letter.connectShape(["left"])
          : letter.connectShape(["top"]);
      } else {
        validWord.direction === "Horizontal"
          ? letter.connectShape(["left", "right"])
          : letter.connectShape(["top", "bottom"]);
      }
      transformedLetters.add(letter);

      if (letter.formedBy !== scene.player) scene.player.score += letter.value;
      letter.formedBy = scene.player;
      //TODO Remove score from other player
    });
    scene.player.validWords.push(validWord);
  }
  return transformedLetters;
}

interface Word {
  value: string;
  row: number;
  col: number;
  direction: "horizontal" | "vertical";
}

function eliminateSmallerWords(words: ValidWord[]): ValidWord[] {
  const filteredWords: ValidWord[] = [];

  // Helper function to check if a word is included in a longer word
  function isWordIncluded(word1: ValidWord, word2: ValidWord): boolean {
    if (word1.direction !== word2.direction) {
      return false;
    }

    for (const obj1 of word1.objects) {
      let hasOverlap = false;
      for (const obj2 of word2.objects) {
        if (
          (word1.direction === "Horizontal" && obj1.row === obj2.row) ||
          (word1.direction === "Vertical" && obj1.col === obj2.col)
        ) {
          hasOverlap = true;
          break;
        }
      }
      if (!hasOverlap) {
        return false;
      }
    }

    return true;
  }

  // Sort the words by length in descending order
  const sortedWords = words.sort((a, b) => b.letters.length - a.letters.length);

  // Iterate through the words and eliminate any included words
  for (const word of sortedWords) {
    const isIncluded = filteredWords.some((filteredWord) =>
      isWordIncluded(word, filteredWord)
    );

    if (!isIncluded) {
      filteredWords.push(word);
    }
  }

  return filteredWords;
}

function logCombinations(
  horizontal: Map<string, Letter[]>,
  vertical: Map<string, Letter[]>
) {
  const horz: string[] = [];
  const vert: string[] = [];
  for (const [pos, combination] of horizontal) {
    let h = "";
    for (const letter of combination) {
      h += letter.letter;
    }
    horz.push(h);
  }

  for (const [pos, combination] of vertical) {
    let v = "";
    for (const letter of combination) {
      v += letter.letter;
    }
    vert.push(v);
  }
  if (horz.length > 0 || vert.length > 0)
    console.log("New possible combinations:");
  if (horz.length > 0) console.log("Horizontal:", horz);
  if (vert.length > 0) console.table("Vertical:", vert);
}

function logWords(array: ValidWord[]) {
  if (array.length > 0) {
    let allWords = "";
    for (const word of array) {
      allWords += word.letters + " ";
    }
    console.log("Matches found:");
    console.log(
      `%c ${allWords}`,
      "background: #0055bb; color:white; font-weight: bold;"
    );
  }
}
