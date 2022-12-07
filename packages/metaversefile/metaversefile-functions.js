import mimeTypes from "mime-types";
import fetch from "node-fetch";
import path from "path";
import url from "url";
import { contractNames } from "./constants.json";

import * as cryptovoxels from "./contracts/cryptovoxels.js";
import * as loomlock from "./contracts/loomlock.js";
import * as moreloot from "./contracts/moreloot.js";
export const contracts = {
  cryptovoxels,
  moreloot,
  loomlock,
};

import * as directory from "./types/directory.js";
import * as gamesettings from "./types/gamesettings.js";
import * as gif from "./types/gif.js";
import * as glb from "./types/glb.js";
import * as glbb from "./types/glbb.js";
import * as gltj from "./types/gltj.js";
import * as group from "./types/group.js";
import * as html from "./types/html.js";
import * as hyperfy from "./types/hyperfy.js";
import * as image from "./types/image.js";
import * as jsx from "./types/jsx.js";
import * as light from "./types/light.js";
import * as lore from "./types/lore.js";
import * as metaversefileLoader from "./types/metaversefile.js";
import * as mob from "./types/mob.js";
import * as npc from "./types/npc.js";
import * as quest from "./types/quest.js";
import * as react from "./types/react.js";
import * as rendersettings from "./types/rendersettings.js";
import * as scene2D from "./types/scene2D.js";
import * as scn from "./types/scn.js";
import * as spawnpoint from "./types/spawnpoint.js";
import * as sprite from "./types/sprite.js";
import * as text from "./types/text.js";
import * as vircadia from "./types/vircadia.js";
import * as vox from "./types/vox.js";
import * as vrm from "./types/vrm.js";
import * as wind from "./types/wind.js";

export const loaders = {
  js: jsx,
  jsx,
  metaversefile: metaversefileLoader,
  glb,
  vrm,
  vox,
  png: image,
  jpg: image,
  jpeg: image,
  svg: image,
  gif,
  glbb,
  gltj,
  html,
  scn,
  hyperfy,
  light,
  text,
  // fog,
  // background,
  rendersettings,
  gamesettings,
  spawnpoint,
  lore,
  quest,
  npc,
  mob,
  react,
  group,
  wind,
  vircadia,
  sprite,
  scene2D,
  '': directory,
};

import upath from "unix-path";

const dataUrlRegex = /^data:([^;,]+)(?:;(charset=utf-8|base64))?,([\s\S]*)$/;

