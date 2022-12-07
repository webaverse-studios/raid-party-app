import metaversefile from 'metaversefile';
import * as THREE from 'three';
import AssetManager from './AssetManager.js';
import {SNAP_SIZE, TILE_SIZE} from './Constants.js';
import {
  Direction,
  generate,
  generateNext,
  TileLayer,
  TileType,
} from './libs/generate/index.js';
import {Data, Textures} from './libs/utils/index.js';
import {Grid, IDAStarFinder} from './libs/pathfinder/index.js';

const {useLocalPlayer} = metaversefile;

export default class Dungeon {
  constructor() {
    this.assets = null;

    //
    // dungeons
    //
    this.dungeon = null;
    this.oldDungeon = null;
    this.tempDungeon = null;

    //
    // Groups
    //
    this.pivot = new THREE.Object3D();

    this.group = new THREE.Object3D();
    this.pivot.add(this.group);
    this.group.updateMatrixWorld();

    this.oldGroup = new THREE.Object3D();
    this.pivot.add(this.oldGroup);
    this.oldGroup.updateMatrixWorld();

    this.tempGroup = new THREE.Object3D();
    this.pivot.add(this.tempGroup);
    this.tempGroup.updateMatrixWorld();

    this.playerPosition = new THREE.Vector3();
  }

  async waitForLoad() {
    const assetManager = new AssetManager();
    this.assets = await assetManager.load();
    const newDungeon = generate({
      mapWidth: 40,
      mapHeight: 20,
      mapGutterWidth: 2,
      iterations: 15,
      containerMinimumSize: 4,
      containerMinimumRatio: 0.45,
      containerSplitRetries: 30,
      corridorWidth: 4,
      tileWidth: 32,
      seed: '5ML3875MwgFzyejjoFV9i',
      debug: false,
      rooms: Data.loadRooms(),
    });
    this.drawDungeon(newDungeon);
  }

  drawDungeon(dungeon) {
    this.oldDungeon = JSON.parse(JSON.stringify(this.dungeon));
    this.dungeon = JSON.parse(JSON.stringify(dungeon));

    // Clear old group
    this.oldGroup.children.forEach(node => {
      node?.geometry?.dispose();
      node?.material?.dispose();
      this.oldGroup.remove(node);
      node.updateMatrixWorld();
    });
    this.oldGroup.children = [];
    this.oldGroup.updateMatrixWorld();

    // Move group into old group
    this.oldGroup.copy(this.group, true);
    this.group.updateMatrixWorld();
    this.oldGroup.updateMatrixWorld();

    // Clear group
    this.group.children.forEach(node => {
      node?.geometry?.dispose();
      node?.material?.dispose();
      this.group.remove(node);
      node.updateMatrixWorld();
    });
    this.group.children = [];
    this.group.updateMatrixWorld();

    // Draw
    this.drawTiles(dungeon.layers.tiles, Textures.tilesTextures(this.assets));
    this.drawProps(dungeon.layers.props, Textures.propsTextures(this.assets));
    this.drawMonsters(
      dungeon.layers.monsters,
      Textures.monstersTextures(this.assets),
    );
  }

  drawTiles = (tilemap, sprites) => {
    for (let y = 0; y < tilemap.length; y++) {
      for (let x = 0; x < tilemap[y].length; x++) {
        const id = tilemap[y][x];
        const texture = sprites[id];
        if (texture) {
          const geometry = new THREE.PlaneGeometry(TILE_SIZE, TILE_SIZE, 1, 1);
          geometry.rotateX(-Math.PI / 2);
          const material = new THREE.MeshStandardMaterial({
            map: texture,
            transparent: true,
          });
          const sprite = new THREE.Mesh(geometry, material);
          sprite.userData = {
            x,
            y,
            type: id,
            layer: TileLayer.tiles,
          };
          sprite.position.set(x * TILE_SIZE, 0, y * TILE_SIZE);
          this.group.add(sprite);
          sprite.updateMatrixWorld();
        }
      }
    }
  };

