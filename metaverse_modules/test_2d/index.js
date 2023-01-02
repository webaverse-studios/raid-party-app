import * as THREE from 'three';
import metaversefile from 'metaversefile';
import Tiles from './tiles';
import {scene} from '../../renderer';
import axios from 'axios';
import {client} from './client';
import {grid} from './grid';

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

  const players = {};
  // locals

  /*new client(
    async clientId => {
      console.log('spawned player');
      const player = await metaversefile.addTrackedApp(
        '../../metaverse_modules/remotePlayer/',
        new THREE.Vector3(0, 0, 0),
        new THREE.Quaternion(0, 0, 0, 1),
        new THREE.Vector3(1, 1, 1),
        [{key: 'clientId', value: clientId}],
      );
      players[clientId] = player;
    },
    clientId => {
      if (players[clientId]) {
        metaversefile.removeTrackedApp(
          players[clientId].getComponent('instanceId'),
        );
        delete players[clientId];
      }

      console.log('dispawn remote player');
    },
    () => {
      console.log('dispawn all remote players');
      for (const key in players) {
        if (players[key]) {
          metaversefile.removeTrackedApp(
            players[key].getComponent('instanceId'),
          );
          delete players[clientId];
        }
      }
    },
    (clientId, x, y, z) => {
      if (players[clientId]) {
        players[clientId].position.set(x, 1.5, z);
        if (players[clientId].characterPhysics) {
          players[clientId].characterPhysics.setPosition(players[clientId].app);
          players[clientId].characterPhysics.reset();
        }
        players[clientId].updateMatrixWorld();
      }
    },
  );*/

  let frameCb = null;
  let tiles = null;
  const startingY = localPlayer.position.y;
  console.log('startingY', startingY, localPlayer.position);

  const g = new grid(50, 50);
  // initialization
  e.waitUntil(
    (async () => {
      const test = await axios.post(
        'http://216.153.50.202:8001/custom_message',
        {
          message: 'hi',
          speaker: 'alex',
          agent: 'test',
          client: 'webaverse',
          channel: '1',
          spell_handler: 'echo',
          isVoice: false,
        },
      );

      console.log('resp:', test.data);

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

  let prevX = 0;
  let prevZ = 0;
  let prevY = 0;
  useFrame(() => {
    /* if (
      prevX !== localPlayer.position.x ||
      prevZ !== localPlayer.position.z ||
      prevY !== localPlayer.position.y
    ) {
      prevX = localPlayer.position.x;
      prevZ = localPlayer.position.z;
      prevY = localPlayer.position.y;
      client.instance.sendMovement(
        localPlayer.position.x,
        localPlayer.position.y,
        localPlayer.position.z,
      );
    }*/
    frameCb && frameCb();
  });

  useCleanup(() => {});

  return app;
};
