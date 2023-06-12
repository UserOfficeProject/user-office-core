import fs from 'fs';

import fetch from 'cross-fetch';

export function downloadFile(args: any) {
  return fetch(args.url, {
    headers: {
      authorization: `Bearer ${args.token}`,
    },
  })
    .then((response: any) => {
      if (!response) {
        throw new Error('No response');
      }

      if (response.status !== 200) {
        throw new Error('Bad status code: ' + response.status);
      }

      return response.arrayBuffer();
    })
    .then(function (arrayBuffer: any) {
      const myBuffer = new Uint8Array(arrayBuffer);
      fs.writeFileSync(args.filename, myBuffer);

      return 'downloadFile ' + args.filename + ' downloaded';
    });
}
