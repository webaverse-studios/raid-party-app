import * as THREE from 'three';
import AssetManagerForest from './asset-manager';
import generateForest from './forest';
import {
  generateImage,
  generateImageCache,
  generateImageNew,
} from './request_manager';

// this file's base url
const BASE_URL = import.meta.url.replace(/(\/)[^\/\\]*$/, '$1');

export const TILE_SIZE = 1;
export const TILE_AMOUNT = 50;

export default class Tiles extends THREE.Object3D {
  ioManager = new EventTarget();
  tempTiles = [];
  allMeshes = [];
  colliders = [];
  biomeInfo = '';
  cMeshes = [];
  spot = [0, 0];

  constructor() {
    super();
    this.name = 'tiles';
    document.addEventListener('keydown', e => {
      if (e.key == 'u') {
        console.log('regenerating tiles');
        this.regenerateTiles(this.tempTiles, this.biomeInfo, 'forest');
      }
    });
  }

  regenerateWithPrompt(info, type) {
    this.regenerateTiles(this.tempTiles, info, type);
  }

  loadTiles(type, length) {
    const res = [];

    for (let i = 0; i < length; i++) {
      res.push(
        `${BASE_URL}assets/tiles/${type}/sprite_${
          i >= 100 ? i : i >= 10 ? `0${i}` : `00${i}`
        }.png`,
      );
    }

    return res;
  }

