import * as THREE from 'three';
import metaversefile from 'metaversefile';
import {generateAvatar} from '../../src/api/sprite';
import {PathFinder} from '../../npc-utils';
const {
  useApp,
  useFrame,
  usePhysics,
  useSpriteMixer,
  useLocalPlayer,
  useActivate,
  useCleanup,
} = metaversefile;

const baseUrl = import.meta.url.replace(/(\/)[^\/\\]*$/, '$1');

export default () => {
  const app = useApp();
  const physics = usePhysics();
  const spriteMixer = useSpriteMixer();
  let layer = 1;

  let actions = null;

  let actionSprite = null;

  let clientId = null;

  let physicsIds = [];
  (async () => {
    clientId = await app.getComponent('clientId');
    console.log('clientId:', clientId);
    const u = `${baseUrl}assets/spritesheet.png`;
    let texture = new THREE.Texture();

    let image = new Image();
    image.src = u;

    image.onload = () => {
      texture.image = image;
      texture.needsUpdate = true;
      createSpriteNpc(texture);
    };
    app.updateMatrixWorld();
  })();

  const createSpriteNpc = texture => {
    actionSprite = spriteMixer.ActionSprite(texture, 3, 4);

    let timeval = 150;
    actions = {
      walk_down: spriteMixer.Action(actionSprite, 0, 2, timeval),
      walk_left: spriteMixer.Action(actionSprite, 3, 5, timeval),
      walk_right: spriteMixer.Action(actionSprite, 6, 8, timeval),
      walk_up: spriteMixer.Action(actionSprite, 9, 11, timeval),
      currentAction: null,
    };

    actionSprite.scale.set(0.5, 0.5, 0.5);
    actionSprite.updateMatrixWorld();
    actionSprite.position.y = layer;

    // let physicsId = physics.addBoxGeometry(
    //   app.position,
    //   app.quaternion,
    //   new THREE.Vector3(0.25, 1, 0.25),
    // );
    // physicsIds.push(physicsId);
    app.add(actionSprite);
    app.updateMatrixWorld();
  };

  useCleanup(() => {
    for (const physicsId of physicsIds) {
      physics.removeGeometry(physicsId);
    }
  });

  return app;
};
