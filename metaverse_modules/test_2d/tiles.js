import * as THREE from 'three';
import physicsManager from '../../physics-manager';
import AssetManager from './asset-manager';
import metaversefile from 'metaversefile';
import {grid, gridID} from './grid';

// this file's base url
const BASE_URL = import.meta.url.replace(/(\/)[^\/\\]*$/, '$1');

const TILE_SIZE = 1;
const TILE_AMOUNT = 25;

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
      res.push(
        `${BASE_URL}assets/tarvern/sprite_${
          i >= 100 ? i : i >= 10 ? `0${i}` : `00${i}`
        }.png`,
      );
    }

    return res;
  }

  addCollider(y, x, i) {
    console.log('collider:', i);
    const physicsObject = this.physics.addBoxGeometry(
      new THREE.Vector3(
        (y - TILE_AMOUNT / 2) * TILE_SIZE,
        0.01 * i,
        (x - TILE_AMOUNT / 2) * TILE_SIZE,
      ),
      new THREE.Quaternion(),
      new THREE.Vector3(0.5, 0.1, 0.5),
      false,
    );
    this.app.add(physicsObject);
    return physicsObject;
  }

  generate(assetManager) {
    const _grid = new grid(TILE_AMOUNT, TILE_AMOUNT);
    _grid.randomize();
    const meshes = [];
    for (let i = 0; i < assetManager.textures.length; i++) {
      const material =
        i === 0
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
        for (let i = 0; i < 2; i++) {
          const gridTile = _grid.get(i, z, x);
          console.log('Layer:', i, 'Tile:', gridTile);
          const cloneMesh = meshes[gridTile === gridID.GROUND ? 0 : 1].clone();
          cloneMesh.position.set(
            (x - TILE_AMOUNT / 2) * TILE_SIZE,
            i === 0 ? 0.05 : 1,
            (z - TILE_AMOUNT / 2) * TILE_SIZE,
          );
          cloneMesh.name = `tile_${x}_${z}`;
          this.meshes.push(cloneMesh);
          this.add(cloneMesh);

          this.colliders.push({
            x: (x - TILE_AMOUNT / 2) * TILE_SIZE,
            z: (z - TILE_AMOUNT / 2) * TILE_SIZE,
            cloneMesh,
            layer: i,
          });
        }
      }
    }

    console.log(meshes);

    console.log('colliders:', this.colliders);
  }

  async waitForLoad() {
    const tiles = this.loadTiles(2);
    const assetManager = await AssetManager.loadUrls(tiles);
    this.generate(assetManager);
  }
}

function randomIntFromInterval(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}
