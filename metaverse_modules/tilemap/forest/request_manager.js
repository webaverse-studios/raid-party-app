import axios from 'axios';
import JSZip from 'jszip';
import Agent from 'agentkeepalive';

const CATEGORIZER_URL =
  'https://cors.webaverse.studio/http://216.153.50.206:7777';
const IMAGE_URL =
  'https://cors.webaverse.studio/https://stable-diffusion.webaverse.com/image';
const SPRITESHEET_URL =
  'https://cors.webaverse.studio/http://216.153.52.56:7777';
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

export const generateImageCache = async (prompt, biomeType) => {
  const resp = await axios.get(
    'https://cors.webaverse.studio/http://216.153.50.206:7778',
    {
      params: {
        imgType: prompt,
        biomeType,
      },
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
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
    const houses = [
      'https://cdn.discordapp.com/attachments/1046461392913440789/1055518031863885904/house_5-removebg-preview.png',
      'https://cdn.discordapp.com/attachments/1046461392913440789/1055518772078858250/CicPTs-removebg-preview.png',
      'https://cdn.discordapp.com/attachments/1046461392913440789/1055839085845020742/1006-10063387_pixelart-pixel-art-viking-house-removebg-preview.png',
      'https://cdn.discordapp.com/attachments/1046461392913440789/1055839085496914001/housee-removebg-preview.png',
      'https://cdn.discordapp.com/attachments/1046461392913440789/1055831264483102771/Stardew-Valley-8_11_2022-1_09_40-AM-1080x675.jpg.png',
      'https://cdn.discordapp.com/attachments/1046461392913440789/1056900825953341520/barn.png',
      'https://cdn.discordapp.com/attachments/1046461392913440789/1056900826574110720/Blacksmith1.png',
      'https://cdn.discordapp.com/attachments/1046461392913440789/1056900827001933854/blacksmith.png',
      'https://cdn.discordapp.com/attachments/1046461392913440789/1056900827530412102/carpenter_s_shop.png',
      'https://cdn.discordapp.com/attachments/1046461392913440789/1056900828000178186/castle_keep.png',
      'https://cdn.discordapp.com/attachments/1046461392913440789/1056900828897755136/chateau.png',
      'https://cdn.discordapp.com/attachments/1046461392913440789/1056900830122479666/double_house.png',
      'https://cdn.discordapp.com/attachments/1046461392913440789/1056900838829850644/fountain.png',
      'https://cdn.discordapp.com/attachments/1046461392913440789/1056900839236710521/gazebo.png',
      'https://cdn.discordapp.com/attachments/1046461392913440789/1056900839576436736/grass-covered_house.png',
      'https://cdn.discordapp.com/attachments/1046461392913440789/1056900840276897832/half-timbered_house.png',
      'https://cdn.discordapp.com/attachments/1046461392913440789/1056900840947986462/house_and_well.png',
      'https://cdn.discordapp.com/attachments/1046461392913440789/1056900841296101427/house_and_woodpile.png',
      'https://cdn.discordapp.com/attachments/1046461392913440789/1056900841681989673/imperial_base.png',
      'https://cdn.discordapp.com/attachments/1046461392913440789/1056900873592246292/little_house.png',
      'https://cdn.discordapp.com/attachments/1046461392913440789/1056900873890058280/manor.png',
      'https://cdn.discordapp.com/attachments/1046461392913440789/1056900874166874153/mansion.png',
      'https://cdn.discordapp.com/attachments/1046461392913440789/1056900874439495690/market.png',
      'https://cdn.discordapp.com/attachments/1046461392913440789/1056900874741501962/rundown_cabin.png',
      'https://cdn.discordapp.com/attachments/1046461392913440789/1056900891061538816/Saloon.png',
      'https://cdn.discordapp.com/attachments/1046461392913440789/1056900891493531767/shed.png',
      'https://cdn.discordapp.com/attachments/1046461392913440789/1056900892537929818/shop.png',
      'https://cdn.discordapp.com/attachments/1046461392913440789/1056900892911206420/simple_house.png',
      'https://cdn.discordapp.com/attachments/1046461392913440789/1056900893271933028/small_castle.png',
      'https://cdn.discordapp.com/attachments/1046461392913440789/1056900893578121267/small_house.png',
      'https://cdn.discordapp.com/attachments/1046461392913440789/1056900894039490600/snowy_house.png',
      'https://cdn.discordapp.com/attachments/1046461392913440789/1056900894395990068/space_station.png',
      'https://cdn.discordapp.com/attachments/1046461392913440789/1056900902964957246/tiny_house.png',
      'https://cdn.discordapp.com/attachments/1046461392913440789/1056900903782846504/town_hall.jpg',
      'https://cdn.discordapp.com/attachments/1046461392913440789/1056900904151957554/Trailer.png',
      'https://cdn.discordapp.com/attachments/1046461392913440789/1056900904625901578/Witch_s_Hut.png',
    ];
    return houses[Math.floor(Math.random() * houses.length)];
  } else if (
    (prompt.includes('forest') || prompt.includes('grass')) &&
    !prompt.includes('deep')
  ) {
    const forests = [
      'https://cdn.discordapp.com/attachments/632242008148148225/1049227184285421618/sprite_010.png',
    ];
    return forests[Math.floor(Math.random() * forests.length)];
  } else if (prompt.includes('stone')) {
    const stones = [
      'https://cdn.discordapp.com/attachments/632242008148148225/1049227226186530846/sprite_067.png',
    ];
    return stones[Math.floor(Math.random() * stones.length)];
  } else if (prompt.includes('water')) {
    const waters = [
      'https://cdn.discordapp.com/attachments/632242008148148225/1049227245383847956/sprite_192.png',
    ];
    return waters[Math.floor(Math.random() * waters.length)];
  } else if (prompt.includes('sand') && !prompt.includes('bush')) {
    const sands = [
      'https://cdn.discordapp.com/attachments/632242008148148225/1052945791678947409/flowering_bush.png',
    ];
    return sands[Math.floor(Math.random() * sands.length)];
  } else if (prompt.includes('deep forest')) {
    const deepForests = [
      'https://cdn.discordapp.com/attachments/632242008148148225/1049227265063526420/sprite_199.png',
    ];
    return deepForests[Math.floor(Math.random() * deepForests.length)];
  } else if (prompt.includes('path')) {
    const paths = [
      'https://cdn.discordapp.com/attachments/632242008148148225/1049227296646635530/sprite_213.png',
    ];
    return paths[Math.floor(Math.random() * paths.length)];
  } else if (prompt.includes('rock')) {
    const rocks = [
      'https://cdn.discordapp.com/attachments/632242008148148225/1052945805440454686/rock_pile.png',
      'https://cdn.discordapp.com/attachments/632242008148148225/1052945805910212699/ruin_stones.png',
    ];
    return rocks[Math.floor(Math.random() * rocks.length)];
  } else if (prompt.includes('sand bush')) {
    const sandBushes = [
      'https://cdn.discordapp.com/attachments/632242008148148225/1050747990505181204/pile_of_stones.png',
      'https://cdn.discordapp.com/attachments/632242008148148225/1050748906780233758/ruin_stones.png',
    ];
    return sandBushes[Math.floor(Math.random() * sandBushes.length)];
  } else if (prompt.includes('torch')) {
    const torches = [
      'https://cdn.discordapp.com/attachments/632242008148148225/1050328302637817867/torch.png',
      'https://cdn.discordapp.com/attachments/1046461392913440789/1055521896881463387/torch.png',
    ];
    return torches[Math.floor(Math.random() * torches.length)];
  } else if (prompt.includes('bush') && !prompt.includes('sand')) {
    const bushes = [
      'https://cdn.discordapp.com/attachments/632242008148148225/1052945804949733456/raspberry_bush.png',
      'https://cdn.discordapp.com/attachments/632242008148148225/1052945791678947409/flowering_bush.png',
    ];
    return bushes[Math.floor(Math.random() * bushes.length)];
  } else if (prompt.includes('flower')) {
    const flowers = [
      'https://cdn.discordapp.com/attachments/632242008148148225/1052945793671233546/flower_1.png',
      'https://cdn.discordapp.com/attachments/632242008148148225/1052945794103255080/flower_2.png',
    ];
    return flowers[Math.floor(Math.random() * flowers.length)];
  } else if (prompt.includes('tree')) {
    const trees = [
      'https://cdn.discordapp.com/attachments/1046461392913440789/1055485235346817168/init_tree.png',
      'https://cdn.discordapp.com/attachments/1046461392913440789/1055143952866623529/treeinit.png',
      'https://cdn.discordapp.com/attachments/1046461392913440789/1055847557726736475/tree_pngg-removebg-preview.png',
      'https://cdn.discordapp.com/attachments/1046461392913440789/1055848388450594876/treee-removebg-preview.png',
    ];
    return trees[Math.floor(Math.random() * trees.length)];
  }
};

export const generateImageNew = async (
  prompt,
  strength = 0.85,
  guidance_scale = 7.5,
  is_tile = false,
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
      req_type: is_tile ? 'tile' : 'asset',
    },
  };
  console.log('body:', body);
  const resp = await axios.post(
    'https://cors.webaverse.studio/https://ai_prod.webaverse.studio/predictions',
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
    blobs.push(URL.createObjectURL(blob));
  }

  return blobs.length === 1 ? blobs[0] : blobs;
};

export const forestExists = async (input, biomeType) => {
  const resp = await axios.get(
    'https://cors.webaverse.studio/http://216.153.50.206:7778/check',
    {
      params: {
        imgType: input,
        biomeType: biomeType,
      },
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      responseType: 'json',
    },
  );
  return resp.data;
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
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
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
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
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
