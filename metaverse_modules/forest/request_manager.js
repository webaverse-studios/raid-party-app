import axios from 'axios';
import JSZip from 'jszip';
import Agent from 'agentkeepalive';

const CATEGORIZER_URL = 'http://127.0.0.1:8080/http://216.153.50.206:7777';
const IMAGE_URL =
  'http://127.0.0.1:8080/https://stable-diffusion.webaverse.com/image';
const SPRITESHEET_URL = 'http://127.0.0.1:8080/http://216.153.52.56:7777';
let agent = null;

export const getBiomeType = async prompt => {
  const resp = await axios.get(CATEGORIZER_URL, {
    params: {
      prompt: prompt,
    },
  });

  return resp.data.result;
};

export const getBiomeInfo = async inputPrompt => {
  const resp = await axios.post(
    'http://127.0.0.1:8080/http://216.153.50.206:7777/completion',
    {
      prompt: inputPrompt,
    },
  );

  return resp.data.result;
};

export const generateImageCache = async prompt => {
  const resp = await axios.get(
    'http://127.0.0.1:8080/http://216.153.50.206:7778',
    {
      params: {
        imgType: prompt,
      },
      responseType: 'blob',
    },
  );
  //check if blob is zip and unzip it
  const blob = resp.data;
  const blobType = blob.type;
  if (blobType === 'application/x-zip-compressed') {
    const zip = new JSZip();
    const zipFile = await zip.loadAsync(blob);
    //get the blobs from the zip
    const blobs = [];
    for (const filename in zipFile.files) {
      const file = zipFile.files[filename];
      const blob = await file.async('blob');
      blobs.push(URL.createObjectURL(blob));
    }

    return blobs;
  }

  return URL.createObjectURL(blob);
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

const getInputImageFrom = prompt => {
  if (prompt.includes('house')) {
    return 'https://cdn.discordapp.com/attachments/1042463989407416402/1047536541498626128/candy_shop_1.png';
  } else if (
    (prompt.includes('forest') || prompt.includes('grass')) &&
    !prompt.includes('deep')
  ) {
    return 'https://cdn.discordapp.com/attachments/632242008148148225/1049227184285421618/sprite_010.png';
  } else if (prompt.includes('rock')) {
    return 'https://cdn.discordapp.com/attachments/632242008148148225/1049227226186530846/sprite_067.png';
  } else if (prompt.includes('water')) {
    return 'https://cdn.discordapp.com/attachments/632242008148148225/1049227245383847956/sprite_192.png';
  } else if (prompt.includes('sand') && !prompt.includes('bush')) {
    return 'https://cdn.discordapp.com/attachments/632242008148148225/1049227264581177404/sprite_198.png';
  } else if (prompt.includes('deep forest')) {
    return 'https://cdn.discordapp.com/attachments/632242008148148225/1049227265063526420/sprite_199.png';
  } else if (prompt.includes('path')) {
    return 'https://cdn.discordapp.com/attachments/632242008148148225/1049227296646635530/sprite_213.png';
  } else if (prompt.includes('stone')) {
    return 'https://cdn.discordapp.com/attachments/632242008148148225/1049227466629206056/sprite_177.png';
  } else if (prompt.includes('sand bush')) {
    return 'https://cdn.discordapp.com/attachments/632242008148148225/1049227673190289408/sprite_174.png';
  } else if (prompt.includes('torch')) {
    return 'https://cdn.discordapp.com/attachments/632242008148148225/1049227673492258878/torch.png';
  } else if (prompt.includes('bush') && !prompt.includes('sand')) {
    return 'https://cdn.discordapp.com/attachments/632242008148148225/1049227673806843944/sprite_175.png';
  } else if (prompt.includes('flower')) {
    return 'https://cdn.discordapp.com/attachments/632242008148148225/1049227674121424906/sprite_179.png';
  } else if (prompt.includes('tree')) {
    return 'https://cdn.discordapp.com/attachments/632242008148148225/1049234355601539143/sprite_0.png';
  }
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

  const body = {
    input: {
      input: getInputImageFrom(prompt),
      prompts: prompt,
      strength: strength,
      guidance_scale: guidance_scale,
      split: prompt.includes('tree')
        ? 'splitHeightTo2'
        : prompt.includes('house')
        ? 'splitImageTo9'
        : 'none',
    },
  };
  console.log('body:', body);
  const resp = await axios.post(
    'http://127.0.0.1:8080/http://216.153.52.17/predictions',
    body,
    {
      headers: {
        'Content-Type': 'application/json',
      },
      httpAgent: agent,
    },
  );
  console.log(resp);

  const blobs = [];
  for (const file of resp.data.output.file[0]) {
    const blob = b64toBlob(file.split(',')[1], 'image/png');
    blobs.push(URL.createObjectURL(blob));
  }

  return blobs.length === 1 ? blobs[0] : blobs;
};

export const generateImage = async prompt => {
  const params = {
    s: prompt + ' 2d top down game invisible background',
    height: 32,
    width: 32,
  };
  const resp = await axios.get(IMAGE_URL, {
    query: params,
    params: params,
    responseType: 'blob',
  });

  //check if blob is zip and unzip it
  const blob = resp.data;
  const blobType = blob.type;
  if (blobType === 'application/zip') {
    const zip = new JSZip();
    const zipFile = await zip.loadAsync(blob);
    //get the blobs from the zip
    const blobs = [];
    for (const filename in zipFile.files) {
      const file = zipFile.files[filename];
      const blob = await file.async('blob');
      blobs.push(URL.createObjectURL(blob));
    }

    return blobs;
  }

  return URL.createObjectURL(resp.data);
};

export const generateSpritesheet = async prompt => {
  const params = {
    s: prompt + ' 2d top down game invisible background',
    height: 32,
    width: 32,
  };
  const resp = await axios.get(IMAGE_URL, {
    query: params,
    params: params,
    responseType: 'blob',
  });

  //check if blob is zip and unzip it
  const blob = resp.data;
  const blobType = blob.type;
  if (blobType === 'application/zip') {
    const zip = new JSZip();
    const zipFile = await zip.loadAsync(blob);
    //get the blobs from the zip
    const blobs = [];
    for (const filename in zipFile.files) {
      const file = zipFile.files[filename];
      const blob = await file.async('blob');
      blobs.push(URL.createObjectURL(blob));
    }

    return blobs;
  }

  return URL.createObjectURL(resp.data);
};
