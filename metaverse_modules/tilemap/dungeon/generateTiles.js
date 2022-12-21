import {getAssetURL} from './asset_db';
import axios from 'axios';
import Agent from 'agentkeepalive';
import {generateImageCache} from '../forest/request_manager';

const CATEGORIZER_URL =
  'https://cors.webaverse.studio/http://216.153.50.206:7777';
const IMAGE_URL =
  'https://cors.webaverse.studio/https://stable-diffusion.webaverse.com/image';
let agent = null;

export const getBiomeType = async prompt => {
  const resp = await axios.get(CATEGORIZER_URL, {
    params: {
      prompt: prompt,
    },
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });

  return resp.data.result;
};

export const getBiomeInfo = async inputPrompt => {
  const resp = await axios.post(
    'https://cors.webaverse.studio/http://216.153.50.206:7777/completion',
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
  label,
  req_type,
  strength = 0.85,
  guidance_scale = 7.5,
  tries = 0,
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
  const assetURL = getAssetURL(label);
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
      req_type: req_type,
    },
  };
  console.log('body:', body);
  const resp = await axios.post(
    'https://cors.webaverse.studio/https://ai_dev.webaverse.studio/predictions',
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

  if (resp.data.output.file[0][0].length < 9000 && tries < 5) {
    console.log(prompt, 'is black');
    return generateImageNew(
      prompt,
      label,
      req_type,
      strength,
      guidance_scale,
      tries + 1,
    );
  }
  for (const file of resp.data.output.file[0]) {
    if (
      prompt.includes('spikes') ||
      prompt.includes('skull') ||
      prompt.includes('bones')
    ) {
      console.log('file:', prompt);
      console.log(file);
      console.log(file.length, '============================================');
    }
    console.log(prompt, 'length:', file.length);
    const blob = b64toBlob(file.split(',')[1], 'image/png');
    const url = URL.createObjectURL(blob);
    console.log(prompt, ':', url);
    blobs.push(url);
  }

  return blobs.length === 1 ? blobs[0] : blobs;
};

