import * as THREE from 'three';
import {getRenderer, camera, scene} from './renderer.js';
import physicsManager from './physics-manager.js';
import {playersManager} from './players-manager.js';
import metaversefile from 'metaversefile';
import scene2DManager from './2d-manager.js';
import {SpriteMixer} from './spritesheet-mixer.js';
import {Sprite} from 'three';

class SpriteAvatar {
  constructor() {
    this.clock = new THREE.Clock();

    this.idleAction = null;
    this.walkAction = null;
    this.attackAction = null;
    this.hurtAction = null;

    this.lastAttackTime = 0;
    this.attackDelay = 1500;

    this.actions = null;

    this.actionSprite = null;

    this.meshApp = null;
  }
  makeSpriteAvatar(blop) {
    if (!this.meshApp) {
      this.meshApp = metaversefile.createApp();
      this.meshApp.name = 'spriteAvatar';
      scene.add(this.meshApp);

      var texture = new THREE.Texture();

      var image = new Image();
      image.src = blop;
      image.onload = function () {
        texture.image = image;
        texture.needsUpdate = true;
      };

      const vertexShader = () => {
        return `
              varying vec2 vUv;

              void main() {
                  vUv = uv;

                  vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
                  gl_Position = projectionMatrix * modelViewPosition;
              }
          `;
      };

      const fragmentShader = () => {
        return `
              uniform sampler2D texture;
              varying vec2 vUv;

              void main() {
                  vec4 color = texture2D(texture, vUv);
                  gl_FragColor = color;
              }
          `;
      };

      const uniforms = {
        texture: {value: texture},
      };

      const planeMaterial = new THREE.ShaderMaterial({
        uniforms: uniforms,
        fragmentShader: fragmentShader(),
        vertexShader: vertexShader(),
      });

      let geometry2 = new THREE.PlaneGeometry(5, 5);

      this.spriteMixer = SpriteMixer();

      this.actionSprite = this.spriteMixer.ActionSprite(texture, 3, 4);

      //console.log(texture

      //var texture2 = texture.clone();

      const geometry = new THREE.PlaneGeometry(10, 10);
      //const material = new THREE.MeshBasicMaterial( {map: planeMaterial, side: THREE.DoubleSide} );
      const plane = new THREE.Mesh(geometry2, planeMaterial);
      scene.add(plane);

      plane.position.y = 1;
      plane.rotation.x = Math.PI / 2;
      plane.updateMatrixWorld();

      let timeval = 150;
      this.actions = {
        walk_down: this.spriteMixer.Action(this.actionSprite, 0, 2, timeval),
        walk_left: this.spriteMixer.Action(this.actionSprite, 3, 5, timeval),
        walk_right: this.spriteMixer.Action(this.actionSprite, 6, 8, timeval),
        walk_up: this.spriteMixer.Action(this.actionSprite, 9, 11, timeval),
        currentAction: null,
      };

      this.actionSprite.scale.set(0.75, 0.75, 0.75);
      this.actionSprite.updateMatrixWorld();

      this.meshApp.add(this.actionSprite);
      this.meshApp.updateMatrixWorld();

      let offset = new THREE.Vector3(0, 0, 0); //1.25, 0.75, 0
      let avatarScale = new THREE.Vector3(0.5, 1, 1);
    } else {
      //this.meshApp.parent.remove(this.meshApp);
      //this.meshApp.destroy();
    }
  }
  updateAnimation() {
    let actionSprite = this.actionSprite;
    let actions = this.actions;

    const localPlayer = playersManager.getLocalPlayer();
    let avatarVelocity = localPlayer.characterPhysics.velocity.clone();

    let velX = Math.round(parseFloat(avatarVelocity.x).toFixed(2));
    let velZ = Math.round(parseFloat(avatarVelocity.z).toFixed(2));

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
  }
  update() {
    const localPlayer = playersManager.getLocalPlayer();

    if (this.meshApp && localPlayer) {
      localPlayer.avatar.app.visible = false;
      var delta = this.clock.getDelta();
      this.meshApp.position.copy(localPlayer.position);
      if (this.actions) {
        this.updateAnimation();
        this.spriteMixer.update(delta);
        this.meshApp.updateMatrixWorld();
        //console.log('we updating', delta);
      }
    }
  }
  delete() {
    if (this.meshApp) {
      this.actions = null;
      this.spriteMixer = null;
      this.meshApp.parent.remove(this.meshApp);
      this.meshApp.destroy();
    }
  }
}
export {SpriteAvatar};
