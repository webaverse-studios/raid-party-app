import * as THREE from 'three';
import physicsManager from '../../physics-manager';
import AssetManager from './asset-manager';
import metaversefile from 'metaversefile';

// this file's base url
const BASE_URL = import.meta.url.replace(/(\/)[^\/\\]*$/, '$1');

const TILE_SIZE = 1;
const TILE_AMOUNT = 25;

export default class Tiles extends THREE.Object3D {
  app = null;
  physics = null;
  npcs = [];
  meshes = [];
  colliders = [];

  constructor(app, physics) {
    super();
    this.name = 'tiles';
    this.app = app;
    this.physics = physics;
  }

  spawnNPCs = async () => {
    this.npcs = [];
  };

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
    for (let i = 0; i < this.npcs.length; i++) {
      metaversefile.removeTrackedApp(this.npcs[i].getComponent('instanceId'));
    }
    for (let i = 0; i < this.meshes.length; i++) {
      this.meshes[i].visible = false;
    }
    for (let i = 0; i < this.colliders.length; i++) {
      this.physics.removeGeometry(this.colliders[i]);
    }
  };

  unclearMap = () => {
    for (let i = 0; i < this.meshes.length; i++) {
      this.meshes[i].visible = true;
    }
    this.addColliders();
    this.spawnNPCs();
  };

  addCollider(y, x, setTrigger = false) {
    const physicsObject = this.physics.addBoxGeometry(
      new THREE.Vector3(
        (y - TILE_AMOUNT / 2) * TILE_SIZE,
        0,
        (x - TILE_AMOUNT / 2) * TILE_SIZE,
      ),
      new THREE.Quaternion(),
      new THREE.Vector3(0.5, 10, 0.5),
      false,
    );
    if (setTrigger) {
      physicsManager.getScene().setTrigger(physicsObject.physicsId);
    }
    this.app.add(physicsObject);
    this.colliders.push(physicsObject);
  }

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

    this.addColliders();

    this.spawnNPCs();
  }

  addColliders() {
    for (let z = 0; z < TILE_AMOUNT; z++) {
      for (let x = 0; x < TILE_AMOUNT; x++) {
        if (
          z === 0 ||
          z === TILE_AMOUNT - 1 ||
          x === 0 ||
          x === TILE_AMOUNT - 1
        ) {
          this.addCollider(x, z);
        }
      }
    }
  }

  async waitForLoad() {
    const tiles = this.loadTiles(625);
    const assetManager = await AssetManager.loadUrls(tiles);
    this.generate(assetManager);
  }
}
