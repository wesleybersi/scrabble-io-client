export const allDirectionsFalse = {
  up: false,
  down: false,
  left: false,
  right: false,
};

export const allCardinalsFalse = {
  top: false,
  bottom: false,
  left: false,
  right: false,
};

export const allCardinalsUndefined = {
  top: undefined,
  bottom: undefined,
  left: undefined,
  right: undefined,
};

export const allCardinals3DUndefined = {
  top: undefined,
  bottom: undefined,
  left: undefined,
  right: undefined,
  above: undefined,
  below: undefined,
};

export const allDirectionsNull = {
  up: null,
  down: null,
  left: null,
  right: null,
};

export const allCardinalsNull = {
  top: null,
  bottom: null,
  left: null,
  right: null,
};

export function shuffledAlphabet() {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const shuffledAlphabet = shuffleString(alphabet);

  function shuffleString(string: string) {
    const array = string.split("");
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array.join("");
  }
  return shuffledAlphabet;
}
