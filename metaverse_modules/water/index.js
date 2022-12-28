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

  app.name = 'water';

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

    spriteObject = spriteMixer.ActionSprite(texture, 40, 1);
    //spriteObject.scale.set(1,1,1);
    spriteObject.position.y = layer;
    let action = spriteMixer.Action(spriteObject, 0, 39, 60);
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
