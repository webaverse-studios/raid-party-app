export class grid {
  grid = {};
  gridMesh = {};
  gridIDs = {};
  totalGrid = [];
  layerValues = {};

  constructor(sizeX, sizeY, layer_count = 4, _layerValues = layerValues) {
    this.gridIDs = gridID;
    this.layerValues = _layerValues;
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
    if (gridId === 1) {
      console.log('set', gridId, x, y, gid, '-', this.grid[gridId][x][y]);
    }
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

  exportGrid = () => {
    const data = {
      grid: this.grid,
      gridMesh: this.gridMesh,
      gridIDs: this.gridIDs,
    };
    return data;
  };
}

export const layerValues = {
  1: 0.05,
  2: 1,
  3: 3.8,
  4: 4,
  5: 0.1,
};

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
