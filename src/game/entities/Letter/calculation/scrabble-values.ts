export function letterToScrabbleValue(letter: string): number {
  letter = letter.toLowerCase();
  switch (letter) {
    case "a":
    case "e":
    case "i":
    case "o":
    case "l":
    case "n":
    case "s":
    case "t":
    case "r":
      return 1;
    case "d":
    case "g":
      return 2;
    case "b":
    case "c":
    case "m":
    case "p":
      return 3;
    case "f":
    case "h":
    case "v":
    case "w":
    case "y":
      return 4;
    case "k":
      return 5;
    case "j":
    case "x":
      return 8;
    case "q":
    case "z":
      return 8;
  }
  return 0;
}

export const letterDistribution: { [key: string]: number } = {
  A: 9,
  B: 2,
  C: 2,
  D: 4,
  E: 12,
  F: 2,
  G: 3,
  H: 2,
  I: 9,
  J: 1,
  K: 1,
  L: 4,
  M: 2,
  N: 6,
  O: 8,
  P: 2,
  Q: 1,
  R: 6,
  S: 4,
  T: 6,
  U: 4,
  V: 2,
  W: 2,
  X: 1,
  Y: 2,
  Z: 1,
};
