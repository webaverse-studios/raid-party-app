import * as THREE from 'three';
import metaversefile from 'metaversefile';
import Dungeon from './dungeon/Dungeon.js';
import {getBiomeInfo, getBiomeType} from './dungeon/generateTiles.js';
import Tiles from './forest/tiles.js';
import {
  forestExists,
  generateImageCache,
  generateImageNew,
} from './forest/request_manager.js';

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
    'Desert Forest',
    'Blazing Dungeon',
  ];

  let starting_biome = 'forest';
  console.log('SPAWNING TILEMAP APP');

  const app = useApp();
  const camera = useCamera();
  const procGenManager = useProcGenManager();
  const physics = usePhysics();
  const localPlayer = useLocalPlayer();

  let forest = null;
  let dungeon = null;
  const input_prompt = app.getComponent('prompt').prompt;
  const input_prompt_type = app.getComponent('prompt').type;
  let rerolling = false;

  localPlayer.addEventListener('reroll_map', async e => {
    if (rerolling || (!forest && !dungeon)) {
      return;
    }

    rerolling = true;
    console.log('regenerating tiles');
    let isForest = false;
    let biomeInfo = '';
    let biomeType = '';

    while (!isForest) {
      const rndPrompt = prompts[Math.floor(Math.random() * prompts.length)];
      biomeInfo = (await getBiomeInfo(rndPrompt)).trim();
      biomeType = (await getBiomeType(rndPrompt)).trim();
      isForest = biomeType === starting_biome;
    }

    if (forest) {
      forest.regenerateWithPrompt(biomeInfo, biomeType);
    } else if (dungeon) {
      dungeon.regenerateMap(biomeInfo, biomeType);
    }
    rerolling = false;
  });

  // locals

  let frameCb = null;

  // initialization
  e.waitUntil(
    (async () => {
      const prompt = input_prompt;
      console.log('prompt', prompt);
      const biomeInfo = (await getBiomeInfo(prompt)).trim();
      const biomeType =
        input_prompt_type || (await getBiomeType(prompt)).trim();
      console.log('selected prompt:', prompt, '-', biomeInfo, '-', biomeType);
      starting_biome = biomeType;

      if (biomeType === 'forest') {
        const fe = await forestExists(biomeInfo, biomeType);
        console.log('fe:', fe);
        // Get the biome information from the prompt
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

        // Update the tile names of the selected biome based on the prompt
        for (let i = 0; i < biome.tiles.length; i++) {
          biome.tiles[i] = biomeInfo.trim() + ' ' + biome.tiles[i];
        }

        const tempTiles = biome.tiles;

        const textures = {};

        for (let i = 0; i < biome.tiles.length; i++) {
          textures[biome.tiles[i]] = [];
        }

        // generate the new tiles
        const start = new Date();
        let houseDone = false;
        let pathImg = null;
        const houseNumber = 4;
        const maxCount = (fe ? 15 : 14) + houseNumber - 1;
        let currentTiles = 0;
        localPlayer.dispatchEvent({
          type: 'load_count',
          app,
          total: maxCount,
          progress: currentTiles,
        });
        for (let i = 0; i < biome.tiles.length; i++) {
          for (let j = 0; j < 1; j++) {
            if (biome.tiles[i].includes('tree')) {
              if (fe) {
                await generateImageCache(biomeInfo + ' tree1', 'forest').then(
                  imgs => {
                    currentTiles++;
                    localPlayer.dispatchEvent({
                      type: 'load_count',
                      app,
                      total: maxCount,
                      progress: currentTiles,
                    });
                    textures[biome.tiles[i]].push(imgs);
                  },
                );
                generateImageCache(biomeInfo + ' tree0', 'forest').then(
                  imgs => {
                    currentTiles++;
                    localPlayer.dispatchEvent({
                      type: 'load_count',
                      app,
                      total: maxCount,
                      progress: currentTiles,
                    });
                    textures[biome.tiles[i]].push(imgs);
                  },
                );
              } else {
                generateImageNew(biomeInfo + ' tree').then(imgs => {
                  console.log('generating tree');
                  currentTiles++;
                  localPlayer.dispatchEvent({
                    type: 'load_count',
                    app,
                    total: maxCount,
                    progress: currentTiles,
                  });
                  textures[biome.tiles[i]].push(imgs[0]);
                  textures[biome.tiles[i]].push(imgs[1]);
                });
              }
            } else if (biome.tiles[i].includes('house')) {
              if (houseDone) {
                continue;
              }

              houseDone = true;
              for (let i = 0; i < houseNumber; i++) {
                generateImageNew(biomeInfo + ' house').then(imgs => {
                  console.log('generating house');
                  currentTiles++;
                  localPlayer.dispatchEvent({
                    type: 'load_count',
                    app,
                    total: maxCount,
                    progress: currentTiles,
                  });
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
              }
            } else {
              const prompt = biome.tiles[i];

              if (prompt.includes('path')) {
                if (pathImg) {
                  continue;
                }

                pathImg = true;
                generateImageCache('path misc', biomeType).then(img => {
                  console.log('generating path');
                  currentTiles++;
                  localPlayer.dispatchEvent({
                    type: 'load_count',
                    app,
                    total: maxCount,
                    progress: currentTiles,
                  });
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
                console.log('prompt:', prompt, typeof prompt);
                if (
                  !fe &&
                  (prompt.includes('bush') ||
                    prompt.includes('flower') ||
                    prompt.includes('rock') ||
                    prompt.includes('torch'))
                ) {
                  generateImageNew(prompt).then(img => {
                    console.log('generating biome.tiles[i]', biome.tiles[i]);
                    currentTiles++;
                    localPlayer.dispatchEvent({
                      type: 'load_count',
                      app,
                      total: maxCount,
                      progress: currentTiles,
                    });
                    textures[biome.tiles[i]].push(img);
                  });
                } else {
                  generateImageCache(prompt, biomeType).then(img => {
                    console.log('generating biome.tiles[i]', biome.tiles[i]);
                    currentTiles++;
                    localPlayer.dispatchEvent({
                      type: 'load_count',
                      app,
                      total: maxCount,
                      progress: currentTiles,
                    });
                    textures[biome.tiles[i]].push(img);
                  });
                }
              }
            }
          }
        }

        while (currentTiles < maxCount) {
          console.log('current tiles:', currentTiles, '/', maxCount);
          await new Promise(resolve => setTimeout(resolve, 50));
        }

        localPlayer.dispatchEvent({
          type: 'load_count',
          app,
          total: maxCount,
          progress: maxCount,
        });

        console.log('generated images:', textures);
        const timeDiff = new Date() - start;
        console.log('Execution time: %dms', timeDiff);

        forest = new Tiles();
        app.add(forest);

        const _waitForLoad = async () => {
          await Promise.all([
            forest.waitForLoad(
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
        app.setComponent('spot', forest.spot);
      } else {
        dungeon = new Dungeon(app, physics, localPlayer, biomeInfo, biomeType);
        app.add(dungeon.pivot);
        dungeon.pivot.updateMatrixWorld();

        // load
        const _waitForLoad = async () => {
          await Promise.all([dungeon.waitForLoad()]);
        };
        await _waitForLoad();
        console.log('dungeon.spot:', dungeon.spot);
        app.setComponent('spot', dungeon.spot);

        // frame handling
        frameCb = () => {
          dungeon.frame();
        };
      }
    })(),
  );

  useFrame(() => {
    frameCb && frameCb();
  });

  useCleanup(() => {
    if (forest) {
      console.log('cleaning forest colliders:', forest.colliders.length);
      for (let i = 0; i < forest.colliders.length; i++) {
        physics.removeGeometry(forest.colliders[i]);
      }
    }
    if (dungeon) {
      console.log('cleaning dungeon colliders:', dungeon.mainColliders.length);
      for (let i = 0; i < dungeon.mainColliders.length; i++) {
        physics.removeGeometry(dungeon.mainColliders[i].col);
      }
    }
  });

  return app;
};
