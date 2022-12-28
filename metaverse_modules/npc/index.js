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
  const localPlayer = useLocalPlayer();
  const spriteMixer = useSpriteMixer();
  const pathFinder = new PathFinder({heightTolerance: 0.5});

  let clock = new THREE.Clock();

  let idleAction = null;
  let walkAction = null;
  let attackAction = null;
  let hurtAction = null;

  let lastAttackTime = 0;
  let attackDelay = 1500;
  let layer = 1;

  let actions = null;

  let actionSprite = null;

  let meshApp = null;

  let velocity = new THREE.Vector3(0, 0, 0);

  let target = null;

  let currentBehaviour = null;

  let lastTimestamp = 0;

  let inAction = false;
  let walkSpeed = 0.008; // 0.015
  let idleTime = 2000;

  let activeWayPoint = 0;
  let activePath = null;

  let npcBehaviour = 'roam';

  useFrame(({timestamp}) => {
    if (!actionSprite) {
      return;
    }

    updatePhysics();
    updateAnimation();
    updateBehaviour(timestamp);
  });

  let physicsIds = [];
  (async () => {
    //const u = `${baseUrl}assets/spritesheet.png`;
    const prompts = ['cowboy', 'warrior', 'pirate', 'gladiator', 'princess'];
    const randomSprite = prompts[Math.floor(Math.random() * prompts.length)];
    console.log('generating npc: ', randomSprite);
    let blob = await generateAvatar(randomSprite);
    let texture = new THREE.Texture();

    var url = URL.createObjectURL(blob);

    let image = new Image();
    image.src = url;

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

  const updateAnimation = () => {
    let avatarVelocity = velocity.clone();
    let delta = clock.getDelta();

    let velX = Math.round(parseFloat(avatarVelocity.x).toFixed(2));
    let velZ = Math.round(parseFloat(avatarVelocity.z).toFixed(2));

    let threshold = 4;
    let isRunning = Math.abs(velX) >= threshold || Math.abs(velZ) >= threshold;

    if (actionSprite.currentAction) {
      if (isRunning) {
        actionSprite.currentAction.tileDisplayDuration = 145;
      } else {
        actionSprite.currentAction.tileDisplayDuration = 175;
      }
    }

    if (velX > 0) {
      if (actionSprite.currentAction !== actions.walk_right) {
        actions.walk_right.playLoop();
      }
    } else if (velX < 0) {
      if (actionSprite.currentAction !== actions.walk_left) {
        actions.walk_left.playLoop();
      }
    } else if (velZ > 0) {
      if (actionSprite.currentAction !== actions.walk_down) {
        actions.walk_down.playLoop();
      }
    } else if (velZ < 0) {
      if (actionSprite.currentAction !== actions.walk_up) {
        actions.walk_up.playLoop();
      }
    } else {
      if (actionSprite.currentAction) {
        actionSprite.currentAction.stop();
        actionSprite.currentAction = null;
      }
    }
    spriteMixer.update(delta);
  };

  const updatePhysics = () => {
    if (!target) {
      return;
    }
    let targetPos = target.position.clone();
    targetPos.y = app.position.y;

    let dist = app.position.distanceTo(targetPos);
    let dir = new THREE.Vector3();
    dir.subVectors(targetPos, app.position);
    dir.normalize();

    if (dist > 0.5) {
      velocity = dir.clone();
      app.position.add(dir.multiplyScalar(walkSpeed));
    } else {
      if (activePath) {
        //console.log('has path');
        //console.log(activePath.length);
        if (activeWayPoint < activePath.length - 1) {
          //console.log('current pathpoint smaller than total length');
          activeWayPoint++;
          setTarget(activePath[activeWayPoint]);
        } else {
          //console.log('resetPath');
          resetPath();
        }
      } else {
        //console.log('reached end of path');
        velocity.set(0, 0, 0);
        resetTarget();
      }
    }
    app.updateMatrixWorld();
  };

  const setTargetPosition = pos => {
    let temp = new THREE.Object3D();
    temp.position.copy(pos);
    target = temp;
  };

  const setTarget = obj => {
    target = obj;
  };

  const setPath = path => {
    activePath = path;
    setTarget(activePath[activeWayPoint]);
  };

  const resetPath = () => {
    activePath = null;
    activeWayPoint = 0;
  };

  const resetTarget = () => {
    target = null;
    inAction = false;
  };

  // app.setBehaviour = behaviour => {
  //   npcBehaviour = behaviour;
  // };

  const setBehaviour = behaviour => {
    npcBehaviour = behaviour;
  };

  app.setBehaviour = behaviour => {
    setBehaviour(behaviour);
  };

  app.setAvatarSprite = blob => {
    //
  };

  app.reset = () => {
    resetPath();
    resetTarget();
    npcBehaviour = null;
  };

  const updateBehaviour = timestamp => {
    if (!npcBehaviour) {
      return;
    }

    if (npcBehaviour === 'roam') {
      if (!inAction && timestamp - lastTimestamp > idleTime) {
        let max = 5,
          min = -5;
        let rndX = Math.random() * (max - min) + min;
        let rndZ = Math.random() * (max - min) + min;

        const downQuat = new THREE.Quaternion();
        downQuat.setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI * 0.5);

        let tempPos = new THREE.Vector3();
        let layerOffset = 10;
        tempPos
          .copy(app.position)
          .add(new THREE.Vector3(rndX, layerOffset, rndZ));

        let result = physics.raycast(tempPos, downQuat);
        if (result) {
          let point = new THREE.Vector3().fromArray(result.point);
          point.y = 0;
          let tempa = app.position.clone();
          tempa.y = 1.4347116351127625;
          let path = pathFinder.getPath(tempa, point);
          //console.log('looking for path');
          if (path) {
            //console.log('FOUND PATH');
            idleTime = 1000 + Math.random() * 5000;
            lastTimestamp = timestamp;
            inAction = true;
            setPath(path);
          }
        }
      }
    }
  };

  useActivate(() => {
    // if(localPlayer) {
    //   setTarget(localPlayer);
    // }
  });

  useCleanup(() => {
    for (const physicsId of physicsIds) {
      physics.removeGeometry(physicsId);
    }
  });

  return app;
};
