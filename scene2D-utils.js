import * as THREE from 'three';
import {getRenderer, camera, scene, setCameraType} from './renderer.js';
import physicsManager from './physics-manager.js';
import {playersManager} from './players-manager.js';
import {PathFinder} from './npc-utils.js';
import metaversefile from 'metaversefile';
import scene2DManager from './2d-manager.js';

class PointerControls {
  constructor() {
    this.moveTarget = null;
    this.attackTarget = null;
    this.debugCircle = null;

    this.debugMesh = null;
    this.attackMesh = null;

    this.pathFinder = new PathFinder();
    this.path = null;
    this.pathIndex = 0;

    this.lastAttackTime = 0;
    this.firstAttackTime = null;
    this.inAttackRange = false;

    this.lastFocusTarget = null;
  }
  resetFocus() {
    this.moveTarget = null;
    this.attackTarget = null;
    this.inAttackRange = false;
    this.lastFocusTarget = null;
  }
  checkIsDestinationValid(pos) {
    const localPlayer = playersManager.getLocalPlayer();
    if (localPlayer.position.distanceTo(pos) < 15) {
      let a = new THREE.Vector3(0, localPlayer.position.y, 0).distanceTo(
        new THREE.Vector3(0, pos.y, 0),
      );
      if (a < 6) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  castFromCursor() {
    //console.log('casting from cursor')
    let vector = new THREE.Vector3();
    //let dir = new THREE.Vector3();
    vector.set(
      (scene2DManager.cursorPosition.x / window.innerWidth) * 2 - 1,
      -(scene2DManager.cursorPosition.y / window.innerHeight) * 2 + 1,
      -1,
    );
    vector.unproject(camera);
    //dir.set( 0, 0, - 1 ).transformDirection( camera.matrixWorld );
    //raycaster.set( vector, dir );
    const physicsScene = physicsManager.getScene();
    let ray = physicsScene.raycast(vector, camera.quaternion);

    if (ray) {
      return ray;
    }
  }
  handleCursorClick() {
    let target = this.castFromCursor();
    //console.log(target, "yaw e got target");
    if (target) {
      console.log(target, 'target');
      const targetApp = metaversefile.getAppByPhysicsId(target.objectId);
      //this.lastFocusTarget = targetApp;

      if (targetApp) {
        const focusedEvent = {
          type: 'focused',
        };
        targetApp.dispatchEvent(focusedEvent);
      }

      //console.log(targetApp, 'our target App');
      const targetPoint = new THREE.Vector3().fromArray(target.point);
      let isValid = this.checkIsDestinationValid(targetPoint);
      if (isValid) {
        this.moveTarget = targetPoint.add(new THREE.Vector3(0, 0.1, 0));
        if (targetApp.appType === 'npc') {
          this.attackTarget = targetApp;
          this.moveTarget = targetApp.npcPlayer.position
            .clone()
            .sub(new THREE.Vector3(0, targetApp.npcPlayer.avatar.height, 0));
        } else {
          this.attackTarget = null;
        }
        this.path = null;
        this.pathIndex = 0;
      } else {
        this.moveTarget = null;
        this.path = null;
        this.pathIndex = null;
      }
    } else {
      //console.log('invalid target');
    }
  }
  moveToPoint(point, t) {
    const localPlayer = playersManager.getLocalPlayer();
    let target = point;
    let dist = new THREE.Vector3(
      localPlayer.position.x,
      0,
      localPlayer.position.z,
    ).distanceTo(new THREE.Vector3(target.x, 0, target.z));
    let dir = new THREE.Vector3().subVectors(target, localPlayer.position);

    if (dist > 0.25) {
      let walkSpeed = 0.075;
      let runFactor = 2;

      let speed;

      dist < 2 ? (speed = walkSpeed) : (speed = walkSpeed);

      localPlayer.characterPhysics.applyWasd(
        dir.normalize().multiplyScalar(speed * t),
      );
      this.debugMesh.visible = true;
      this.debugMesh.position.copy(this.moveTarget);
      this.debugMesh.updateMatrixWorld();
    } else {
      this.debugMesh.visible = false;
      this.moveTarget = null;
      this.path = null;
      this.pathIndex = 0;
    }
  }
  traversePath(path, t) {
    const localPlayer = playersManager.getLocalPlayer();
    //console.log(this.pathIndex);
    let target = path[this.pathIndex].position;
    //let target = this.moveTarget;
    let dist = new THREE.Vector3(
      localPlayer.position.x,
      0,
      localPlayer.position.z,
    ).distanceTo(new THREE.Vector3(target.x, 0, target.z));
    let dir = new THREE.Vector3().subVectors(target, localPlayer.position);

    if (dist > 0.25) {
      let walkSpeed = 0.075;
      let runFactor = 2;

      let speed;

      dist < 2 ? (speed = walkSpeed) : (speed = walkSpeed);

      localPlayer.characterPhysics.applyWasd(
        dir.normalize().multiplyScalar(speed * t),
      );
      this.debugMesh.visible = true;
      this.debugMesh.position.copy(this.moveTarget);
      this.debugMesh.updateMatrixWorld();
    } else {
      this.debugMesh.visible = false;
      this.moveTarget = null;
      this.path = null;
      this.pathIndex = 0;
    }
  }
  moveAndAttackTarget(target, t) {
    const localPlayer = playersManager.getLocalPlayer();
    let origin = new THREE.Vector3(
      localPlayer.position.x,
      localPlayer.position.y,
      localPlayer.position.z,
    );
    let dist = origin.distanceTo(target);
    let dir = new THREE.Vector3();
    dir.subVectors(target, origin);

    if (dist > 1) {
      this.inAttackRange = false;
      localPlayer.characterPhysics.applyWasd(
        dir.normalize().multiplyScalar(0.1 * t),
      );
    } else {
      this.inAttackRange = true;
    }
  }
  update(timestamp, timeDiff) {
    const localPlayer = playersManager.getLocalPlayer();

    if (this.moveTarget && localPlayer) {
      this.resetFocus();
      //this.moveToPoint(this.moveTarget, timeDiff);
    }
  }
}
export {PointerControls};