  generate(type, assetManager, textures, info, physics, app, localPlayer) {
    const meshes = {};
    const data = {};

    console.log('Textures:', textures);
    for (const [key, value] of Object.entries(textures)) {
      data[key] = [];
      for (let i = 0; i < value.length; i++) {
        if (Object.prototype.toString.call(value[i]) === '[object Array]') {
          console.log('is array:', i);
          const d = [];
          for (let j = 0; j < value[i].length; j++) {
            const material =
              key.includes('deep forest') ||
              key.includes('forest') ||
              key.includes('stone ground') ||
              key.includes('grass') ||
              key.includes('sand') ||
              key.includes('water') ||
              key.includes('path')
                ? new THREE.MeshStandardMaterial({
                    map: value[i],
                  })
                : new THREE.MeshStandardMaterial({
                    map: value[i][j],
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
            mesh.position.set(0, 0, 0);
            meshes[key + '_' + i + '_' + j] = mesh;
            d.push(key + '_' + i + '_' + j);
            console.log('pushed:', key + '_' + i + '_' + j);
          }
          data[key].push(d);
          console.log('this.d:', d, "data:', data");
        } else {
          if (key.includes('tree')) {
            let material =
              key.includes('deep forest') ||
              key.includes('forest') ||
              key.includes('stone ground') ||
              key.includes('grass') ||
              key.includes('sand') ||
              key.includes('water') ||
              key.includes('path')
                ? new THREE.MeshStandardMaterial({
                    map: value[i],
                  })
                : new THREE.MeshStandardMaterial({
                    map: value[i],
                    transparent: true,
                    specular: new THREE.Color(0x101010),
                    shininess: 40,
                    alphaTest: 0.15,
                    color: new THREE.Color(0xffffff),
                    metal: true,
                    wrapAround: true,
                    side: THREE.DoubleSide,
                  });
            let geometry = new THREE.PlaneGeometry(1, 1);
            geometry.rotateX(-Math.PI / 2);
            let mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(0, 0, 0);
            meshes[key + '_' + i + '_' + 0] = mesh;
            data[key].push(key + '_' + i + '_' + 0);

            i++;
            material =
              key.includes('deep forest') ||
              key.includes('forest') ||
              key.includes('stone ground') ||
              key.includes('grass') ||
              key.includes('sand') ||
              key.includes('water') ||
              key.includes('path')
                ? new THREE.MeshStandardMaterial({
                    map: value[i],
                  })
                : new THREE.MeshStandardMaterial({
                    map: value[i],
                    transparent: true,
                  });
            geometry = new THREE.PlaneGeometry(1, 1);
            geometry.rotateX(-Math.PI / 2);
            mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(0, 0, 0);
            meshes[key + '_' + (i - 1) + '_' + 1] = mesh;
            data[key].push(key + '_' + (i - 1) + '_' + 1);
          } else {
            const material =
              key.includes('deep forest') ||
              key.includes('forest') ||
              key.includes('stone ground') ||
              key.includes('grass') ||
              key.includes('sand') ||
              key.includes('water') ||
              key.includes('path')
                ? new THREE.MeshStandardMaterial({
                    map: value[i],
                  })
                : new THREE.MeshStandardMaterial({
                    map: value[i],
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
            mesh.position.set(0, 0, 0);
            meshes[key + '_' + i] = mesh;
            data[key].push(key + '_' + i);
          }
        }
      }
    }

    const start = new Date();
    console.log('OUTDATA:', data);
    console.log(
      data['Unicorn deep forest'],
      '-',
      data[info + ' deep forest'],
      '-',
      info,
    );

    this.generateMapFull(meshes, data, info, physics, app, localPlayer);
  }

  generating = false;
  generateMapFull(meshes, data, info, physics, app, localPlayer) {
    if (this.colliders) {
      this.colliders.forEach(collider => {
        physics.removeGeometry(collider);
        app.remove(collider);
      });
      this.colliders = [];
    }
    if (this.cMeshes) {
      this.cMeshes.forEach(cMesh => {
        this.remove(cMesh);
      });
      this.cMeshes = [];
    }

    console.log('SPAWNING MAP:');

    const start = new Date();
    const output = generateForest(
      meshes,
      data[(info + ' deep forest').trim()],
      data[(info + ' forest').trim()],
      data[(info + ' stone ground').trim()],
      data[(info + ' grass').trim()],
      data[(info + ' sand').trim()],
      data[(info + ' water').trim()],
      data[(info + ' tree').trim()],
      data[(info + ' rock').trim()],
      data[(info + ' flower').trim()],
      data[(info + ' bush').trim()],
      data[(info + ' sand bush').trim()],
      data[(info + ' torch').trim()],
      info,
      physics,
      app,
      localPlayer,
      () => {
        console.log('moving map:', this.generating);
        if (this.generating) {
          return;
        }

        this.generating = true;
        this.generateMapFull(meshes, data, info, physics, app, localPlayer);
        this.generating = false;
      },
    );
    console.log(
      'MAP SPAWNED:',
      new Date() - start,
      'meshes count:',
      output.meshes.length,
      output.meshes,
    );

    output.meshes.map(f => {
      this.add(f);
      this.cMeshes.push(f);
      f.updateMatrixWorld();
    });
    this.allMeshes = output.allMeshes;

    this.colliders = output.colliders;
    this.spot = output.spot;
  }

  sleep = ms => {
    return new Promise(resolve => setTimeout(resolve, ms));
  };

  async regenerateTiles(tiles, biomeInfo, biomeType) {
    const textures = {};

    const start = new Date();
    let houseDone = false;
    let pathImg = null;
    const houseNumber = 4;
    const maxCount = 14 + houseNumber - 1;
    let currentTiles = 0;

    for (let i = 0; i < tiles.length; i++) {
      textures[tiles[i]] = [];
    }

    for (let i = 0; i < tiles.length; i++) {
      for (let j = 0; j < 1; j++) {
        if (tiles[i].includes('tree')) {
          generateImageNew(biomeInfo + ' tree').then(imgs => {
            textures[tiles[i]].push(imgs[0]);
            textures[tiles[i]].push(imgs[1]);
            currentTiles++;
          });
        } else if (tiles[i].includes('house')) {
          if (houseDone) {
            continue;
          }

          houseDone = true;
          for (let i = 0; i < houseNumber; i++) {
            generateImageNew(biomeInfo + ' house').then(imgs => {
              console.log('generating house');
              currentTiles++;
              console.log('images:', imgs.length);
              textures[tiles[11]].push(imgs[0]);
              textures[tiles[12]].push(imgs[1]);
              textures[tiles[13]].push(imgs[2]);
              textures[tiles[14]].push(imgs[3]);
              textures[tiles[15]].push(imgs[4]);
              textures[tiles[16]].push(imgs[5]);
              textures[tiles[17]].push(imgs[6]);
              textures[tiles[18]].push(imgs[7]);
              textures[tiles[19]].push(imgs[8]);
            });
          }
        } else {
          let prompt = tiles[i];

          if (prompt.includes('path')) {
            if (pathImg) {
              continue;
            }

            pathImg = true;
            generateImageCache('path misc', biomeType).then(img => {
              console.log('generating path');
              currentTiles++;
              textures[tiles[20]].push(img);
              textures[tiles[21]].push(img);
              textures[tiles[22]].push(img);
              textures[tiles[23]].push(img);
              textures[tiles[24]].push(img);
              textures[tiles[25]].push(img);
              textures[tiles[26]].push(img);
              textures[tiles[27]].push(img);
              textures[tiles[28]].push(img);
              textures[tiles[29]].push(img);
              textures[tiles[30]].push(img);
              textures[tiles[31]].push(img);
              textures[tiles[32]].push(img);
              textures[tiles[33]].push(img);
            });
          } else {
            console.log('prompt:', prompt, typeof prompt);
            if (
              prompt.includes('bush') ||
              prompt.includes('flower') ||
              prompt.includes('rock') ||
              prompt.includes('torch')
            ) {
              generateImageNew(prompt).then(img => {
                console.log('generating biome.tiles[i]', tiles[i]);
                currentTiles++;
                textures[tiles[i]].push(img);
              });
            } else {
              generateImageCache(prompt, biomeType).then(img => {
                console.log('generating biome.tiles[i]', tiles[i]);
                currentTiles++;
                textures[tiles[i]].push(img);
              });
            }
          }
        }
      }
    }

    while (currentTiles < maxCount) {
      console.log('current tiles:', currentTiles, '/', maxCount);
      await this.sleep(50);
    }

    const timeDiff = new Date() - start;
    console.log('Execution time: %dms', timeDiff);
    console.log('regeneration done');

    const _tiles = [];
    for (const [key, value] of Object.entries(textures)) {
      for (let i = 0; i < value.length; i++) {
        _tiles.push(value[i]);
      }
    }

    const assetManager = await AssetManagerForest.loadUrls(_tiles);

    for (const [key, value] of Object.entries(textures)) {
      for (let j = 0; j < value.length; j++) {
        for (let i = 0; i < assetManager.textures.length; i++) {
          if (value[j] == assetManager.textures[i].source.data.currentSrc) {
            textures[key][j] = assetManager.textures[i];
            break;
          }
        }
      }
    }

    const data = {};

    for (const [key, value] of Object.entries(textures)) {
      data[key] = [];
      for (let i = 0; i < value.length; i++) {
        data[key].push({name: key + '_' + i, texture: value[i]});
      }
    }
    //set the new texture to the material
    for (let i = 0; i < this.allMeshes.length; i++) {
      for (const [key, value] of Object.entries(data)) {
        const n = this.allMeshes[i].type
          .toLowerCase()
          .replace('_', '')
          .replace(/[0-9]/g, '');
        const k = key.toLowerCase();

        if (n.includes(k)) {
          if (n.includes('tree')) {
            this.allMeshes[i].mesh.material.map =
              value[this.allMeshes[i].type.includes('0_1') ? 1 : 0].texture;
          } else {
            this.allMeshes[i].mesh.material.map =
              value[randomIntFromInterval(0, value.length - 1)].texture;
          }
          break;
        }
      }
    }
  }

  async waitForLoad(
    type,
    length,
    textures,
    info,
    tempTiles,
    physics,
    app,
    localPlayer,
  ) {
    this.tempTiles = tempTiles;
    this.biomeInfo = info;
    //const tiles = this.loadTiles(type, length);
    const _tiles = textures ? [] : tiles;
    if (textures) {
      for (const [key, value] of Object.entries(textures)) {
        for (let i = 0; i < value.length; i++) {
          _tiles.push(value[i]);
        }
      }
    }
    const assetManager = await AssetManagerForest.loadUrls(_tiles);

    for (const [key, value] of Object.entries(textures)) {
      for (let j = 0; j < value.length; j++) {
        for (let i = 0; i < assetManager.textures.length; i++) {
          if (value[j] == assetManager.textures[i].source.data.currentSrc) {
            textures[key][j] = assetManager.textures[i];
            break;
          }
        }
      }
    }
    this.generate(
      type,
      assetManager,
      textures,
      info,
      physics,
      app,
      localPlayer,
    );
  }
}

function randomIntFromInterval(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}
