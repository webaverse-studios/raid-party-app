import {DataTexture, TextureLoader} from 'three';
import raycastManager from '../raycast-manager';

class TilemapManager extends EventTarget {
  constructor() {
    super();

    this.textureLoader = new TextureLoader();

    this.currentAction = null;

    this.currentTexture = null;

    // Tile meshes
    this.tiles = [];

    this.addEventListener('updateTile', this.updateTile.bind(this));
    this.addEventListener('setTileData', this.setTileData.bind(this));
  }

  setTiles(tiles) {
    this.tiles = tiles;
  }

  setAction(action) {
    this.currentAction = action;
  }

  setTileData(event) {
    const tileData = event.data;

    this.currentTexture = new DataTexture(
      tileData.data,
      tileData.width,
      tileData.height,
    );
    this.currentTexture.flipY = true;
    this.currentTexture.needsUpdate = true;
  }

  updateTile() {
    if (this.currentAction === 'stamp') {
      if (this.currentTexture) {
        if (raycastManager.intersects.length > 0) {
          const mesh = raycastManager.intersects[0].object;
          mesh.material.map = this.currentTexture;
          mesh.material.needsUpdate = true;
        }
      }
    }
  }
}

const tilemapManager = new TilemapManager();
export default tilemapManager;
