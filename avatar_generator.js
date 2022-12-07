import axios from 'axios';

export default async function generateAvatar(prompt, toDataUri) {
  const resp = await axios.get('http://216.153.52.56:7777', {
    params: {
      s: prompt,
    },
    responseType: 'blob',
  });
  return toDataUri ? URL.createObjectURL(resp.data) : resp.data;
}
