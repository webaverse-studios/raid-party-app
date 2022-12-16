import {TILE_AMOUNT, TILE_SIZE} from './tiles';
import Perlin from './utils/perlinNoise';
import {BufferedCubicNoise} from './utils/bufferedCubicNoise';
import PF from 'pathfinding';
import * as THREE from 'three';
import physicsManager from '../../../physics-manager.js';

let addedAroundColliders = false;
//move the generation into a test script, to log 10s map
//remove object spawn from the start that is random
//get locations that are 2x2 or 3x3 and spawn trees
//get random locations afterwords to spawn other objects too
export default function generateForest(
  _meshes,
  deepForestTiles,
  forestTiles,
  stoneTiles,
  grassTiles,
  sandTiles,
  waterTiles,
  treeTiles,
  rockTiles,
  flowerTiles,
  bushNormalTiles,
  bushSandTiles,
  torchTiles,
  info,
  physics,
  app,
  localPlayer,
  moveMap,
) {
  let generatingMap = false;
  app.addEventListener('triggerin', async e => {
    if (
      e.oppositePhysicsId ===
      localPlayer.characterPhysics.characterController.physicsId
    ) {
      console.log('local player trigger in');
      if (!generatingMap) {
        generatingMap = true;
        await moveMap();
        generatingMap = false;
      }
    }
  });
  app.addEventListener('triggerout', async e => {
    if (
      e.oppositePhysicsId ===
      localPlayer.characterPhysics.characterController.physicsId
    ) {
      console.log('local player trigger out');
    }
  });

  const multipliers = {};
  multipliers['trees'] = 0.75;
  multipliers['rocks'] = 1;
  multipliers['stones'] = 1;
  multipliers['flowers'] = 1;
  multipliers['bush_normal'] = 1;
  multipliers['bush_sand'] = 1;

  const addRandomPath = true;
  const addRandomTrees = true;
  const allPaths = [];

  const monsterTiles = [
    'sprite_200',
    'sprite_201',
    'sprite_202',
    'sprite_203',
    'sprite_204',
    'sprite_205',
  ];

  const pn = new Perlin();
  const cubicNoise = new BufferedCubicNoise(TILE_AMOUNT, TILE_AMOUNT);
  const mapArr = {};
  const allMeshes = [];
  const props = [];
  const colliders = [];

  const scales = [40, 10];
  const persistance = [1, 0.2];
  const range = 100;

  const meshes = [];
  run();

  function run() {
    init(0);
  }

  function addCollider(y, x, setTrigger = false) {
    const physicsObject = physics.addBoxGeometry(
      new THREE.Vector3(
        (y - TILE_AMOUNT / 2) * TILE_SIZE,
        0,
        (x - TILE_AMOUNT / 2) * TILE_SIZE,
      ),
      new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, Math.PI / 2)),
      new THREE.Vector3(0.5, 0.5, 0.5),
      false,
    );
    if (setTrigger) {
      physicsManager.getScene().setTrigger(physicsObject.physicsId);
    }
    app.add(physicsObject);
    colliders.push(physicsObject);
  }

  function addProp(type, x, y) {
    if (!mapArr[y]) {
      mapArr[y] = {};
    }

    mapArr[y][x] = type == 'flower' ? 0 : 1;

    props.push({type, x: y, y: x});

    let prop =
      type === 'tree'
        ? treeTiles[Math.floor(Math.random() * treeTiles.length)]
        : type === 'stone' || type === 'rock'
        ? rockTiles[Math.floor(Math.random() * rockTiles.length)]
        : type === 'flower'
        ? flowerTiles[Math.floor(Math.random() * flowerTiles.length)]
        : type === 'bush_normal'
        ? bushNormalTiles[Math.floor(Math.random() * bushNormalTiles.length)]
        : type === 'bush_sand'
        ? bushSandTiles[Math.floor(Math.random() * bushSandTiles.length)]
        : torchTiles[Math.floor(Math.random() * torchTiles.length)];

    let prop2 = '';
    if (type === 'tree' && prop.split('_').length - 1 === 2) {
      prop2 = prop.trim().slice(0, -1) + '1';
      //swap prop2 with prop
      let temp = prop;
      prop = prop2;
      prop2 = temp;

      while (prop2 === prop) {
        const letter = prop.endsWith('1') ? '0' : '1';
        prop = prop.slice(0, -1) + letter;
        //swap prop2 with prop
        let temp = prop;
        prop = prop2;
        prop2 = temp;
      }
    }

    const cloneTreeMesh = _meshes[prop].clone();
    cloneTreeMesh.position.set(
      (y - TILE_AMOUNT / 2) * TILE_SIZE,
      type === 'flower' ? 0.005 : 0.01,
      (x - TILE_AMOUNT / 2) * TILE_SIZE,
    );

    if (type !== 'flower' && type !== 'torch') {
      addCollider(y, x);
    }

    meshes.push(cloneTreeMesh);
    allMeshes.push({type: prop, x, y, mesh: cloneTreeMesh});

    if (prop2) {
      addSecondPart(x, y, prop2);
    }
  }

  function addSecondPart(x, y, treeSprite) {
    const cloneMesh = _meshes[treeSprite].clone();
    x -= 1;

    cloneMesh.position.set(
      (y - TILE_AMOUNT / 2) * TILE_SIZE,
      0.25,
      (x - TILE_AMOUNT / 2) * TILE_SIZE,
    );
    props.push({type: treeSprite, x: y, y: x});
    allMeshes.push({type: treeSprite, x, y, mesh: cloneMesh});
    meshes.push(cloneMesh);
  }

  function addLayers(n1, n2) {
    const sum = n1 * persistance[0] + n2 * persistance[1];
    const max = range * persistance[0] + range * persistance[1];
    return Math.round(map(sum, 0, max, 0, range));
  }
  function map(n, start1, stop1, start2, stop2) {
    return ((n - start1) / (stop1 - start1)) * (stop2 - start2) + start2;
  }

  function init(i) {
    for (let x = i; x < TILE_AMOUNT + i; x++) {
      for (let y = i; y < TILE_AMOUNT + i; y++) {
        if (!mapArr[y]) {
          mapArr[y] = {};
        }

        const n1 = Math.round(
          pn.noise(x / scales[0], y / scales[0], 0) * range,
        );
        const n2 = Math.round(
          pn.noise(x / scales[1], y / scales[1], 0) * range,
        );
        const num = addLayers(n1, n2);

        let tileName = '';

        if (num <= 20) {
          mapArr[y][x] = 0;
          tileName =
            deepForestTiles[Math.floor(Math.random() * deepForestTiles.length)];

          const rnd = Math.random();
          if (rnd < 0.05 * multipliers['bush_normal']) {
            addProp('bush_normal', x, y);
          } else if (rnd < 0.5 * multipliers['flowers']) {
            addProp('flower', x, y);
          }
        } else if (num <= 35) {
          mapArr[y][x] = 0;
          tileName = stoneTiles[Math.floor(Math.random() * stoneTiles.length)];

          const rnd = Math.random();
          if (rnd < 0.1 * multipliers['rocks']) {
            addProp('stone', x, y);
          }
        } else if (num <= 40) {
          mapArr[y][x] = 0;
          tileName =
            forestTiles[Math.floor(Math.random() * forestTiles.length)];

          const rnd = Math.random();
          if (rnd < 0.075 * multipliers['rocks']) {
            addProp('stone', x, y);
          } else if (rnd < 0.4 * multipliers['flowers']) {
            addProp('flower', x, y);
          }
        } else if (num <= 69) {
          mapArr[y][x] = 0;
          tileName = grassTiles[Math.floor(Math.random() * grassTiles.length)];
          const rnd = Math.random();
          if (rnd < 0.1 * multipliers['bush_normal']) {
            addProp('bush_normal', x, y);
          } else if (rnd < 0.75 * multipliers['flowers']) {
            addProp('flower', x, y);
          }
        } else if (num <= 73) {
          mapArr[y][x] = 0;
          tileName = sandTiles[Math.floor(Math.random() * sandTiles.length)];
          const rnd = Math.random();
          if (rnd < 0.1 * multipliers['rocks']) {
            addProp('rock', x, y);
          } else if (rnd < 0.0125 * multipliers['bush_sand']) {
            addProp('bush_sand', x, y);
          }
        } else {
          mapArr[y][x] = 1;
          addCollider(y, x);
          tileName = waterTiles[Math.floor(Math.random() * waterTiles.length)];
        }

        if (!tileName) {
          console.log("couldn't get tile name");
        } else {
          const cloneMesh = _meshes[tileName].clone();
          cloneMesh.position.set(
            (y - TILE_AMOUNT / 2) * TILE_SIZE,
            0,
            (x - TILE_AMOUNT / 2) * TILE_SIZE,
          );
          meshes.push(cloneMesh);
          allMeshes.push({type: tileName, x: y, y: x, mesh: cloneMesh});
        }
      }
    }

    let str = '';
    for (const x in mapArr) {
      for (const y in mapArr[x]) {
        str += mapArr[x][y] + ' ';
      }
      str += '\n';
    }

    const upStraight = info + ' path Up Straight_0';
    const downStraight = info + ' path Down Straight_0';
    const upLeft = info + ' path Up Left_0';
    const upRight = info + ' path Up Right_0';
    const downLeft = info + ' path Down Left_0';
    const downRight = info + ' path Down Right_0';
    const upEnd = info + ' path Up End_0';
    const pathMiddle = info + ' path Middle_0';
    const rightStraight = info + ' path Right Straight_0';
    const leftStraight = info + ' path Left Straight_0';
    const downEnd = info + ' path Down End_0';
    const miscPath = info + ' path Misc_0';
    const rightEnd = info + ' path Right End_0';
    const leftEnd = info + ' path Left End_0';

    /*  const upStraight = 'sprite_211';
    const downStraight = 'sprite_211';
    const upLeft = 'sprite_206';
    const upRight = 'sprite_207';
    const downLeft = 'sprite_208';
    const downRight = 'sprite_213';
    const upEnd = 'sprite_210';
    const pathMiddle = 'sprite_213';
    const rightStraight = 'sprite_211';
    const leftStraight = 'sprite_211';
    const downEnd = 'sprite_212';
    const miscPath = 'sprite_213';
    const rightEnd = 'sprite_214';
    const leftEnd = 'sprite_215';*/

    let path = [];

    const treeAreas = [];
    for (let i = 0; i < TILE_AMOUNT; i++) {
      for (let j = 0; j < TILE_AMOUNT; j++) {
        const x = j;
        const y = i;
        if (mapArr[x][y] === 0) {
          try {
            if (
              mapArr[x][y + 1] === 0 &&
              mapArr[x][y + 2] === 0 &&
              mapArr[x + 1][y] === 0 &&
              mapArr[x + 1][y + 1] === 0 &&
              mapArr[x + 1][y + 2] === 0 &&
              mapArr[x + 2][y] === 0 &&
              mapArr[x + 2][y + 1] === 0 &&
              mapArr[x + 2][y + 2] === 0
            ) {
              treeAreas.push([x, y]);
            }
          } catch (e) {}
        }
      }
    }

    let treeAreasFiltered = treeAreas.filter((area, index) => {
      return treeAreas.every((area2, index2) => {
        if (index === index2) return true;
        return !(
          area[0] >= area2[0] &&
          area[0] <= area2[0] + 2 &&
          area[1] >= area2[1] &&
          area[1] <= area2[1] + 2
        );
      });
    });

    //remove some houses randomly
    treeAreasFiltered = treeAreasFiltered.filter((area, index) => {
      return Math.random() < 0.65;
    });

    treeAreasFiltered.forEach(area => {
      const i = area[1];
      const j = area[0];

      const locs = [
        [i + 1, j],
        [i + 1, j + 1],
        [i + 1, j + 2],
        [i + 2, j],
        [i + 2, j + 1],
        [i + 2, j + 2],
      ];

      for (let i = 0; i < locs.length; i++) {
        addProp('tree', locs[i][0], locs[i][1]);
      }
    });

    if (addRandomTrees) {
      for (let i = 0; i < TILE_AMOUNT; i++) {
        for (let j = 0; j < TILE_AMOUNT; j++) {
          const x = j;
          const y = i;
          if (mapArr[x][y] === 0) {
            const rnd = Math.random();
            if (rnd < 0.05) {
              addProp('tree', y, x);
            }
          }
        }
      }
    }

    const grid = new PF.Grid(TILE_AMOUNT, TILE_AMOUNT);
    for (let x = 0; x < TILE_AMOUNT; x++) {
      for (let y = 0; y < TILE_AMOUNT; y++) {
        grid.setWalkableAt(y, x, mapArr[y][x] === 0);
      }
    }
    const finder = new PF.AStarFinder();

    if (addRandomPath) {
      let tries = 0;
      while (path.length <= 4) {
        if (tries > 5) {
          break;
        }

        tries++;
        const randomPoint = () => {
          let x = Math.floor(Math.random() * TILE_AMOUNT);
          let y = Math.floor(Math.random() * TILE_AMOUNT);

          while (mapArr[y][x] == 1) {
            x = Math.floor(Math.random() * TILE_AMOUNT);
            y = Math.floor(Math.random() * TILE_AMOUNT);
          }

          return {x, y};
        };

        const start = randomPoint();
        let end = randomPoint();
        while (end === start) {
          end = randomPoint();
        }

        //find path using astar
        path = finder.findPath(start.y, start.x, end.y, end.x, grid.clone());

        if (path && path.length > 4) {
          allPaths.push(path);
          //asign spriutes to each path tile, according ot next one
          for (let i = 0; i < path.length; i++) {
            const x = path[i][1];
            const y = path[i][0];
            mapArr[y][x] = 1;
            grid.setWalkableAt(y, x, false);

            let spriteName = '';
            if (i === 0) {
              //first tile
              if (path[i + 1][1] === x) {
                //straight
                spriteName = upStraight;
              } else if (path[i + 1][1] > x) {
                //right
                spriteName = upLeft;
              } else {
                //left
                spriteName = upRight;
              }
            } else if (i === path.length - 1) {
              //last tile
              if (path[i - 1][1] === x) {
                //straight
                spriteName = downStraight;
              } else if (path[i - 1][1] > x) {
                //right
                spriteName = downLeft;
              } else {
                //left
                spriteName = downRight;
              }
            } else {
              //middle tile
              if (path[i - 1][1] === x && path[i + 1][1] === x) {
                //straight
                spriteName = upStraight;
              } else if (path[i - 1][1] === x && path[i + 1][1] > x) {
                //right
                spriteName = upLeft;
              } else if (path[i - 1][1] === x && path[i + 1][1] < x) {
                //left
                spriteName = upRight;
              } else if (path[i - 1][1] > x && path[i + 1][1] === x) {
                //right
                spriteName = downLeft;
              } else if (path[i - 1][1] < x && path[i + 1][1] === x) {
                //left
                spriteName = downRight;
              } else if (path[i - 1][1] > x && path[i + 1][1] > x) {
                //right
                spriteName = upEnd;
              } else if (path[i - 1][1] < x && path[i + 1][1] < x) {
                //left
                spriteName = upEnd;
              }
            }

            if (!spriteName) {
              spriteName = pathMiddle;
            }

            const cloneMesh = _meshes[spriteName].clone();
            cloneMesh.position.set(
              (y - TILE_AMOUNT / 2) * TILE_SIZE,
              0.05,
              (x - TILE_AMOUNT / 2) * TILE_SIZE,
            );
            meshes.push(cloneMesh);
            allMeshes.push({type: spriteName, x: y, y: x, mesh: cloneMesh});
          }
        }
      }
    }

    //find areas inside the map with 0s that a house can be placed
    const houseAreas = [];
    for (let i = 0; i < TILE_AMOUNT; i++) {
      for (let j = 0; j < TILE_AMOUNT; j++) {
        const x = j;
        const y = i;
        if (mapArr[x][y] === 0) {
          try {
            if (
              mapArr[x][y + 1] === 0 &&
              mapArr[x][y + 2] === 0 &&
              mapArr[x + 1][y] === 0 &&
              mapArr[x + 1][y + 1] === 0 &&
              mapArr[x + 1][y + 2] === 0 &&
              mapArr[x + 2][y] === 0 &&
              mapArr[x + 2][y + 1] === 0 &&
              mapArr[x + 2][y + 2] === 0
            ) {
              houseAreas.push([x, y]);
            }
          } catch (e) {}
        }
      }
    }

    //remove overlapping areas
    let houseAreasFiltered = houseAreas.filter((area, index) => {
      return houseAreas.every((area2, index2) => {
        if (index === index2) return true;
        return !(
          area[0] >= area2[0] &&
          area[0] <= area2[0] + 2 &&
          area[1] >= area2[1] &&
          area[1] <= area2[1] + 2
        );
      });
    });

    //remove the houses that are too close together
    houseAreasFiltered = houseAreasFiltered.filter((area, index) => {
      return houseAreasFiltered.every((area2, index2) => {
        if (index === index2) return true;
        return !(
          area[0] >= area2[0] - 2 &&
          area[0] <= area2[0] + 4 &&
          area[1] >= area2[1] - 2 &&
          area[1] <= area2[1] + 4
        );
      });
    });

    //remove some houses randomly
    houseAreasFiltered = houseAreasFiltered.filter((area, index) => {
      return Math.random() < 0.5;
    });

    const houseUpLeft = info + ' house Up Left_0';
    const houseUpMiddle = info + ' house Up Middle_0';
    const houseUpRight = info + ' house Up Right_0';
    const houseMiddleLeft = info + ' house Middle Left_0';
    const houseMiddleMiddle = info + ' house Middle Middle_0';
    const houseMiddleRight = info + ' house Middle Right_0';
    const houseDownLeft = info + ' house Down Left_0';
    const houseDownMiddle = info + ' house Down Middle_0';
    const houseDownRight = info + ' house Down Right_0';

    const resHouses = [];
    //place houses in the areas
    houseAreasFiltered.forEach(area => {
      const i = area[1];
      const j = area[0];

      const locs = [
        [i, j],
        [i, j + 1],
        [i, j + 2],
        [i + 1, j],
        [i + 1, j + 1],
        [i + 1, j + 2],
        [i + 2, j],
        [i + 2, j + 1],
        [i + 2, j + 2],
      ];
      const sprites = [
        houseUpLeft,
        houseUpMiddle,
        houseUpRight,
        houseMiddleLeft,
        houseMiddleMiddle,
        houseMiddleRight,
        houseDownLeft,
        houseDownMiddle,
        houseDownRight,
      ];

      const doorIndex = 7;
      const door = [locs[doorIndex][1], locs[doorIndex][0]];
      let hasCollider = false;
      try {
        hasCollider = mapArr[door[1] + 1][door[0]] === 1;
      } catch (e) {
        hasCollider = true;
      }

      if (hasCollider) {
        return;
      }

      for (let i = 0; i < locs.length; i++) {
        //check the tile below door if it has a collider
        mapArr[locs[i][1]][locs[i][0]] = i < 3 ? 0 : 1;
        grid.setWalkableAt(locs[i][1], locs[i][0], i < 3);

        const cloneMesh = _meshes[sprites[i]].clone();
        cloneMesh.position.set(
          (locs[i][1] - TILE_AMOUNT / 2) * TILE_SIZE,
          i < 3 ? 0.25 : 0.2,
          (locs[i][0] - TILE_AMOUNT / 2) * TILE_SIZE,
        );
        if (i >= 3) {
          addCollider(locs[i][1], locs[i][0]);
        }
        meshes.push(cloneMesh);

        if (i === doorIndex) {
          resHouses.push([locs[i][1], locs[i][0]]);
        }
      }
    });

    let tries = 0;
    let _paths = [];
    while (_paths.length < 2) {
      if (tries > 5) {
        break;
      }
      tries++;
      for (let i = 0; i < resHouses.length - 2; i += 2) {
        const start = resHouses[i];
        const end = resHouses[i + 1];

        //get one tile down from the start and end
        let path = null;
        try {
          const startDown = [start[0], start[1] + 1];
          const endDown = [end[0], end[1] + 1];
          path = finder.findPath(
            startDown[0],
            startDown[1],
            endDown[0],
            endDown[1],
            grid,
          );
        } catch (e) {}
        tries++;
        if (path && path.length > 0) {
          _paths.push(path);
        }
      }

      if (tries > 50) {
        break;
      }
    }

    //combine all the paths
    let paths = [];
    _paths.forEach(path => {
      paths = paths.concat(path);
    });

    //remove duplicates
    paths = paths.filter((tile, index) => {
      return paths.every((tile2, index2) => {
        if (index === index2) return true;
        return !(tile[0] === tile2[0] && tile[1] === tile2[1]);
      });
    });

    for (let i = 0; i < paths.length; i++) {
      if (paths[i] && paths[i].length > 0) {
        allPaths.push(paths[i]);
        //asign spriutes to each path tile, according ot next one
        const x = paths[i][1];
        const y = paths[i][0];
        mapArr[y][x] = 1;
        grid.setWalkableAt(y, x, false);

        let spriteName = '';
        let sprite = '';
        let distance = 0;
        if (i > 0) {
          distance = Math.sqrt(
            Math.pow(paths[i][0] - paths[i - 1][0], 2) +
              Math.pow(paths[i][1] - paths[i - 1][1], 2),
          );
        }

        if (i === 0) {
          //first tile
          if (paths[i + 1][1] === x) {
            //straight
            spriteName = upStraight;
          } else if (paths[i + 1][1] > x) {
            //right
            spriteName = upLeft;
          } else {
            //left
            spriteName = upRight;
          }
        } else if (i === paths.length - 1) {
          //last tile
          if (paths[i - 1][1] === x) {
            //straight
            spriteName = downStraight;
          } else if (paths[i - 1][1] > x) {
            //right
            spriteName = downLeft;
          } else {
            //left
            spriteName = downRight;
          }
        } else {
          //middle tile
          if (paths[i - 1][1] === x && paths[i + 1][1] === x) {
            //straight
            spriteName = upStraight;
          } else if (paths[i - 1][1] === x && paths[i + 1][1] > x) {
            //right
            spriteName = upLeft;
          } else if (paths[i - 1][1] === x && paths[i + 1][1] < x) {
            //left
            spriteName = upRight;
          } else if (paths[i - 1][1] > x && paths[i + 1][1] === x) {
            //right
            spriteName = downLeft;
          } else if (paths[i - 1][1] < x && paths[i + 1][1] === x) {
            //left
            spriteName = downRight;
          } else if (paths[i - 1][1] > x && paths[i + 1][1] > x) {
            //right
            spriteName = upEnd;
          } else if (paths[i - 1][1] < x && paths[i + 1][1] < x) {
            //left
            spriteName = upEnd;
          }
        }

        if (i === 0 || (i > 0 && i < i - 1 && distance > 1)) {
          if (y < paths[i + 1][0]) {
            sprite = leftEnd;
          } else if (y > paths[i + 1][0]) {
            sprite = rightEnd;
          } else if (x < paths[i + 1][1]) {
            sprite = upEnd;
          } else if (x > paths[i + 1][1]) {
            sprite = downEnd;
          }
        } else if (i < paths.length - 1) {
          const d2 = Math.sqrt(
            Math.pow(paths[i + 1][0] - paths[i][0], 2) +
              Math.pow(paths[i + 1][1] - paths[i][1], 2),
          );

          if (d2 > 1) {
            if (y < paths[i + 1][0]) {
              sprite = upEnd;
            } else if (y > paths[i + 1][0]) {
              sprite = downEnd;
            } else if (x < paths[i + 1][1]) {
              sprite = rightEnd;
            } else if (x > paths[i + 1][1]) {
              sprite = leftEnd;
            }
          } else {
            if (y < paths[i + 1][0]) {
              sprite = upStraight;
            } else if (y > paths[i + 1][0]) {
              sprite = downStraight;
            } else if (x < paths[i + 1][1]) {
              sprite = rightStraight;
            } else if (x > paths[i + 1][1]) {
              sprite = leftStraight;
            }
          }
        } else {
          if (y < paths[i - 1][0]) {
            sprite = leftEnd;
          } else if (y > paths[i - 1][0]) {
            sprite = rightEnd;
          } else if (x < paths[i - 1][1]) {
            sprite = leftEnd;
          } else if (x > paths[i - 1][1]) {
            sprite = rightEnd;
          }
        }

        spriteName = sprite;
        if (!spriteName) {
          spriteName = miscPath;
        }

        mapArr[y][x] = 1;
        grid.setWalkableAt(y, x, false);
        const cloneMesh = _meshes[spriteName].clone();
        cloneMesh.position.set(
          (y - TILE_AMOUNT / 2) * TILE_SIZE,
          0.05,
          (x - TILE_AMOUNT / 2) * TILE_SIZE,
        );
        meshes.push(cloneMesh);
        allMeshes.push({type: spriteName, x: y, y: x, mesh: cloneMesh});
      }
    }

    //get tiles near to each path
    const pathTiles = [];
    for (let i = 0; i < paths.length; i++) {
      const path = allPaths[i];
      for (let j = 0; j < path.length; j++) {
        const x = path[j][1];
        const y = path[j][0];
        const tiles = [
          [y - 1, x - 1],
          [y - 1, x],
          [y - 1, x + 1],
          [y, x - 1],
          [y, x + 1],
          [y + 1, x - 1],
          [y + 1, x],
          [y + 1, x + 1],
        ];
        pathTiles.push(...tiles);
      }
    }

    //keep some path tiles randomly
    const pathTilesFiltered = pathTiles.filter((tile, index) => {
      return Math.random() < 0.04;
    });

    //remove tiles that are 1s
    const pathTilesFiltered2 = pathTilesFiltered.filter((tile, index) => {
      return mapArr[tile[1]] && mapArr[tile[1]][tile[0]] !== 1;
    });

    for (let i = 0; i < pathTilesFiltered2.length; i++) {
      const x = pathTilesFiltered2[i][0];
      const y = pathTilesFiltered2[i][1];
      if (mapArr[y] && mapArr[y][x] !== 1) {
        addProp('torch', y, x);
      }
    }

    const c2 = [];
    for (let i = 0; i < mapArr.length - 3; i++) {
      for (let j = 0; j < mapArr[i].length - 3; j++) {
        if (
          mapArr[i][j] === 0 &&
          mapArr[i][j + 1] === 0 &&
          mapArr[i][j + 2] === 0 &&
          mapArr[i][j + 3] === 0 &&
          mapArr[i + 1][j] === 0 &&
          mapArr[i + 1][j + 1] === 0 &&
          mapArr[i + 1][j + 2] === 0 &&
          mapArr[i + 1][j + 3] === 0 &&
          mapArr[i + 2][j] === 0 &&
          mapArr[i + 2][j + 1] === 0 &&
          mapArr[i + 2][j + 2] === 0 &&
          mapArr[i + 2][j + 3] === 0 &&
          mapArr[i + 3][j] === 0 &&
          mapArr[i + 3][j + 1] === 0 &&
          mapArr[i + 3][j + 2] === 0 &&
          mapArr[i + 3][j + 3] === 0
        ) {
          c2.push([i, j]);
        }
      }
    }

    const centers = c2.filter((center, i) => {
      return !c2.some((otherCenter, j) => {
        return (
          i !== j &&
          center[0] >= otherCenter[0] &&
          center[0] <= otherCenter[0] + 3 &&
          center[1] >= otherCenter[1] &&
          center[1] <= otherCenter[1] + 3
        );
      });
    });

    const monsters = [];
    for (const center of centers) {
      const rnd = Math.random();

      let monster =
        monsterTiles[Math.floor(Math.random() * monsterTiles.length)];

      const cloneMesh = _meshes[monster].clone();
      cloneMesh.position.set(
        (center[1] - TILE_AMOUNT / 2) * TILE_SIZE,
        0.1,
        (center[0] - TILE_AMOUNT / 2) * TILE_SIZE,
      );
      meshes.push(cloneMesh);
      monsters.push({mob: monster, x: center[1], y: center[0]});
    }
  }

  function getRandomYXMiddle() {
    let yx = [];
    while (true) {
      const y = Math.floor(Math.random() * TILE_AMOUNT);
      const x = Math.floor(Math.random() * TILE_AMOUNT);
      if (mapArr[x][y] === 0 && y > 10 && y < 20 && x > 10 && x < 20) {
        yx = [y, x];
        break;
      }
    }
    return yx;
  }

  const addColliders = () => {
    for (let z = 0; z < TILE_AMOUNT; z++) {
      for (let x = 0; x < TILE_AMOUNT; x++) {
        if (
          z === 0 ||
          z === TILE_AMOUNT - 1 ||
          x === 0 ||
          x === TILE_AMOUNT - 1
        ) {
          addCollider(z, x, true);
        }
      }
    }
  };

  if (!addedAroundColliders) {
    addColliders();
    addedAroundColliders = true;
  }

  const spot = getRandomYXMiddle();
  return {
    meshes: meshes,
    allMeshes: allMeshes,
    colliders: colliders,
    spot: spot,
  };
}
