import Perlin from './perlinNoise.js';
import PF from 'pathfinding';

const TILE_AMOUNT = 50;
const pn = new Perlin();
const mapArr = {};
const i = 0;

const scales = [40, 10];
const persistance = [1, 0.2];
const range = 100;

function addLayers(n1, n2) {
  const sum = n1 * persistance[0] + n2 * persistance[1];
  const max = range * persistance[0] + range * persistance[1];
  return Math.round(map(sum, 0, max, 0, range));
}
function map(n, start1, stop1, start2, stop2) {
  return ((n - start1) / (stop1 - start1)) * (stop2 - start2) + start2;
}

function addProp(type, x, y) {
  if (!mapArr[y]) {
    mapArr[y] = {};
  }

  mapArr[y][x] = type == 'flower' ? 0 : 1;
}

for (let x = i; x < TILE_AMOUNT + i; x++) {
  for (let y = i; y < TILE_AMOUNT + i; y++) {
    if (!mapArr[y]) {
      mapArr[y] = {};
    }

    const n1 = Math.round(
      //cubicNoise.sample(x / scales[0], y / scales[0], 0) * range,
      pn.noise(x / scales[0], y / scales[0], 0) * range,
    );
    const n2 = Math.round(
      //cubicNoise.sample(x / scales[1], y / scales[1], 0) * range,
      pn.noise(x / scales[1], y / scales[1], 0) * range,
    );
    const num = addLayers(n1, n2);

    let tileName = '';

    if (num <= 20) {
      mapArr[y][x] = 0;
      const rnd = Math.random();
    } else if (num <= 35) {
      mapArr[y][x] = 0;

      const rnd = Math.random();
      if (rnd < 0.1) {
        addProp('stone', x, y);
      }
    } else if (num <= 40) {
      mapArr[y][x] = 0;

      const rnd = Math.random();
      if (rnd < 0.075) {
        addProp('stone', x, y);
      } else if (rnd < 0.4) {
        addProp('flower', x, y);
      }
    } else if (num <= 69) {
      mapArr[y][x] = 0;
      const rnd = Math.random();
      if (rnd < 0.1) {
        addProp('bush_normal', x, y);
      } else if (rnd < 0.75) {
        addProp('flower', x, y);
      }
    } else if (num <= 73) {
      mapArr[y][x] = 0;
      const rnd = Math.random();
      if (rnd < 0.1) {
        addProp('rock', x, y);
      } else if (rnd < 0.0125) {
        addProp('bush_sand', x, y);
      }
    } else {
      mapArr[y][x] = 1;
    }
  }
}

let str = '';
for (const x in mapArr) {
  for (const y in mapArr[x]) {
    str += mapArr[x][y] + ' ';
  }
  str += '\n';
}
console.log(str);

const treeAreas = [];
for (let i = 0; i < TILE_AMOUNT; i++) {
  for (let j = 0; j < TILE_AMOUNT; j++) {
    const x = j;
    const y = i;
    if (mapArr[x][y] === 0) {
      try {
        if (
          mapArr[x][y + 1] === 0 &&
          mapArr[x][y + 2] === 0 &&
          mapArr[x + 1][y] === 0 &&
          mapArr[x + 1][y + 1] === 0 &&
          mapArr[x + 1][y + 2] === 0 &&
          mapArr[x + 2][y] === 0 &&
          mapArr[x + 2][y + 1] === 0 &&
          mapArr[x + 2][y + 2] === 0
        ) {
          treeAreas.push([x, y]);
        }
      } catch (e) {}
    }
  }
}

let treeAreasFiltered = treeAreas.filter((area, index) => {
  return treeAreas.every((area2, index2) => {
    if (index === index2) return true;
    return !(
      area[0] >= area2[0] &&
      area[0] <= area2[0] + 2 &&
      area[1] >= area2[1] &&
      area[1] <= area2[1] + 2
    );
  });
});

//remove the houses that are too close together
treeAreasFiltered = treeAreasFiltered.filter((area, index) => {
  return treeAreasFiltered.every((area2, index2) => {
    if (index === index2) return true;
    return !(
      area[0] >= area2[0] - 2 &&
      area[0] <= area2[0] + 4 &&
      area[1] >= area2[1] - 2 &&
      area[1] <= area2[1] + 4
    );
  });
});

//remove some houses randomly
treeAreasFiltered = treeAreasFiltered.filter((area, index) => {
  return Math.random() < 0.5;
});

treeAreasFiltered.forEach(area => {
  const i = area[1];
  const j = area[0];

  const locs = [
    [i, j],
    [i, j + 1],
    [i, j + 2],
    [i + 1, j],
    [i + 1, j + 1],
    [i + 1, j + 2],
  ];

  for (let i = 0; i < locs.length; i++) {
    addProp('tree', locs[i][1], locs[i][0]);
  }
});

//add some trees randomly
for (let i = 0; i < TILE_AMOUNT; i++) {
  for (let j = 0; j < TILE_AMOUNT; j++) {
    const x = j;
    const y = i;
    if (mapArr[x][y] === 0) {
      const rnd = Math.random();
      if (rnd < 0.05) {
        addProp('tree', x, y);
      }
    }
  }
}

const grid = new PF.Grid(TILE_AMOUNT, TILE_AMOUNT);
for (let x = 0; x < TILE_AMOUNT; x++) {
  for (let y = 0; y < TILE_AMOUNT; y++) {
    grid.setWalkableAt(y, x, mapArr[y][x] === 0);
  }
}
const finder = new PF.AStarFinder();

let paths = [];
let path = [];
while (path.length <= 4) {
  const randomPoint = () => {
    let x = Math.floor(Math.random() * TILE_AMOUNT);
    let y = Math.floor(Math.random() * TILE_AMOUNT);

    while (mapArr[y][x] == 1) {
      x = Math.floor(Math.random() * TILE_AMOUNT);
      y = Math.floor(Math.random() * TILE_AMOUNT);
    }

    return {x, y};
  };

  const start = randomPoint();
  let end = randomPoint();
  while (end === start) {
    end = randomPoint();
  }

  //find path using astar
  path = finder.findPath(start.y, start.x, end.y, end.x, grid.clone());

  if (path && path.length > 4) {
    console.log('path added');
    paths.push(path);
    //asign spriutes to each path tile, according ot next one
    for (let i = 0; i < path.length; i++) {
      const x = path[i][1];
      const y = path[i][0];
      mapArr[y][x] = 1;
      grid.setWalkableAt(y, x, false);
    }
  }
}

//get tiles near to each path
const pathTiles = [];
for (let i = 0; i < paths.length; i++) {
  const path = paths[i];
  for (let j = 0; j < path.length; j++) {
    const x = path[j][1];
    const y = path[j][0];
    const tiles = [
      [y - 1, x - 1],
      [y - 1, x],
      [y - 1, x + 1],
      [y, x - 1],
      [y, x + 1],
      [y + 1, x - 1],
      [y + 1, x],
      [y + 1, x + 1],
    ];
    pathTiles.push(...tiles);
  }
}

console.log(pathTiles.length);

//keep some path tiles randomly
const pathTilesFiltered = pathTiles.filter((tile, index) => {
  return Math.random() < 0.025;
});

console.log(pathTilesFiltered.length);