const getType = id => {
  id = id.replace(/^\/@proxy\//, '');

  const o = url.parse(id, true);
  // console.log('get type', o, o.href.match(dataUrlRegex));
  let match;
  if (o.href && (match = o.href.match(dataUrlRegex))) {
    let type = match[1] || '';
    if (type === 'text/javascript') {
      type = 'application/javascript';
    }
    let extension;
    let match2;
    if (match2 = type.match(/^application\/(light|text|gamesettings|rendersettings|spawnpoint|lore|quest|npc|mob|react|group|wind|sprite|scene2D|vircadia|hyperfy)$/)) {
      extension = match2[1];
    } else if (match2 = type.match(/^application\/(javascript)$/)) {
      extension = 'js';
    } else {
      console.log('unknown type', type);
      extension = mimeTypes.extension(type);
      console.log('extension', extension);
    }
    // console.log('got data extension', {type, extension});
    return extension || '';
  } else if (o.hash && (match = o.hash.match(/^#type=(.+)$/))) {
    return match[1] || '';
  } else if (o.query && o.query.type) {
    return o.query.type;
  } else if (match = o.path.match(/\.([^\.\/]+)$/)) {
    return match[1].toLowerCase() || '';
  } else {
    return '';
  }
};

const resolvePathName = (pathName, source) => {
  /**
   * This check is specifically added because of windows 
   * as windows is converting constantly all forward slashes into
   * backward slash
   */
  if (process.platform === 'win32') {
    pathName = pathName.replaceAll('\\', '/').replaceAll('//', '/');
    pathName = path.resolve(upath.parse(pathName).dir, source);
    /** 
     * Whenever path.resolve returns the result in windows it add the drive letter as well
     * Slice the drive letter (c:/, e:/, d:/ ) from the path and change backward slash 
     * back to forward slash.
     */
    pathName = pathName.slice(3).replaceAll('\\', '/');
  } else {
    pathName = path.resolve(path.dirname(pathName), source);
  }
  return pathName;
}

const resolveLoader = loaderId => {
  /**
   * This check is specifically added because of windows 
   * as windows is converting constantly all forward slashes into
   * backward slash
   */
  //console.log(loaderId);
  const cwd = process.cwd();
  if (process.platform === 'win32') {
    //if(loaderId.startsWith(cwd) || loaderId.replaceAll('/','\\').startsWith(cwd)){
    //  loaderId = loaderId.slice(cwd.length);
    //}else if(loaderId.startsWith('http') || loaderId.startsWith('https')){
    //  loaderId = loaderId.replaceAll('\\','/');
    //}
    loaderId = loaderId.replaceAll('\\', '/');

    // if(loaderId.startsWith('http') || loaderId.startsWith('https')){
    //   loaderId = loaderId.replaceAll('\\','/');
    // }
  }
  return loaderId;
}

export const resolveId = async (source, importer) => {
  // do not resolve node module subpaths
  {
    if (/^((?:@[^\/]+\/)?[^\/:\.][^\/:]*)(\/[\s\S]*)$/.test(source)) {
      return null;
    }
  }

  let replaced = false;
  if (/^\/@proxy\//.test(source)) {
    source = source
      .replace(/^\/@proxy\//, '')
      .replace(/^(https?:\/(?!\/))/, '$1/');
    replaced = true;
  }
  if (/^ipfs:\/\//.test(source)) {
    source = source.replace(/^ipfs:\/\/(?:ipfs\/)?/, 'https://cloudflare-ipfs.com/ipfs/');

    const o = url.parse(source, true);
    if (!o.query.type) {
      const res = await fetch(source, {
        method: 'HEAD',
      });
      if (res.ok) {
        const contentType = res.headers.get('content-type');
        const typeTag = mimeTypes.extension(contentType);
        if (typeTag) {
          source += `#type=${typeTag}`;
        } else {
          console.warn('unknown IPFS content type:', contentType);
        }
      }
    }
  }

  let match;
  if (match = source.match(/^eth:\/\/(0x[0-9a-f]+)\/([0-9]+)$/)) {
    const address = match[1];
    const contractName = contractNames[address];
    const contract = contracts[contractName];
    const resolveId = contract?.resolveId;
    // console.log('check contract', resolveId);
    if (resolveId) {
      const source2 = await resolveId(source, importer);
      return source2;
    }
  }

  const type = getType(source);
  const loader = loaders[type];
  const resolveId = loader?.resolveId;
  if (resolveId) {
    const source2 = await resolveId(source, importer);
    if (source2 !== undefined) {
      return source2;
    }
  }
  if (replaced) {
    return source;
  } else {
    if (/^https?:\/\//.test(importer)) {
      o = url.parse(importer);
      if (/\/$/.test(o.pathname)) {
        o.pathname += '.fakeFile';
      }
      o.pathname = resolvePathName(o.pathname, source);
      s = '/@proxy/' + url.format(o);
      return s;
    } else {
      return null;
    }
  }
};

export const load = async (id) => {
  id = id.replace(/^(eth:\/(?!\/))/, '$1/')

  let match;
  if (match = id.match(/^eth:\/\/(0x[0-9a-f]+)\/([0-9]+)$/)) {
    const address = match[1];
    const contractName = contractNames[address];
    const contract = contracts[contractName];
    const load = contract?.load;
    if (load) {
      const src = await load(id);
      if (src !== null && src !== undefined) {
        return src;
      }
    }
  }

  const type = getType(id);
  const loader = loaders[type];
  const load = loader?.load;

  if (load) {
    id = resolveLoader(id);
    const src = await load(id);
    if (src !== null && src !== undefined) {
      return src;
    }
  }

  if (/^https?:\/\//.test(id)) {
    const res = await fetch(id)
    const text = await res.text();
    return text;
  } else if (match = id.match(dataUrlRegex)) {
    // console.log('load 3', match);
    // const type = match[1];
    const encoding = match[2];
    const src = match[3];
    // console.log('load data url!!!', id, match);
    if (encoding === 'base64') {
      return atob(src);
    } else {
      return decodeURIComponent(src);
    }
  } else {
    return null;
  }
}

export const transform = async (src, id) => {
  const type = getType(id);
  const loader = loaders[type];
  const transform = loader?.transform;
  if (transform) {
    return await transform(src, id);
  }
  return null;
}