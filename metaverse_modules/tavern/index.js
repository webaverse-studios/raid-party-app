import * as THREE from 'three';
import metaversefile from 'metaversefile';
import Tiles from './tiles';
import tilemapManager from '../../tilemap/tilemap-manager';

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
  const app = useApp();
  const physics = usePhysics();
  const localPlayer = useLocalPlayer();
  localPlayer.dispatchEvent({
    type: 'loading_map',
    app,
    loading: true,
  });

  // locals

  let frameCb = null;
  let tilemapApp = null;
  let tiles = null;
  let generated = false;
  const startingY = localPlayer.position.y;

  const generateMap = async (prompt, type) => {
    localPlayer.dispatchEvent({
      type: 'loading_map',
      app,
      loading: true,
    });

    generated = true;
    if (tilemapApp) {
      metaversefile.removeTrackedApp(tilemapApp.getComponent('instanceId'));
    }

    tiles.clearMap();
    const component = {
      key: 'resolution',
      value: {
        width: 50,
        height: 50,
      },
    };
    const component2 = {
      key: 'prompt',
      value: {
        prompt,
        type,
      },
    };

    tilemapApp = await metaversefile.addTrackedApp(
      '../../metaverse_modules/tilemap/',
      new THREE.Vector3(0, 0, 0),
      new THREE.Quaternion(0, 0, 0, 1),
      new THREE.Vector3(1, 1, 1),
      [component, component2],
    );
    const spot = tilemapApp.getComponent('spot')
      ? tilemapApp.getComponent('spot')
      : [0, 0];
    localPlayer.position.set(spot[1], startingY, spot[0]);
    localPlayer.characterPhysics.setPosition(localPlayer.position);
    localPlayer.characterPhysics.reset();
    localPlayer.updateMatrixWorld();
    localPlayer.dispatchEvent({
      type: 'loading_map',
      app,
      loading: false,
    });
  };

  localPlayer.addEventListener('enter_adventure', e => {
    console.log('enter_adventure', e, e.prompt);
    generateMap(e.prompt, e.prompt_type);
  });
  localPlayer.addEventListener('back_map', e => {
    if (!generated || !tiles || !tilemapApp) {
      return;
    }

    localPlayer.dispatchEvent({
      type: 'loading_map',
      app,
      loading: true,
    });

    localPlayer.position.set(0, startingY, 0);
    localPlayer.characterPhysics.setPosition(localPlayer.position);
    localPlayer.characterPhysics.reset();
    localPlayer.updateMatrixWorld();
    metaversefile.removeTrackedApp(tilemapApp.getComponent('instanceId'));
    tiles.unclearMap();
    generated = false;

    localPlayer.dispatchEvent({
      type: 'loading_map',
      app,
      loading: false,
    });

    localPlayer.dispatchEvent({
      type: 'update_adventures',
      app,
      open_adventures: false,
    });
  });

  // initialization
  e.waitUntil(
    (async () => {
      tiles = new Tiles(app, physics);
      app.add(tiles);

      tilemapManager.setTiles(tiles.children);

      // load
      const _waitForLoad = async () => {
        await Promise.all([tiles.waitForLoad()]);
      };
      await _waitForLoad();
      localPlayer.dispatchEvent({
        type: 'loading_map',
        app,
        loading: false,
      });
      // frame handling
      frameCb = () => {};
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
