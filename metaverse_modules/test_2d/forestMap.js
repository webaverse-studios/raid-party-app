import Perlin from './utils/perlinNoise';
import {grid} from './grid';
import PF from 'pathfinding';

export class forestMap extends grid {
  pn = new Perlin();

  scales = [40, 10];
  persistance = [1, 0.2];
  range = 100;

  pfgrid = null;
  pffinder = null;

  addLayers(n1, n2) {
    const sum = n1 * this.persistance[0] + n2 * this.persistance[1];
    const max =
      this.range * this.persistance[0] + this.range * this.persistance[1];
    return Math.round(this.map(sum, 0, max, 0, this.range));
  }
  map(n, start1, stop1, start2, stop2) {
    return ((n - start1) / (stop1 - start1)) * (stop2 - start2) + start2;
  }

  constructor(sizeX, sizeY, rules) {
    super(sizeX, sizeY);
    this.gridIDs = FOREST_GRID_IDS;

    for (let x = 0; x < sizeX; x++) {
      for (let y = 0; y < sizeY; y++) {
        const n1 = Math.round(
          this.pn.noise(x / this.scales[0], y / this.scales[0], 0) * this.range,
        );
        const n2 = Math.round(
          this.pn.noise(x / this.scales[1], y / this.scales[1], 0) * this.range,
        );
        const num = this.addLayers(n1, n2);

        if (num <= 20) {
          //deep forest
          this.set(0, x, y, this.gridIDs.DEEP_FOREST);
        } else if (num <= 35) {
          this.set(0, x, y, this.gridIDs.STONE);
          //stone
        } else if (num <= 40) {
          this.set(0, x, y, this.gridIDs.FOREST);
          //forest
        } else if (num <= 69) {
          this.set(0, x, y, this.gridIDs.GRASS);
          //grass
        } else if (num <= 73) {
          this.set(0, x, y, this.gridIDs.SAND);
          //sand
        } else {
          this.set(0, x, y, this.gridIDs.WATER);
          //water
        }
      }
    }

    for (let x = 0; x < sizeX; x++) {
      for (let y = 0; y < sizeY; y++) {
        const tile = this.get(0, x, y);
        if (tile === this.gridIDs.WATER) {
          continue;
        }

        if (tile === this.gridIDs.STONE) {
          const rnd = Math.random();
          if (rnd < rules.rock_rnd) {
            this.set(1, x, y, this.gridIDs.ROCK);
          }
        } else if (
          tile === this.gridIDs.FOREST ||
          tile === this.gridIDs.DEEP_FOREST ||
          tile === this.gridIDs.GRASS
        ) {
          const rnd = Math.random();
          if (rnd < rules.bush_rnd) {
            this.set(1, x, y, this.gridIDs.BUSH);
          } else if (rnd < rules.tree_rnd) {
            this.set(1, x, y, this.gridIDs.TREE_DOWN);
            try {
              this.set(2, x - 1, y, this.gridIDs.TREE_UP);
            } catch (e) {}
          } else if (rnd < rules.flower_rnd) {
            this.set(1, x, y, this.gridIDs.FLOWER);
          }
        } else if (tile === this.gridIDs.SAND) {
          const rnd = Math.random();
          if (rnd < rules.sand_bush_rnd) {
            this.set(1, x, y, this.gridIDs.SAND_BUSH);
          }
        }
      }
    }

    this.makeTotalGrid(sizeX, sizeY);
    this.makePathfinding(sizeX, sizeY);

    const paths = [];
    while (paths.length === 0) {
      for (let i = 0; i < rules.max_random_paths; i++) {
        const sX = Math.floor(Math.random() * sizeX);
        const sY = Math.floor(Math.random() * sizeY);
        const eX = Math.floor(Math.random() * sizeX);
        const eY = Math.floor(Math.random() * sizeY);
        const path = this.findPath(sX, sY, eX, eY);
        if (path.length > 0) {
          paths.push(path);
        }
      }
    }

    console.log('PATHS:', paths);

    for (let i = 0; i < paths.length; i++) {
      const path = paths[i];
      for (let j = 0; j < path.length; j++) {
        const p = path[j];
        this.set(3, p[0], p[1], this.gridIDs.PATH);
      }
    }
  }

  makeTotalGrid(sizeX, sizeY) {
    for (let x = 0; x < sizeX; x++) {
      this.totalGrid.push([]);
      for (let y = 0; y < sizeY; y++) {
        const tileCheck = this.isWalkable(x, y);
        if (tileCheck.isWalkable) {
          this.totalGrid[x].push(0);
        } else {
          this.totalGrid[x].push(1);
        }
      }
    }
  }

