import axios from 'axios';

/**
 * Generate spritesheet by describe
 * @param {String} describe
 * @param {Boolean} toDataUri
 * @returns
 */
export async function generateAvatar(describe) {
  const res = await axios.get(
    'http://localhost:8080/http://216.153.52.56:7777',
    {
      params: {
        s: describe,
      },
      responseType: 'blob',
    },
  );

  return res.data;
}
