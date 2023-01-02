export class grid {
  grid = {};
  gridMesh = {};

  constructor(sizeX, sizeY) {
    for (let i = 0; i < layer_count; i++) {
      this.grid[i] = [];
      for (let x = 0; x < sizeX; x++) {
        this.grid[i][x] = [];
        for (let y = 0; y < sizeY; y++) {
          this.grid[i][x][y] = gridID.GROUND;
        }
      }
    }

    for (let i = 0; i < layer_count; i++) {
      this.gridMesh[i] = [];
      for (let x = 0; x < sizeX; x++) {
        this.gridMesh[i][x] = [];
        for (let y = 0; y < sizeY; y++) {
          this.gridMesh[i][x][y] = {name: 'empty', mesh: null};
        }
      }
    }
  }

  randomize = () => {
    for (let i = 0; i < 2; i++) {
      for (let x = 0; x < this.grid[i].length; x++) {
        for (let y = 0; y < this.grid[i][x].length; y++) {
          this.grid[i][x][y] =
            i === 0
              ? gridID.GROUND
              : Math.random() > 0.5
              ? gridID.PROP
              : gridID.GROUND;
        }
      }
    }
  };

  getGrid = id => {
    return this.grid[id];
  };
  getGridMesh = id => {
    return this.gridMesh[id];
  };

  set(gridId, x, y, gid) {
    this.grid[gridId][x][y] = gid;
  }
  setMesh(gridId, x, y, mesh) {
    this.gridMesh[gridId][x][y].mesh = mesh;
  }

  get(gridId, x, y) {
    return this.grid[gridId][x][y];
  }
  getMesh(gridId, x, y) {
    return this.gridMesh[gridId][x][y];
  }

  isWalkable(x, y) {
    if (this.get(0, x, y) === gridID.WATER) {
      return false;
    }

    if (this.get(1, x, y) === gridID.PROP) {
      return false;
    }

    if (this.get(2, x, y) === gridID.PROP) {
      return false;
    }

    return true;
  }
}

export const layer_count = 4;
export const gridID = {
  GROUND: 0,
  WATER: 1,
  PROP: 2,
  PROP_WALKABLE: 3,
};

export const hasCollider = gid => {
  if (gid === gridID.WATER || gid === gridID.PROP) {
    return true;
  }

  return false;
};