  makePathfinding(sizeX, sizeY) {
    this.pfgrid = new PF.Grid(sizeX, sizeY);
    for (let x = 0; x < sizeX; x++) {
      for (let y = 0; y < sizeY; y++) {
        this.pfgrid.setWalkableAt(x, y, this.totalGrid[x][y] === 0);
      }
    }
    this.pffinder = new PF.AStarFinder();
  }

  findPath(sX, sY, eX, eY) {
    return this.pffinder.findPath(sX, sY, eX, eY, this.pfgrid.clone());
  }

  isWalkable(x, y) {
    const tile0 = this.get(0, x, y);
    const tile1 = this.get(1, x, y);

    if (tile0 === this.gridIDs.WATER) {
      return {full: true, isWalkable: false};
    }

    if (
      tile1 === this.gridIDs.ROCK ||
      tile1 === this.gridIDs.BUSH ||
      tile1 === this.gridIDs.SAND_BUSH ||
      tile1 === this.gridIDs.TREE_DOWN
    ) {
      return {full: false, isWalkable: false};
    }

    return {full: true, isWalkable: true};
  }

  isRightLayer(layer, x, y) {
    const tile = this.get(layer, x, y);
    if (layer === 0) {
      if (
        tile === this.gridIDs.DEEP_FOREST ||
        tile === this.gridIDs.STONE ||
        tile === this.gridIDs.FOREST ||
        tile === this.gridIDs.GRASS ||
        tile === this.gridIDs.SAND ||
        tile === this.gridIDs.WATER
      ) {
        return true;
      }
    } else if (layer === 1) {
      if (
        tile === this.gridIDs.ROCK ||
        tile === this.gridIDs.BUSH ||
        tile === this.gridIDs.SAND_BUSH ||
        tile === this.gridIDs.FLOWER ||
        tile === this.gridIDs.TREE_DOWN
      ) {
        return true;
      }
    } else if (layer === 2) {
      if (tile === this.gridIDs.TREE_UP) {
        return true;
      }
    } else if (layer === 3) {
      if (tile === this.gridIDs.PATH) {
        return true;
      }
    }

    return false;
  }
}

export const DEFAULT_FOREST_RULES = {
  rock_rnd: 0.15,
  bush_rnd: 0.1,
  sand_bush_rnd: 0.15,
  tree_rnd: 0.15,
  flower_rnd: 0.25,

  max_houses: 5,

  random_only_trees: true,
  max_random_paths: 1,
};

export const FOREST_GRID_IDS = {
  DEEP_FOREST: 0,
  STONE: 1,
  FOREST: 2,
  GRASS: 3,
  SAND: 4,
  WATER: 5,
  ROCK: 6,
  BUSH: 7,
  SAND_BUSH: 8,
  FLOWER: 9,
  TREE_DOWN: 10,
  PATH: 11,
  TREE_UP: 12,
};

export const getMesh = gid => {
  if (gid === FOREST_GRID_IDS.DEEP_FOREST) {
    return {idx: 0, texture_id: 'sprite_001'};
  } else if (gid === FOREST_GRID_IDS.STONE) {
    return {idx: 1, texture_id: 'sprite_002'};
  } else if (gid === FOREST_GRID_IDS.FOREST) {
    return {idx: 2, texture_id: 'sprite_003'};
  } else if (gid === FOREST_GRID_IDS.GRASS) {
    return {idx: 3, texture_id: 'sprite_004'};
  } else if (gid === FOREST_GRID_IDS.SAND) {
    return {idx: 4, texture_id: 'sprite_005'};
  } else if (gid === FOREST_GRID_IDS.WATER) {
    return {idx: 5, texture_id: 'sprite_006'};
  } else if (gid === FOREST_GRID_IDS.BUSH) {
    return {idx: 6, texture_id: 'sprite_007'};
  } else if (gid === FOREST_GRID_IDS.ROCK) {
    return {idx: 7, texture_id: 'sprite_008'};
  } else if (gid === FOREST_GRID_IDS.SAND_BUSH) {
    return {idx: 8, texture_id: 'sprite_009'};
  } else if (gid === FOREST_GRID_IDS.FLOWER) {
    return {idx: 9, texture_id: 'sprite_010'};
  } else if (gid === FOREST_GRID_IDS.TREE_UP) {
    return {idx: 10, texture_id: 'sprite_011'};
  } else if (gid === FOREST_GRID_IDS.TREE_DOWN) {
    return {idx: 11, texture_id: 'sprite_012'};
  } else if (gid === FOREST_GRID_IDS.PATH) {
    return {idx: 12, texture_id: 'sprite_013'};
  }
};
