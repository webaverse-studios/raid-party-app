import * as THREE from 'three';
import metaversefile from 'metaversefile';
const {
  useApp,
  useFrame,
  useLoaders,
  usePhysics,
  useCleanup,
  useLocalPlayer,
  useSpriteMixer,
} = metaversefile;

const baseUrl = import.meta.url.replace(/(\/)[^\/\\]*$/, '$1');

export default () => {
  const app = useApp();
  const physics = usePhysics();
  const localPlayer = useLocalPlayer();
  const spriteMixer = useSpriteMixer();

  let spriteObject = null;
  let layer = 1;
  let clock = new THREE.Clock();

  app.name = 'torch';

  useFrame(() => {
    if (spriteObject && localPlayer) {
      spriteMixer.update(clock.getDelta());
    }
  });

  let physicsIds = [];
  (async () => {
    const u = `${baseUrl}assets/spritesheet.png`;
    let texture = await new Promise((accept, reject) => {
      const textureLoader = new THREE.TextureLoader();
      textureLoader.load(u, accept, function onprogress() {}, reject);
    });

    spriteObject = spriteMixer.ActionSprite(texture, 3, 2);
    spriteObject.scale.set(0.5, 0.5, 0.5);
    spriteObject.position.y = layer;
    let action = spriteMixer.Action(spriteObject, 0, 5, 100);
    action.playLoop();

    app.add(spriteObject);
    app.updateMatrixWorld();
  })();

  useCleanup(() => {
    for (const physicsId of physicsIds) {
      physics.removeGeometry(physicsId);
    }
  });

  return app;
};
