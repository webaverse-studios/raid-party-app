import * as THREE from 'three';
import metaversefile from 'metaversefile';
import Tiles from './tiles';
import {scene} from '../../renderer';

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
  const localPlayer = useLocalPlayer();
  localPlayer.dispatchEvent({
    type: 'loading_map',
    app,
    loading: true,
  });

  // locals

  let frameCb = null;
  let tiles = null;
  const startingY = localPlayer.position.y;
  console.log('startingY', startingY, localPlayer.position);

  // initialization
  e.waitUntil(
    (async () => {
      tiles = new Tiles(app, physics);
      app.add(tiles);

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

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();

  function render() {
    // update the picking ray with the camera and pointer position
    raycaster.setFromCamera(pointer, camera);

    // calculate objects intersecting the picking ray
    const intersects = raycaster.intersectObjects(scene.children, true);

    console.log(intersects.length);
    for (let i = 0; i < intersects.length; i++) {
      const obj = intersects[i].object;
      for (let j = 0; j < tiles.colliders.length; j++) {
        if (tiles.colliders[j].cloneMesh === obj) {
          console.log('found object:', obj.name, tiles.colliders[j].layer);
          obj.material = new THREE.MeshBasicMaterial({
            color: 0xff0000,
          });
          break;
        }
      }
    }
  }

  //capture mouse click
  window.addEventListener('click', function (event) {
    console.log('on mouse click');
    render();
  });

  function onPointerMove(event) {
    // calculate pointer position in normalized device coordinates
    // (-1 to +1) for both components

    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
  }

  window.addEventListener('pointermove', onPointerMove);

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

  useCleanup(() => {});

  return app;
};
