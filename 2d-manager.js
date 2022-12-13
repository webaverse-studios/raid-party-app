import * as THREE from 'three';
import {getRenderer, camera, scene, setCameraType} from './renderer.js';
import physicsManager from './physics-manager.js';
import {playersManager} from './players-manager.js';
import {PathFinder} from './npc-utils.js';
import {PointerControls} from './scene2D-utils.js';

const localVector = new THREE.Vector3();

class Scene2DManager {
  constructor() {
    this.enabled = false;
    this.perspective = null;
    this.cameraMode = null;
    this.scrollDirection = null;
    this.viewSize = 0;
    this.zoomFactor = 1;

    this.cursorPosition = new THREE.Vector2(0, 0);
    this.lastCursorPosition = null;
    this.cursorSensitivity = 0.75;
    this.maxCursorDistance = 3;

    this.pointerControls = null;
    this.pathFinder = new PathFinder({debugRender: false});
  }
  handleWheelEvent(e) {
    switch (this.perspective) {
      case 'isometric': {
        this.zoomFactor = THREE.MathUtils.clamp(
          (this.zoomFactor += e.deltaY * 0.01),
          1,
          1.5,
        );
        camera.zoom = this.zoomFactor;
        camera.updateProjectionMatrix();
        break;
      }
      case 'side-scroll': {
        // nothing yet
        break;
      }
      case 'top-down': {
        this.zoomFactor = THREE.MathUtils.clamp(
          (this.zoomFactor += e.deltaY * 0.01),
          1,
          1.5,
        );
        camera.zoom = this.zoomFactor;
        camera.updateProjectionMatrix();
        break;
      }
      default: {
        break;
      }
    }
  }
  handleMouseMove(e) {
    const {movementX, movementY} = e;
    switch (this.perspective) {
      case 'side-scroll': {
        const cursorPosition = this.cursorPosition;
        let lastCursorPosition = this.lastCursorPosition;
        const size = getRenderer().getSize(localVector);
        const sensitivity = this.cursorSensitivity;
        const crosshairEl = document.getElementById('crosshair');
        const maxCursorDistance = this.maxCursorDistance;

        let clampedX = THREE.MathUtils.clamp(cursorPosition.x, 0, size.x);
        let clampedY = THREE.MathUtils.clamp(cursorPosition.y, 0, size.y);
        clampedX += movementX * sensitivity;
        clampedY += movementY * sensitivity;

        cursorPosition.set(clampedX, clampedY);

        crosshairEl.style.left = clampedX + 'px';
        crosshairEl.style.top = clampedY + 'px';

        break;
      }
      case 'isometric': {
        if (!this.pointerControls) {
          break;
        }
        const cursorPosition = this.cursorPosition;
        let lastCursorPosition = this.lastCursorPosition;
        const size = getRenderer().getSize(localVector);
        const sensitivity = this.cursorSensitivity;
        const crosshairEl = document.getElementById('crosshair');
        const maxCursorDistance = this.maxCursorDistance;

        let clampedX = THREE.MathUtils.clamp(cursorPosition.x, 0, size.x);
        let clampedY = THREE.MathUtils.clamp(cursorPosition.y, 0, size.y);
        clampedX += movementX * sensitivity;
        clampedY += movementY * sensitivity;

        cursorPosition.set(clampedX, clampedY);

        crosshairEl.style.left = clampedX + 'px';
        crosshairEl.style.top = clampedY + 'px';

        break;
      }

      default:
        break;
    }
  }
  setMode(
    perspective = 'top-down',
    cameraMode = 'follow',
    viewSize,
    scrollDirection = 'none',
    controls = 'default',
  ) {
    this.reset();
    this.perspective = perspective;
    this.cameraMode = cameraMode;
    this.scrollDirection = scrollDirection;
    this.viewSize = viewSize;
    this.enabled = true;
    setCameraType('orthographic', viewSize, perspective);
  }
  reset() {
    this.enabled = false;
    this.disablePointerControls();
    setCameraType('perspective');
  }
  getPointerControls() {
    return this.pointerControls;
  }
  enablePointerControls() {
    this.pointerControls = new PointerControls();
  }
  disablePointerControls() {
    this.pointerControls = null;
  }
  getPath(vec1, vec2) {
    return this.pathFinder.getPath(vec1, vec2);
  }
  getCursorPosition() {
    let vector = new THREE.Vector3();
    vector.set(
      (this.cursorPosition.x / window.innerWidth) * 2 - 1,
      -(this.cursorPosition.y / window.innerHeight) * 2 + 1,
      0,
    );
    vector.unproject(camera);
    return new THREE.Vector3(vector.x, vector.y, 0);
  }
  getScreenCursorPosition() {
    let vector = new THREE.Vector3();
    vector.set(
      (this.cursorPosition.x / window.innerWidth) * 2 - 1,
      -(this.cursorPosition.y / window.innerHeight) * 2 + 1,
      0,
    );
    return new THREE.Vector2(vector.x, vector.y);
  }
  castFromCursor() {
    let vector = new THREE.Vector3();
    let dir = new THREE.Vector3();
    vector.set(
      (this.cursorPosition.x / window.innerWidth) * 2 - 1,
      -(this.cursorPosition.y / window.innerHeight) * 2 + 1,
      -1,
    );
    vector.unproject(camera);
    dir.set(0, 0, -1).transformDirection(camera.matrixWorld);
    raycaster.set(vector, dir);
    const physicsScene = physicsManager.getScene();
    let ray = physicsScene.raycast(vector, camera.quaternion);

    if (ray) {
      return ray;
    }
  }
  getCursorQuaternionFromOrigin(origin) {
    let cursorPos = this.getCursorPosition();
    let tempObj = new THREE.Object3D();

    tempObj.position.copy(origin);
    tempObj.lookAt(new THREE.Vector3(cursorPos.x, cursorPos.y, cursorPos.z));

    tempObj.rotation.x = -tempObj.rotation.x;
    tempObj.rotation.y = -tempObj.rotation.y;

    return tempObj.quaternion;
  }
  getViewDirection() {
    let viewDir = new THREE.Vector3();
    playersManager.getLocalPlayer().getWorldDirection(viewDir);
    return viewDir.x > 0 ? 'left' : 'right';
  }
  handleClick() {
    if (this.pointerControls) {
      this.pointerControls.handleCursorClick();
    }
  }
  update(timestamp, timeDiff) {
    //const localPlayer = playersManager.getLocalPlayer();

    if (this.pointerControls) {
      this.pointerControls.update(timestamp, timeDiff);
    }
  }
}
const scene2DManager = new Scene2DManager();
export default scene2DManager;
