import * as THREE from 'three';
import {TEXTURE_ASSET} from './libs/utils/assets.js';

// this file's base url
const BASE_URL = import.meta.url.replace(/(\/)[^\/\\]*$/, '$1');

const textureLoader = new THREE.TextureLoader();

const _loadTexture = key =>
  new Promise((accept, reject) => {
    // TODO : use ktx2 loader instead
    if (TEXTURE_ASSET[key].file_url) {
      textureLoader.load(
        TEXTURE_ASSET[key].file_url,
        t => {
          TEXTURE_ASSET[key].texture = t;
          TEXTURE_ASSET[key].texture.encoding = THREE.sRGBEncoding;
          accept(t);
        },
        function onProgress() {},
        err => {
          console.error('Asset manager : Loading texture failed : ', err);
        },
      );
    } else {
      textureLoader.load(
        `${BASE_URL}${TEXTURE_ASSET[key].path}${key}${TEXTURE_ASSET[key].ext}`,
        t => {
          TEXTURE_ASSET[key].texture = t;
          TEXTURE_ASSET[key].texture.encoding = THREE.sRGBEncoding;
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
  constructor() {
    this.data = null;
  }

  async load() {
    await Promise.all(Object.keys(TEXTURE_ASSET).map(_loadTexture));
    this.data = TEXTURE_ASSET;
    return TEXTURE_ASSET;
  }
}
