import * as THREE from 'three';
import AssetManager from './asset-manager';

// this file's base url
const BASE_URL = import.meta.url.replace(/(\/)[^\/\\]*$/, '$1');

const TILE_SIZE = 1;
const TILE_AMOUNT = 25;

export default class Tiles extends THREE.Object3D {
  app = null;

  constructor(app) {
    super();
    this.name = 'tiles';
    this.app = app;
  }

  meshes = [];
  loadTiles(length) {
    const res = [];

    for (let i = 0; i < length; i++) {
      res.push(
        `${BASE_URL}assets/tarvern/sprite_${
          i >= 100 ? i : i >= 10 ? `0${i}` : `00${i}`
        }.png`,
      );
    }

    return res;
  }

  clearMap = () => {
    for (let i = 0; i < this.meshes.length; i++) {
      this.meshes[i].visible = false;
    }
  };

  unclearMap = () => {
    for (let i = 0; i < this.meshes.length; i++) {
      this.meshes[i].visible = true;
    }
  };

  generate(assetManager) {
    const meshes = [];
    for (let i = 0; i < assetManager.textures.length; i++) {
      const material = new THREE.MeshBasicMaterial({
        map: assetManager.textures[i],
      });
      const geometry = new THREE.PlaneGeometry(1, 1);
      geometry.rotateX(-Math.PI / 2);
      const mesh = new THREE.Mesh(geometry, material);
      meshes.push(mesh);
    }

    let idx = -1;
    for (let z = 0; z < TILE_AMOUNT; z++) {
      for (let x = 0; x < TILE_AMOUNT; x++) {
        idx++;
        const cloneMesh = meshes[idx].clone();
        cloneMesh.position.set(
          (x - TILE_AMOUNT / 2) * TILE_SIZE,
          0.05,
          (z - TILE_AMOUNT / 2) * TILE_SIZE,
        );
        this.meshes.push(cloneMesh);
        this.add(cloneMesh);
      }
    }
  }

  async waitForLoad() {
    const tiles = this.loadTiles(625);
    const assetManager = await AssetManager.loadUrls(tiles);
    this.generate(assetManager);
  }
}

function randomIntFromInterval(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}