  drawProps = (tilemap, sprites) => {
    for (let y = 0; y < tilemap.length; y++) {
      for (let x = 0; x < tilemap[y].length; x++) {
        const id = tilemap[y][x];
        if (id === 0) {
          continue;
        }
        const texture = sprites[id];
        if (texture) {
          const geometry = new THREE.PlaneGeometry(TILE_SIZE, TILE_SIZE, 1, 1);
          geometry.rotateX(-Math.PI / 2);
          const material = new THREE.MeshStandardMaterial({
            map: texture,
            transparent: true,
          });
          const sprite = new THREE.Mesh(geometry, material);
          sprite.userData = {
            x,
            y,
            type: id,
            layer: TileLayer.props,
          };
          sprite.position.set(x * TILE_SIZE, 0, y * TILE_SIZE);
          this.group.add(sprite);
          sprite.updateMatrixWorld();
        }
      }
    }
  };

  drawMonsters = (tilemap, sprites) => {
    for (let y = 0; y < tilemap.length; y++) {
      for (let x = 0; x < tilemap[y].length; x++) {
        const id = tilemap[y][x];
        if (id === 0) {
          continue;
        }
        const texture = sprites[id];
        if (texture) {
          const geometry = new THREE.PlaneGeometry(TILE_SIZE, TILE_SIZE, 1, 1);
          geometry.rotateX(-Math.PI / 2);
          const material = new THREE.MeshStandardMaterial({
            map: texture,
            transparent: true,
          });
          const sprite = new THREE.Mesh(geometry, material);
          sprite.userData = {
            x,
            y,
            type: id,
            layer: TileLayer.monsters,
          };
          sprite.position.set(x * TILE_SIZE, 0, y * TILE_SIZE);
          this.group.add(sprite);
          sprite.updateMatrixWorld();
        }
      }
    }
  };

  createNextDungeon() {
    // Detect door in current dungeon
    let detectedDoor = this.getDoorPlayerArrived(this.dungeon, this.group);
    if (detectedDoor.arrived) {
      // Generate new dungeon
      const newDungeon = generateNext(this.dungeon, detectedDoor.direction);

      // Draw next dungeon
      this.drawDungeon(newDungeon);

      // Move group
      this.moveGroupByDoorDirection(detectedDoor.direction);

      // Create corridor to connect two dungeons
      this.createCorridorToConnectDungeons(detectedDoor);
    } else {
      // Detect door in old dungeon
      if (this.oldDungeon) {
        detectedDoor = this.getDoorPlayerArrived(
          this.oldDungeon,
          this.oldGroup,
        );

        if (detectedDoor.arrived) {
          // Exchange dungeon
          this.tempDungeon = JSON.parse(JSON.stringify(this.dungeon));
          this.dungeon = JSON.parse(JSON.stringify(this.oldDungeon));
          this.oldDungeon = this.tempDungeon;

          // Exchange group
          this.tempGroup.copy(this.group, true);
          this.group.copy(this.oldGroup, true);
          this.oldGroup.copy(this.tempGroup, true);

          this.tempGroup.updateMatrixWorld();
          this.group.updateMatrixWorld();
          this.oldGroup.updateMatrixWorld();

          // Clear temp group
          this.tempGroup.children.forEach(node => {
            node?.geometry?.dispose();
            node?.material?.dispose();
            this.tempGroup.remove(node);
            node.updateMatrixWorld();
          });
          this.tempGroup.children = [];
          this.tempGroup.updateMatrixWorld();

          // Generate new dungeon
          const newDungeon = generateNext(this.dungeon, detectedDoor.direction);

          // Draw next dungeon
          this.drawDungeon(newDungeon);

          // Move group
          this.moveGroupByDoorDirection(detectedDoor.direction);

          // Create corridor to connect two dungeons
          this.createCorridorToConnectDungeons(detectedDoor);
        }
      }
    }
  }

  getDoorPlayerArrived = (dungeon, group) => {
    const tilemap = dungeon.layers.tiles;
    let arrivedAtDoor = false;
    let rx = 0;
    let ry = 0;
    for (let y = 0; y < tilemap.length; y++) {
      for (let x = 0; x < tilemap[y].length; x++) {
        const id = tilemap[y][x];
        if (id === TileType.Door) {
          const dx = Math.abs(
            this.playerPosition.x - (group.position.x + x * TILE_SIZE),
          );
          const dy = Math.abs(
            this.playerPosition.z - (group.position.z + y * TILE_SIZE),
          );
          if (dx < SNAP_SIZE && dy < SNAP_SIZE) {
            arrivedAtDoor = true;
            rx = x;
            ry = y;
            break;
          }
        }
      }
      if (arrivedAtDoor) {
        break;
      }
    }

    // detect direction of door
    const top = ry + 1;
    const right = dungeon.width - rx;
    const bottom = dungeon.height - ry;
    const left = rx + 1;
    const min = Math.min(top, right, bottom, left);
    let dir = Direction.up;
    switch (min) {
      case top:
        dir = Direction.up;
        break;
      case right:
        dir = Direction.right;
        break;
      case bottom:
        dir = Direction.down;
        break;
      case left:
        dir = Direction.left;
        break;
      default:
        break;
    }

    return {arrived: arrivedAtDoor, x: rx, y: ry, direction: dir};
  };

