function randomize(seed, x, y) {
  const RND_A = 134775813;
  const RND_B = 1103515245;

  return (
    (((((x ^ y) * RND_A) ^ (seed + x)) *
      (((RND_B * x) << 16) ^ (RND_B * y - RND_A))) >>>
      0) /
    4294967295
  );
}

function tile(coordinate, period) {
  if (coordinate < 0) {
    while (coordinate < 0) {
      coordinate += period;
    }
  } else {
    return coordinate % period;
  }
}

function interpolate(a, b, c, d, x) {
  const p = d - c - (a - b);
  return x * (x * (x * p + (a - b - p)) + (c - a)) + b;
}

export function cubicNoiseConfig(
  seed,
  periodX = Number.MAX_SAFE_INTEGER,
  periodY = Number.MAX_SAFE_INTEGER
) {
  return {
    seed: Math.floor(seed * Number.MAX_SAFE_INTEGER),
    periodX: periodX,
    periodY: periodY,
  };
}

export function cubicNoiseSample1(config, x) {
  const xi = Math.floor(x);
  const lerp = x - xi;

  return (
    interpolate(
      randomize(config.seed, tile(xi - 1, config.periodX), 0),
      randomize(config.seed, tile(xi, config.periodX), 0),
      randomize(config.seed, tile(xi + 1, config.periodX), 0),
      randomize(config.seed, tile(xi + 2, config.periodX), 0),
      lerp
    ) *
      0.666666 +
    0.166666
  );
}

export function cubicNoiseSample2(config, x, y) {
  const xi = Math.floor(x);
  const lerpX = x - xi;
  const yi = Math.floor(y);
  const lerpY = y - yi;
  const x0 = tile(xi - 1, config.periodX);
  const x1 = tile(xi, config.periodX);
  const x2 = tile(xi + 1, config.periodX);
  const x3 = tile(xi + 2, config.periodX);

  const xSamples = new Array(4);

  for (let i = 0; i < 4; ++i) {
    const y = tile(yi - 1 + i, config.periodY);

    xSamples[i] = interpolate(
      randomize(config.seed, x0, y),
      randomize(config.seed, x1, y),
      randomize(config.seed, x2, y),
      randomize(config.seed, x3, y),
      lerpX
    );
  }

  return (
    interpolate(xSamples[0], xSamples[1], xSamples[2], xSamples[3], lerpY) *
      0.5 +
    0.25
  );
}
