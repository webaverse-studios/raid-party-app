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
  useSound,
  useActivate,
  useWear,
  useUse,
} = metaversefile;

const baseUrl = import.meta.url.replace(/(\/)[^\/\\]*$/, '$1');

export default () => {
  const app = useApp();
  const physics = usePhysics();
  const localPlayer = useLocalPlayer();
  const spriteMixer = useSpriteMixer();
  const sounds = useSound();
  const soundFiles = sounds.getSoundFiles();
  const soundIndex = soundFiles.combat
    .map(sound => sound.name)
    .indexOf('combat/sword_slash3-1.wav');

  app.name = 'weapon';

  let offset = new THREE.Vector3(0, 0, 0);
  let layer = 2;
  let flip = false;
  let weaponSprite = null;
  let slashSprite = null;
  let clock = new THREE.Clock();
  let facing = 'up';

  let baseRotation = 0;

  //actions
  let slashAction = null;

  const attack = () => {
    let adjustedDeg = flip ? 45 : -45;
    weaponSprite.position.z = 0.1;
    slashSprite.visible = true;

    sounds.playSound(
      soundFiles.combat[soundIndex + Math.floor(Math.random() * 2)],
    );

    switch (facing) {
      case 'up':
        slashSprite.position.z = -0.3;
        slashSprite.position.x = 0;
        break;
      case 'down':
        slashSprite.position.z = 0.3;
        slashSprite.position.x = 0;
        break;
      case 'left':
        slashSprite.position.x = -0.3;
        slashSprite.position.z = 0;
        break;
      case 'right':
        slashSprite.position.x = 0.3;
        slashSprite.position.z = 0;
        break;

      default:
        slashSprite.position.z = 0;
        slashSprite.position.x = 0;
        break;
    }

    weaponSprite.material.rotation = THREE.MathUtils.degToRad(
      adjustedDeg - baseRotation,
    );
    slashSprite.material.rotation = THREE.MathUtils.degToRad(
      adjustedDeg - baseRotation,
    );

    slashAction.mirrored = flip;
    slashAction.playOnce();

    setTimeout(() => {
      weaponSprite.material.rotation = THREE.MathUtils.degToRad(
        0 - baseRotation,
      );
      slashSprite.material.rotation = THREE.MathUtils.degToRad(
        0 - baseRotation,
      );
      weaponSprite.position.z = 0;
    }, 100);
  };

  useFrame(({timeDiff}) => {
    if (localPlayer && weaponSprite && wearing) {
      let avatarVelocity = localPlayer.characterPhysics.velocity.clone();

      let velX = Math.round(parseFloat(avatarVelocity.x).toFixed(2));
      let velZ = Math.round(parseFloat(avatarVelocity.z).toFixed(2));

      let isMoving = Math.abs(velX) > 0 || Math.abs(velZ) > 0;

      if (velX > 0) {
        offset = new THREE.Vector3(0.125, 0, 0);
        layer = 2;
        flip = false;
        facing = 'right';
        baseRotation = 0;
      } else if (velX < 0) {
        offset = new THREE.Vector3(-0.125, 0, 0);
        layer = 1;
        flip = true;
        facing = 'left';
        baseRotation = 0;
      } else if (velZ > 0) {
        offset = new THREE.Vector3(0, 0, 0);
        layer = 2;
        flip = false;
        facing = 'down';
        baseRotation = 0;
      } else if (velZ < 0) {
        offset = new THREE.Vector3(-0.1, 0, -0.05);
        layer = 1;
        flip = true;
        facing = 'up';
        baseRotation = 0;
      }

      if (flip) {
        weaponSprite.material.map.repeat.set(-1, 1);
        weaponSprite.material.map.offset.set(1, 0);
      } else {
        weaponSprite.material.map.repeat.set(1, 1);
        weaponSprite.material.map.offset.set(0, 0);
      }

      app.position.x = localPlayer.position.x;
      app.position.z = localPlayer.position.z;
      app.position.add(offset);
      app.position.y = 0;
      weaponSprite.position.y = layer;

      if (isMoving) {
      }

      spriteMixer.update(clock.getDelta());
      app.updateMatrixWorld();
    }
  });

  let physicsIds = [];
  (async () => {
    const u = `${baseUrl}assets/stick.png`;
    let texture = await new Promise((accept, reject) => {
      const textureLoader = new THREE.TextureLoader();
      textureLoader.load(u, accept, function onprogress() {}, reject);
    });

    //texture.wrapT = THREE.RepeatWrapping;
    //texture.wrapS = THREE.MirroredRepeatWrapping;

    texture.wrapT = THREE.RepeatWrapping;
    texture.wrapS = THREE.MirroredRepeatWrapping;
    texture.repeat.set(1, 1);

    let spriteMaterial = new THREE.SpriteMaterial({
      map: texture,
      color: 0xffffff,
      alphaTest: 0.5,
      side: THREE.DoubleSide,
    });

    weaponSprite = new THREE.Sprite(spriteMaterial);
    app.add(weaponSprite);

    //weaponSprite.position.y = 2;
    weaponSprite.scale.set(0.35, 0.35, 0.35);
    weaponSprite.updateMatrixWorld();

    const physicsId = physics.addBoxGeometry(
      app.position,
      app.quaternion,
      new THREE.Vector3(weaponSprite.scale.x / 2, 1, weaponSprite.scale.z / 2),
    );
    physicsIds.push(physicsId);

    //console.log(sprite);
  })();

  //Slash VFX
  (async () => {
    const u = `${baseUrl}assets/vfx/thin/sheet.png`;
    let texture = await new Promise((accept, reject) => {
      const textureLoader = new THREE.TextureLoader();
      textureLoader.load(u, accept, function onprogress() {}, reject);
    });

    slashSprite = spriteMixer.ActionSprite(texture, 6, 1);

    let timeval = 100;

    slashAction = spriteMixer.Action(slashSprite, 0, 5, timeval);
    slashAction.hideWhenFinished = true;
    slashSprite.scale.set(0.5, 0.5, 0.5);
    slashSprite.position.y = 2;
    slashSprite.updateMatrixWorld();
    slashSprite.visible = false;
    app.add(slashSprite);
  })();

  let wearing = false;
  useWear(e => {
    //console.log(e);
    const {wear} = e;
    wearing = !!wear;
    //console.log(app.position.y);
  });

  useActivate(() => {});

  let using = false;
  useUse(e => {
    if (e.use) {
      attack();
    }
    //console.log(e);
  });

  useCleanup(() => {
    for (const physicsId of physicsIds) {
      physics.removeGeometry(physicsId);
    }
  });

  return app;
};
