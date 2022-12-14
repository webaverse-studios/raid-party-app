/**
 * Create an empty tilemap.
 */
export function createTilemap(width, height, value) {
  const tilemap = [];

  for (let y = 0; y < height; y++) {
    tilemap[y] = [];
    for (let x = 0; x < width; x++) {
      tilemap[y][x] = value;
    }
  }

  return tilemap;
}

/**
 * Resize a tilemap.
 */
export function resizeTileMap(tilemap, width, height) {
  const result = [];

  for (let y = 0; y < height; y++) {
    result[y] = [];
    for (let x = 0; x < width; x++) {
      let value = 0;

      if (y < tilemap.length && x < tilemap[y].length) {
        value = tilemap[y][x];
      }

      result[y][x] = value;
    }
  }

  return result;
}

/**
 * Shuffle an array's entries into a new one.
 */
export function shuffleArray(array) {
  const newArray = [...array];

  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }

  return newArray;
}

/**
 * Generate a random number between `min` and `max`.
 */
export function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

/**
 * Return one of the values matching the randomly selected weight.
 */
export function randomWeights(weights, values) {
  const num = Math.random();
  let s = 0;
  const lastIndex = weights.length - 1;

  for (var i = 0; i < lastIndex; ++i) {
    s += weights[i];
    if (num < s) {
      return values[i];
    }
  }

  return values[lastIndex];
}

/**
 * Return one of the values.
 */
export function randomChoice(values) {
  return values[Math.floor(Math.random() * values.length)];
}

/**
 * Return `true` if probability is matched.
 */
export function randomProbability(probability) {
  return Math.random() > 1 - probability;
}

/**
 * Create and return a deep copy of a tilemap.
 */
export function duplicateTilemap(tilemap) {
  return tilemap.map(row => {
    return [...row];
  });
}

export function randomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
