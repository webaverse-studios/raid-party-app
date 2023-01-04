import * as THREE from 'three';
import physicsManager from '../../physics-manager';
import AssetManager from './asset-manager';
import metaversefile from 'metaversefile';
import {grid, gridID} from './grid';
import {
  DEFAULT_FOREST_RULES,
  forestMap,
  FOREST_GRID_IDS,
  getMesh,
} from './forestMap';

// this file's base url
const BASE_URL = import.meta.url.replace(/(\/)[^\/\\]*$/, '$1');

const TILE_SIZE = 1;
const TILE_AMOUNT = 50;

export default class Tiles extends THREE.Object3D {
  app = null;
  physics = null;
  colliders = [];

  constructor(app, physics) {
    super();
    this.name = 'tiles';
    this.app = app;
    this.physics = physics;
  }

  meshes = [];

  loadTiles(length) {
    const res = [];

    for (let i = 0; i < length; i++) {
      const c = i + 1;
      res.push(
        `${BASE_URL}assets/tarvern/sprite_${
          c >= 100 ? c : c >= 10 ? `0${c}` : `00${c}`
        }.png`,
      );
    }

    return res;
  }

  addCollider(y, x, halfSize = false) {
    const physicsObject = this.physics.addBoxGeometry(
      new THREE.Vector3(
        (y - TILE_AMOUNT / 2) * TILE_SIZE,
        0,
        (x - TILE_AMOUNT / 2) * TILE_SIZE,
      ),
      new THREE.Quaternion(),
      halfSize
        ? new THREE.Vector3(0.25, 10, 0.25)
        : new THREE.Vector3(0.5, 10, 0.5),
      false,
    );
    this.app.add(physicsObject);
    return physicsObject;
  }

  generate(assetManager) {
    const _grid = new forestMap(TILE_AMOUNT, TILE_AMOUNT, DEFAULT_FOREST_RULES);
    const meshes = [];
    for (let i = 0; i < assetManager.textures.length; i++) {
      const material =
        i < 6
          ? new THREE.MeshStandardMaterial({
              map: assetManager.textures[i],
            })
          : new THREE.MeshStandardMaterial({
              map: assetManager.textures[i],
              transparent: true,
              specular: new THREE.Color(0x101010),
              shininess: 40,
              alphaTest: 0.15,
              color: new THREE.Color(0xffffff),
              metal: true,
              wrapAround: true,
              side: THREE.DoubleSide,
            });
      const geometry = new THREE.PlaneGeometry(1, 1);
      geometry.rotateX(-Math.PI / 2);
      const mesh = new THREE.Mesh(geometry, material);
      meshes.push(mesh);
    }

    for (let z = 0; z < TILE_AMOUNT; z++) {
      for (let x = 0; x < TILE_AMOUNT; x++) {
        if (!_grid.isRightLayer(0, z, x)) {
          continue;
        }

        const gridTile = _grid.get(0, z, x);
        const meshName = getMesh(gridTile);
        const cloneMesh = meshes[meshName.idx].clone();
        cloneMesh.position.set(
          (x - TILE_AMOUNT / 2) * TILE_SIZE,
          0.05,
          (z - TILE_AMOUNT / 2) * TILE_SIZE,
        );
        cloneMesh.name = `tile_${x}_${z}`;
        this.meshes.push(cloneMesh);
        this.add(cloneMesh);

        /*this.colliders.push({
          x: (x - TILE_AMOUNT / 2) * TILE_SIZE,
          z: (z - TILE_AMOUNT / 2) * TILE_SIZE,
          cloneMesh,
          layer: 0,
        });*/
      }
    }

    for (let z = 0; z < TILE_AMOUNT; z++) {
      for (let x = 0; x < TILE_AMOUNT; x++) {
        if (!_grid.isRightLayer(1, z, x)) {
          continue;
        }

        const gridTile = _grid.get(1, z, x);
        const meshName = getMesh(gridTile);
        const cloneMesh = meshes[meshName.idx].clone();
        cloneMesh.position.set(
          (x - TILE_AMOUNT / 2) * TILE_SIZE,
          gridTile === FOREST_GRID_IDS.TREE_DOWN ? 3.8 : 1,
          (z - TILE_AMOUNT / 2) * TILE_SIZE,
        );
        cloneMesh.name = `tile_${x}_${z}`;
        this.meshes.push(cloneMesh);
        this.add(cloneMesh);
      }
    }

    for (let z = 0; z < TILE_AMOUNT; z++) {
      for (let x = 0; x < TILE_AMOUNT; x++) {
        if (!_grid.isRightLayer(2, z, x)) {
          continue;
        }

        const gridTile = _grid.get(2, z, x);
        const meshName = getMesh(gridTile);
        const cloneMesh = meshes[meshName.idx].clone();
        cloneMesh.position.set(
          (x - TILE_AMOUNT / 2) * TILE_SIZE,
          4,
          (z - TILE_AMOUNT / 2) * TILE_SIZE,
        );
        cloneMesh.name = `tile_${x}_${z}`;
        this.meshes.push(cloneMesh);
        this.add(cloneMesh);
      }
    }

    for (let z = 0; z < TILE_AMOUNT; z++) {
      for (let x = 0; x < TILE_AMOUNT; x++) {
        if (!_grid.isRightLayer(3, z, x)) {
          continue;
        }

        const gridTile = _grid.get(3, z, x);
        const meshName = getMesh(gridTile);
        console.log(meshName);
        console.log(meshes);
        const cloneMesh = meshes[meshName.idx].clone();
        cloneMesh.position.set(
          (x - TILE_AMOUNT / 2) * TILE_SIZE,
          0.5,
          (z - TILE_AMOUNT / 2) * TILE_SIZE,
        );
        cloneMesh.name = `tile_${x}_${z}`;
        this.meshes.push(cloneMesh);
        this.add(cloneMesh);
      }
    }

    for (let z = 0; z < TILE_AMOUNT; z++) {
      for (let x = 0; x < TILE_AMOUNT; x++) {
        const tileCheck = _grid.isWalkable(z, x);
        if (!tileCheck.isWalkable) {
          this.addCollider(x, z, !tileCheck.full);
        }
      }
    }
  }

  async waitForLoad() {
    const tiles = this.loadTiles(13);
    const assetManager = await AssetManager.loadUrls(tiles);
    this.generate(assetManager);
  }
}

function randomIntFromInterval(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}
