import * as THREE from 'three';

const textureLoader = new THREE.TextureLoader();

const _loadTexture = u =>
  new Promise((accept, reject) => {
    if (typeof u !== 'string') {
      for (let i = 0; i < u.length; i++) {
        // TODO : use ktx2 loader instead
        textureLoader.load(
          u[i],
          t => {
            accept(t);
          },
          function onProgress() {},
          err => {
            console.error('Asset manager : Loading texture failed : ', err);
          },
        );
      }
    } else {
      textureLoader.load(
        u,
        t => {
          accept(t);
        },
        function onProgress() {},
        err => {
          console.error('Asset manager : Loading texture failed : ', err);
        },
      );
    }
  });

export default class AssetManager {
  constructor(textures) {
    this.textures = textures;
  }

  static async loadUrls(urls) {
    const assets = await Promise.all(urls.map(_loadTexture));
    const d = assets[0].source.data.src.split('/');
    const manager = new AssetManager(assets);
    return manager;
  }
}