  moveGroupByDoorDirection(direction) {
    switch (direction) {
      case Direction.up:
        this.group.position.z =
          this.oldGroup.position.z - this.dungeon.height * TILE_SIZE;
        this.group.updateMatrixWorld();
        break;
      case Direction.right:
        this.group.position.x =
          this.oldGroup.position.x + this.dungeon.width * TILE_SIZE;
        this.group.updateMatrixWorld();
        break;
      case Direction.down:
        this.group.position.z =
          this.oldGroup.position.z + this.dungeon.height * TILE_SIZE;
        this.group.updateMatrixWorld();
        break;
      case Direction.left:
        this.group.position.x =
          this.oldGroup.position.x - this.dungeon.width * TILE_SIZE;
        this.group.updateMatrixWorld();
        break;

      default:
        break;
    }
  }

  createCorridorToConnectDungeons(detectedDoor) {
    //
    // Connected two dungeon's tiles
    //
    let mergedTiles = [];
    const doorPosition = {
      x: detectedDoor.x,
      y: detectedDoor.y,
    };
    const dungeonRect = {
      min_x: 0,
      min_y: 0,
      max_x: this.dungeon.width - 1,
      max_y: this.dungeon.height - 1,
    };
    const oldDungeonRect = {
      min_x: 0,
      min_y: 0,
      max_x: this.dungeon.width - 1,
      max_y: this.dungeon.height - 1,
    };
    switch (detectedDoor.direction) {
      case Direction.up:
        mergedTiles = [...this.dungeon.layers.tiles];
        mergedTiles = mergedTiles.concat(this.oldDungeon.layers.tiles);
        doorPosition.y = doorPosition.y + this.dungeon.height;
        oldDungeonRect.min_y = this.dungeon.height;
        oldDungeonRect.max_y = this.dungeon.height * 2 - 1;
        break;
      case Direction.right:
        mergedTiles = [...this.oldDungeon.layers.tiles];
        for (let i = 0; i < mergedTiles.length; i++) {
          mergedTiles[i] = mergedTiles[i].concat(this.dungeon.layers.tiles[i]);
        }
        dungeonRect.min_x = this.oldDungeon.width;
        dungeonRect.max_x = this.oldDungeon.width * 2 - 1;
        break;
      case Direction.down:
        mergedTiles = [...this.oldDungeon.layers.tiles];
        mergedTiles = mergedTiles.concat(this.dungeon.layers.tiles);
        dungeonRect.min_y = this.oldDungeon.height;
        dungeonRect.max_y = this.oldDungeon.height * 2 - 1;
        break;
      case Direction.left:
        mergedTiles = [...this.dungeon.layers.tiles];
        for (let i = 0; i < mergedTiles.length; i++) {
          mergedTiles[i] = mergedTiles[i].concat(
            this.oldDungeon.layers.tiles[i],
          );
        }
        doorPosition.x = doorPosition.x + this.dungeon.width;
        oldDungeonRect.min_x = this.dungeon.width;
        oldDungeonRect.max_x = this.dungeon.width * 2 - 1;
        break;
      default:
        break;
    }

    //
    // Find nearest door in dungeon
    //
    let minDistance = Number.MAX_SAFE_INTEGER;
    const nearestDoorPosition = {
      x: 0,
      y: 0,
    };
    for (let _y = dungeonRect.min_y; _y <= dungeonRect.max_y; _y++) {
      for (let _x = dungeonRect.min_x; _x <= dungeonRect.max_x; _x++) {
        if (mergedTiles[_y][_x] === TileType.Door) {
          const distance = Math.sqrt(
            (doorPosition.x - _x) * (doorPosition.x - _x) +
              (doorPosition.y - _y) * (doorPosition.y - _y),
          );
          if (minDistance > distance) {
            minDistance = distance;
            nearestDoorPosition.x = _x;
            nearestDoorPosition.y = _y;
          }
        }
      }
    }

    //
    // Find path
    //
    const gridWidth = mergedTiles[0].length;
    const gridHeight = mergedTiles.length;
    const grid = new Grid(gridWidth, gridHeight);

    for (let y = 0; y < grid.height; y++) {
      for (let x = 0; x < grid.width; x++) {
        if (
          mergedTiles[y][x] === TileType.All ||
          mergedTiles[y][x] === TileType.Door
        ) {
          grid.setWalkableAt(x, y, true);
        } else {
          grid.setWalkableAt(x, y, false);
        }
      }
    }

    const finder = new IDAStarFinder();
    const path = finder.findPath(
      doorPosition.x,
      doorPosition.y,
      nearestDoorPosition.x,
      nearestDoorPosition.y,
      grid,
    );

    //
    // Update tiles according to path
    //
    for (let i = 0; i < path.length; i++) {
      const nodeX = path[i][0];
      const nodeY = path[i][1];

      // Update mergedTiles
      mergedTiles[nodeY][nodeX] = TileType.Ground;

      // Update tiles
      if (
        nodeY >= dungeonRect.min_y &&
        nodeY <= dungeonRect.max_y &&
        nodeX >= dungeonRect.min_x &&
        nodeX <= dungeonRect.max_x
      ) {
        const x = nodeX - dungeonRect.min_x;
        const y = nodeY - dungeonRect.min_y;

        // Update dungeon
        this.dungeon.layers.tiles[y][x] = TileType.Ground;

        // Remove old node
        for (let c = 0; c < this.group.children.length; c++) {
          const node = this.group.children[c];
          if (
            node.userData.layer === TileLayer.tiles &&
            x === node.userData.x &&
            y === node.userData.y
          ) {
            node?.geometry?.dispose();
            node?.material?.dispose();
            this.group.remove(node);
            node.updateMatrixWorld();
            break;
          }
        }
        this.group.updateMatrixWorld();

        // Add new node
        const geometry = new THREE.PlaneGeometry(TILE_SIZE, TILE_SIZE, 1, 1);
        geometry.rotateX(-Math.PI / 2);
        const material = new THREE.MeshStandardMaterial({
          map: Textures.tilesTextures(this.assets)[TileType.Ground],
          transparent: true,
        });
        const sprite = new THREE.Mesh(geometry, material);
        sprite.userData = {
          x,
          y,
          type: TileType.Ground,
          layer: TileLayer.tiles,
        };
        sprite.position.set(x * TILE_SIZE, 0, y * TILE_SIZE);
        this.group.add(sprite);
        sprite.updateMatrixWorld();
        this.group.updateMatrixWorld();
      } else {
        const x = nodeX - oldDungeonRect.min_x;
        const y = nodeY - oldDungeonRect.min_y;

        // Update old dungeon
        this.oldDungeon.layers.tiles[y][x] = TileType.Ground;

        // Remove old node
        for (let c = 0; c < this.oldGroup.children.length; c++) {
          const node = this.oldGroup.children[c];
          if (
            node.userData.layer === TileLayer.tiles &&
            x === node.userData.x &&
            y === node.userData.y
          ) {
            node?.geometry?.dispose();
            node?.material?.dispose();
            this.oldGroup.remove(node);
            node.updateMatrixWorld();
            break;
          }
        }
        this.oldGroup.updateMatrixWorld();

        // Add new node
        const geometry = new THREE.PlaneGeometry(TILE_SIZE, TILE_SIZE, 1, 1);
        geometry.rotateX(-Math.PI / 2);
        const material = new THREE.MeshStandardMaterial({
          map: Textures.tilesTextures(this.assets)[TileType.Ground],
          transparent: true,
        });
        const sprite = new THREE.Mesh(geometry, material);
        sprite.userData = {
          x,
          y,
          type: TileType.Ground,
          layer: TileLayer.tiles,
        };
        sprite.position.set(x * TILE_SIZE, 0, y * TILE_SIZE);
        this.oldGroup.add(sprite);
        sprite.updateMatrixWorld();
        this.oldGroup.updateMatrixWorld();
      }
    }
  }

  frame() {
    // update player position
    const localPlayer = useLocalPlayer();
    this.playerPosition.copy(localPlayer.position);

    // create next dungeon
    this.createNextDungeon();
  }
}
