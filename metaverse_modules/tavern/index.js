import * as THREE from 'three';
import metaversefile from 'metaversefile';
import Tiles from './tiles';

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
  const camera = useCamera();
  const procGenManager = useProcGenManager();
  const physics = usePhysics();

  // locals

  let frameCb = null;
  let tilemapApp = null;
  let tiles = null;
  let generated = false;

  document.addEventListener('keydown', async e => {
    if (e.key == 'i') {
      if (generated || !tiles) {
        return;
      }

      useLocalPlayer().position.set(0, 0, 0);

      generated = true;
      tiles.clearMap();
      console.log('spawning tilemap tiles:', tiles);
      const component = {
        key: 'resolution',
        value: {
          width: 50,
          height: 50,
        },
      };

      tilemapApp = await metaversefile.addTrackedApp(
        '../../metaverse_modules/tilemap/',
        new THREE.Vector3(0, 0, 0),
        new THREE.Quaternion(0, 0, 0, 1),
        new THREE.Vector3(1, 1, 1),
        [component],
      );
      console.log(tilemapApp);
    } else if (e.key == 'k') {
      if (!generated || !tiles) {
        return;
      }

      console.log('removing tilemap tiles:', tiles);
      metaversefile.removeTrackedApp(tilemapApp.getComponent('instanceId'));
      tiles.unclearMap();
      generated = false;
    }
  });
  // initialization
  e.waitUntil(
    (async () => {
      tiles = new Tiles(app);
      app.add(tiles);

      // load
      const _waitForLoad = async () => {
        await Promise.all([tiles.waitForLoad()]);
      };
      await _waitForLoad();

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
