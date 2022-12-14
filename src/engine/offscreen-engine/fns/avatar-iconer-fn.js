import {fetchArrayBuffer} from 'engine/util.js';
import {AvatarRenderer} from 'engine/avatars/avatar-renderer.js';
import {
  createAvatarForScreenshot,
  screenshotAvatar,
} from 'engine/avatar-screenshotter.js';
import {maxAvatarQuality} from 'engine/constants.js';
import {emotions} from 'components/general/character/Emotions.jsx';

const allEmotions = [''].concat(emotions);

export async function getEmotionCanvases(start_url, width, height) {
  // const cameraOffset = new THREE.Vector3(0, 0.05, -0.35);

  const arrayBuffer = await fetchArrayBuffer(start_url);

  const avatarRenderer = new AvatarRenderer({
    arrayBuffer,
    srcUrl: start_url,
    quality: maxAvatarQuality,
    controlled: true,
  });
  await avatarRenderer.waitForLoad();

  const avatar = createAvatarForScreenshot(avatarRenderer);

  const emotionCanvases = await Promise.all(
    allEmotions.map(async emotion => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      await screenshotAvatar({
        avatar,
        canvas,
        emotion,
      });

      const imageBitmap = await createImageBitmap(canvas);
      return imageBitmap;
    }),
  );

  avatar.destroy();

  return emotionCanvases;
}
