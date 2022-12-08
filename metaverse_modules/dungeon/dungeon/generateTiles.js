import {getAssetURL} from './asset_db';
import axios from 'axios';
import Agent from 'agentkeepalive';

const CATEGORIZER_URL =
  'https://cors-anywhere.herokuapp.com/http://216.153.50.206:7777';
const IMAGE_URL =
  'https://cors-anywhere.herokuapp.com/https://stable-diffusion.webaverse.com/image';
let agent = null;

export const getBiomeType = async prompt => {
  const resp = await axios.get(CATEGORIZER_URL, {
    params: {
      prompt: prompt,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    },
  });

  return resp.data.result;
};

export const getBiomeInfo = async inputPrompt => {
  const resp = await axios.post(
    'https://cors-anywhere.herokuapp.com/http://216.153.50.206:7777/completion',
    {
      prompt: inputPrompt,
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    },
  );

  return resp.data.result;
};

const b64toBlob = (b64Data, contentType = '', sliceSize = 512) => {
  const byteCharacters = atob(b64Data);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);

    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  const blob = new Blob(byteArrays, {type: contentType});
  return blob;
};

export const generateImageNew = async (
  prompt,
  strength = 0.85,
  guidance_scale = 7.5,
) => {
  if (!agent) {
    agent = new Agent({
      maxSockets: 100,
      maxFreeSockets: 10,
      timeout: 60000,
      freeSocketTimeout: 30000,
    });
  }

  console.log('input prompt:', prompt);
  const assetURL = getAssetURL(prompt);
  if (!assetURL) {
    return null;
  }

  const body = {
    input: {
      input: assetURL,
      prompts: prompt,
      strength: strength,
      guidance_scale: guidance_scale,
      split: 'none',
    },
  };
  console.log('body:', body);
  const resp = await axios.post(
    'https://cors-anywhere.herokuapp.com/http://216.153.52.17/predictions',
    body,
    {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      httpAgent: agent,
    },
  );
  console.log(resp);

  const blobs = [];
  for (const file of resp.data.output.file[0]) {
    const blob = b64toBlob(file.split(',')[1], 'image/png');
    const url = URL.createObjectURL(blob);
    console.log(prompt, ':', url);
    blobs.push(url);
  }

  return blobs.length === 1 ? blobs[0] : blobs;
};

const prompts = ['Scary Dungeon', 'Candy Dungeon'];

const makePrompt = i => {
  if (i === 0) {
    return 'ground';
  } else if (i === 1) {
    return 'w_wall';
  } else if (i === 2) {
    return 's_e_wall';
  } else if (i === 3) {
    return 'nw_wall';
  } else if (i === 4) {
    return 'ne_wall';
  } else if (i === 5) {
    return 'n_nw_w_wall';
  } else if (i === 6) {
    return 'w_e_wall';
  } else if (i === 7) {
    return 'n_wall';
  } else if (i === 8) {
    return 'n_ne_e_wall';
  } else if (i === 9) {
    return 'e_wall';
  } else if (i === 10) {
    return 's_wall';
  } else if (i === 11) {
    return 'all_wall';
  } else if (i === 12) {
    return 'door';
  } else if (i === 13) {
    return 'peak';
  } else if (i === 14) {
    return 'bone';
  } else if (i === 15) {
    return 'flag';
  } else if (i === 16) {
    return 'crate_silver';
  } else if (i === 17) {
    return 'crate_wood';
  } else if (i === 18) {
    return 'handcuff';
  } else if (i === 19) {
    return 'skull';
  } else if (i === 20) {
    return 'lamp';
  } else if (i === 21) {
    return 'stones_large';
  } else if (i === 22) {
    return 'stones_small';
  } else if (i === 23) {
    return 'web_left';
  } else if (i === 24) {
    return 'web_right';
  } else if (i === 25) {
    return 'health_large';
  } else if (i === 26) {
    return 'health_small';
  } else if (i === 27) {
    return 'key_gold';
  } else if (i === 28) {
    return 'key_silver';
  } else if (i === 29) {
    return 'mana_small';
  } else if (i === 30) {
    return 'mana_large';
  } else if (i === 31) {
    return 'ladder';
  } else if (i === 32) {
    return 'torch';
  } else if (i === 33) {
    return 'edge';
  } else if (i === 34) {
    return 'hole';
  }
};

export async function generateTiles() {
  const basePrompt = prompts[Math.floor(Math.random() * prompts.length)];
  const sprites = {};

  const biomeType = (await getBiomeType(basePrompt)).trim();
  const biomeInfo = (await getBiomeInfo(basePrompt)).trim();

  console.log(
    'base prompt:',
    basePrompt,
    'biome type:',
    biomeType,
    'biome info:',
    biomeInfo,
  );

  const maxCount = 35;
  let currentCount = 0;
  const start = Date.now();

  for (let i = 0; i < maxCount; i++) {
    const prompt = `${biomeInfo} ${makePrompt(i)}`;

    generateImageNew(makePrompt(i)).then(img => {
      currentCount++;
      if (!img) {
        return;
      }

      sprites[makePrompt(i)] = img;
    });
  }

  while (currentCount < maxCount) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('currentCount / maxCount:', currentCount, maxCount);
  }

  const done = Date.now();
  console.log('done in:', done - start);

  return sprites;
}