const makePrompt = (i, biomeInfo) => {
  const res = {prompt: '', label: '', req_type: 'none', through_cache: false};

  if (i === 0) {
    res.prompt = biomeInfo + ' ground tile';
    res.label = 'ground';
    res.req_type = 'tile';
    res.through_cache = true;
  } else if (i === 1) {
    res.prompt = biomeInfo + ' west wall tile';
    res.label = 'w_wall';
    res.req_type = 'tile';
    res.through_cache = true;
  } else if (i === 2) {
    res.prompt = biomeInfo + ' south east wall tile';
    res.label = 's_e_wall';
    res.req_type = 'tile';
    res.through_cache = true;
  } else if (i === 3) {
    res.prompt = biomeInfo + ' north west wall tile';
    res.label = 'nw_wall';
    res.req_type = 'tile';
    res.through_cache = true;
  } else if (i === 4) {
    res.prompt = biomeInfo + ' north east wall tile';
    res.label = 'ne_wall';
    res.req_type = 'tile';
    res.through_cache = true;
  } else if (i === 5) {
    res.prompt = biomeInfo + ' north west west wall tile';
    res.label = 'n_nw_w_wall';
    res.req_type = 'tile';
    res.through_cache = true;
  } else if (i === 6) {
    res.prompt = biomeInfo + ' west east wall tile';
    res.label = 'w_e_wall';
    res.req_type = 'tile';
    res.through_cache = true;
  } else if (i === 7) {
    res.prompt = biomeInfo + ' north wall tile';
    res.label = 'n_wall';
    res.req_type = 'tile';
    res.through_cache = true;
  } else if (i === 8) {
    res.prompt = biomeInfo + ' north east east wall tile';
    res.label = 'n_ne_e_wall';
    res.req_type = 'tile';
    res.through_cache = true;
  } else if (i === 9) {
    res.prompt = biomeInfo + ' east wall tile';
    res.label = 'e_wall';
    res.req_type = 'tile';
    res.through_cache = true;
  } else if (i === 10) {
    res.prompt = biomeInfo + ' south wall tile';
    res.label = 's_wall';
    res.req_type = 'tile';
    res.through_cache = true;
  } else if (i === 11) {
    res.prompt = biomeInfo + ' wall tile';
    res.label = 'all_wall';
    res.req_type = 'tile';
    res.through_cache = true;
  } else if (i === 12) {
    res.prompt = biomeInfo + ' door tile';
    res.label = 'door';
    res.req_type = 'tile';
    res.through_cache = true;
  } else if (i === 13) {
    res.prompt = biomeInfo + ' spikes';
    res.label = 'peak';
  } else if (i === 14) {
    res.prompt = biomeInfo + ' bone';
    res.label = 'bone';
  } else if (i === 15) {
    res.prompt = biomeInfo + ' flag';
    res.label = 'flag';
  } else if (i === 16) {
    res.prompt = biomeInfo + ' silver crate';
    res.label = 'crate_silver';
  } else if (i === 17) {
    res.prompt = biomeInfo + ' wooden crate';
    res.label = 'crate_wood';
  } else if (i === 18) {
    res.prompt = biomeInfo + ' handcuff';
    res.label = 'handcuff';
  } else if (i === 19) {
    res.prompt = biomeInfo + ' skull';
    res.label = 'skull';
  } else if (i === 20) {
    res.prompt = biomeInfo + ' lamp';
    res.label = 'lamp';
  } else if (i === 21) {
    res.prompt = biomeInfo + ' large stone';
    res.label = 'stones_large';
  } else if (i === 22) {
    res.prompt = biomeInfo + ' small stone';
    res.label = 'stones_small';
  } else if (i === 23) {
    res.prompt = biomeInfo + ' web';
    res.label = 'web_left';
  } else if (i === 24) {
    res.prompt = biomeInfo + ' web';
    res.label = 'web_right';
  } else if (i === 25) {
    res.prompt = biomeInfo + ' large health potion';
    res.label = 'health_large';
  } else if (i === 26) {
    res.prompt = biomeInfo + ' small health potion';
    res.label = 'health_small';
  } else if (i === 27) {
    res.prompt = biomeInfo + ' golden key';
    res.label = 'key_gold';
  } else if (i === 28) {
    res.prompt = biomeInfo + ' silver key';
    res.label = 'key_silver';
  } else if (i === 29) {
    res.prompt = biomeInfo + ' small mana potion';
    res.label = 'mana_small';
  } else if (i === 30) {
    res.prompt = biomeInfo + ' large mana potion';
    res.label = 'mana_large';
  } else if (i === 31) {
    res.prompt = biomeInfo + ' ladder';
    res.label = 'ladder';
  } else if (i === 32) {
    res.prompt = biomeInfo + ' torch';
    res.label = 'torch';
  } else if (i === 33) {
    res.prompt = biomeInfo + ' edge tile';
    res.label = 'edge';
    res.through_cache = true;
  } else if (i === 34) {
    res.prompt = biomeInfo + ' hole';
    res.label = 'hole';
    res.through_cache = true;
  }

  return res;
};

export async function generateTiles(biomeType, biomeInfo) {
  const sprites = {};

  const maxCount = 35;
  let currentCount = 0;
  const start = Date.now();

  for (let i = 0; i < maxCount; i++) {
    const data = makePrompt(i, biomeInfo);
    if (data.through_cache) {
      currentCount++;
      /*generateImageCache(
        (data.label === 'all_wall'
          ? biomeInfo + ' all_wall'
          : biomeInfo + ' ' + data.label) + ' ' + biomeTp,
      ).then(img => {
        currentCount++;
        if (!img) {
          return;
        }

        sprites[data.label] = img;
      });*/
    } else {
      generateImageNew(
        data.prompt,
        data.label,
        data.req_type ? data.req_type : 'asset',
      ).then(img => {
        console.log('img:', img);
        currentCount++;
        if (!img) {
          return;
        }

        sprites[data.label] = img;
      });
    }
  }

  while (currentCount < maxCount) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('currentCount / maxCount:', currentCount, maxCount);
  }

  const done = Date.now();
  console.log('done in:', done - start);

  return sprites;
}
