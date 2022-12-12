import * as THREE from 'three';
import metaversefile from 'metaversefile';
import Dungeon from './dungeon/Dungeon.js';
import {getBiomeInfo, getBiomeType} from './dungeon/generateTiles.js';
import Tiles from './forest/tiles.js';
import {generateImageNew} from './forest/request_manager.js';

const {
  useApp,
  useFrame,
  useCleanup,
  useCamera,
  useLocalPlayer,
  usePhysics,
  useProcGenManager,
  useGPUTask,
  useGenerationTask,
} = metaversefile;

export default e => {
  const prompts = [
    'Unicorn Forest',
    'Icy Forest',
    'Haunted Forest',
    "Wizard's Forest",
    'Rainbow Forest',
    'Dark Forest',
    'Blazing Forest',
    'Unicorn Dungeon',
    'Icy Dungeon',
    'Haunted Dungeon',
    "Wizard's Dungeon",
    'Rainbow Dungeon',
    'Dark Dungeon',
    'Blazing Dungeon',
  ];

  const app = useApp();
  const camera = useCamera();
  const procGenManager = useProcGenManager();
  const physics = usePhysics();
  const localPlayer = useLocalPlayer();

  // locals

  let frameCb = null;

  // initialization
  e.waitUntil(
    (async () => {
      const prompt = prompts[Math.floor(Math.random() * prompts.length)];
      const biomeInfo = (await getBiomeInfo(prompt)).trim();
      const biomeType = (await getBiomeType(prompt)).trim();
      console.log('selected prompt:', prompt, '-', biomeInfo, '-', biomeType);

      if (biomeType === 'forest') {
        //Get the biome information from the prompt
        const biome = {
          name: 'forest',
          tiles: [
            'deep forest',
            'forest',
            'stone ground',
            'grass',
            'sand',
            'water',
            'tree',
            'rock',
            'flower',
            'bush',
            'sand bush',
            'house Up Left',
            'house Up Middle',
            'house Up Right',
            'house Middle Left',
            'house Middle Middle',
            'house Middle Right',
            'house Down Left',
            'house Down Middle',
            'house Down Right',
            'path Up Straight',
            'path Down Straight',
            'path Up Left',
            'path Up Right',
            'path Down Left',
            'path Down Right',
            'path Middle',
            'path Left Straight',
            'path Right Straight',
            'path Up End',
            'path Down End',
            'path Left End',
            'path Right End',
            'path Misc',
            'torch',
          ],
        };

        //Update the tile names of the selected biome based on the prompt
        for (let i = 0; i < biome.tiles.length; i++) {
          biome.tiles[i] = biomeInfo.trim() + ' ' + biome.tiles[i];
        }

        const tempTiles = biome.tiles;

        const textures = {};

        for (let i = 0; i < biome.tiles.length; i++) {
          textures[biome.tiles[i]] = [];
        }

        //generate the new tiles
        const start = new Date();
        let houseDone = false;
        let pathImg = null;
        const maxCount = 14;
        let currentTiles = 0;
        for (let i = 0; i < biome.tiles.length; i++) {
          for (let j = 0; j < 1; j++) {
            if (biome.tiles[i].includes('tree')) {
              generateImageNew(biomeInfo + ' tree').then(imgs => {
                console.log('generating tree');
                currentTiles++;
                textures[biome.tiles[i]].push(imgs[0]);
                textures[biome.tiles[i]].push(imgs[1]);
              });
            } else if (biome.tiles[i].includes('house')) {
              if (houseDone) {
                continue;
              }

              houseDone = true;
              generateImageNew(biomeInfo + ' house').then(imgs => {
                console.log('generating house');
                currentTiles++;
                console.log('images:', imgs.length);
                textures[biome.tiles[11]].push(imgs[0]);
                textures[biome.tiles[12]].push(imgs[1]);
                textures[biome.tiles[13]].push(imgs[2]);
                textures[biome.tiles[14]].push(imgs[3]);
                textures[biome.tiles[15]].push(imgs[4]);
                textures[biome.tiles[16]].push(imgs[5]);
                textures[biome.tiles[17]].push(imgs[6]);
                textures[biome.tiles[18]].push(imgs[7]);
                textures[biome.tiles[19]].push(imgs[8]);
              });
            } else {
              let prompt = biome.tiles[i];
              if (prompt.includes('stone')) {
                prompt = biomeInfo + ' rock tile with pebbles';
              } else if (prompt.includes('forest')) {
                prompt = biomeInfo + ' forest tile with grass';
              } else if (prompt.includes('deep forest')) {
                prompt = biomeInfo + ' deep forest tile with grass';
              } else if (prompt.includes('grass')) {
                prompt = biomeInfo + ' grass tile with flowers';
              } else if (prompt.includes('water')) {
                prompt = 'Square uniform!!! ' + biomeInfo + ' water tile';
              } else if (prompt.includes('path')) {
                prompt = biomeInfo + ' path tile with grass';
              }

              if (prompt.includes('path')) {
                if (pathImg) {
                  continue;
                }

                pathImg = true;
                generateImageNew(prompt).then(img => {
                  console.log('generating path');
                  currentTiles++;
                  textures[biome.tiles[20]].push(img);
                  textures[biome.tiles[21]].push(img);
                  textures[biome.tiles[22]].push(img);
                  textures[biome.tiles[23]].push(img);
                  textures[biome.tiles[24]].push(img);
                  textures[biome.tiles[25]].push(img);
                  textures[biome.tiles[26]].push(img);
                  textures[biome.tiles[27]].push(img);
                  textures[biome.tiles[28]].push(img);
                  textures[biome.tiles[29]].push(img);
                  textures[biome.tiles[30]].push(img);
                  textures[biome.tiles[31]].push(img);
                  textures[biome.tiles[32]].push(img);
                  textures[biome.tiles[33]].push(img);
                });
              } else {
                generateImageNew(prompt).then(img => {
                  console.log('generating biome.tiles[i]', biome.tiles[i]);
                  currentTiles++;
                  textures[biome.tiles[i]].push(img);
                });
              }
            }
          }
        }

        while (currentTiles < maxCount) {
          console.log('current tiles:', currentTiles, '/', maxCount);
          await new Promise(resolve => setTimeout(resolve, 50));
        }

        console.log('generated images:', textures);
        const timeDiff = new Date() - start;
        console.log('Execution time: %dms', timeDiff);

        const tiles = new Tiles();
        app.add(tiles);

        const _waitForLoad = async () => {
          await Promise.all([
            tiles.waitForLoad(
              'forest',
              230,
              textures,
              biomeInfo,
              tempTiles,
              physics,
              app,
              localPlayer,
            ),
          ]);
        };
        await _waitForLoad();
      } else {
        const dungeon = new Dungeon(
          app,
          physics,
          localPlayer,
          biomeInfo,
          biomeType,
        );
        app.add(dungeon.pivot);
        dungeon.pivot.updateMatrixWorld();

        // load
        const _waitForLoad = async () => {
          await Promise.all([dungeon.waitForLoad()]);
        };
        await _waitForLoad();

        // frame handling
        frameCb = () => {
          dungeon.frame();
        };
      }
    })(),
  );

  // add physics
  const geometry = new THREE.PlaneGeometry(0.01, 0.01);
  geometry.rotateY(Math.PI / 2); // note: match with physx' default plane rotation.
  const material = new THREE.MeshStandardMaterial({color: 'red'});
  const physicsPlane = new THREE.Mesh(geometry, material);
  physicsPlane.rotation.set(0, 0, Math.PI / 2);
  app.add(physicsPlane);
  physicsPlane.updateMatrixWorld();

  const physicsObject = physics.addPlaneGeometry(
    new THREE.Vector3(0, 0, 0),
    new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, Math.PI / 2)),
    false,
  );

  useFrame(() => {
    frameCb && frameCb();
  });

  useCleanup(() => {
    physics.removeGeometry(physicsObject);
  });

  return app;
};
