import fs from 'fs';

import fetch from 'cross-fetch';
import pdf from 'pdf-parse';

export function downloadFile(args: {
  url: string;
  token: string;
  filename: string;
}) {
  return fetch(args.url, {
    headers: {
      authorization: `Bearer ${args.token}`,
    },
  })
    .then((response: Response) => {
      if (!response) {
        throw new Error('No response');
      }

      if (response.status !== 200) {
        throw new Error('Bad status code: ' + response.status);
      }

      return response.arrayBuffer();
    })
    .then(function (arrayBuffer: ArrayBuffer) {
      const myBuffer = new Uint8Array(arrayBuffer);
      fs.writeFileSync(args.filename, myBuffer);

      return 'downloadFile ' + args.filename + ' downloaded';
    });
}

export const readPdf = (pathToPdf: string) => {
  return new Promise((resolve) => {
    const dataBuffer = fs.readFileSync(pathToPdf);
    pdf(dataBuffer).then(function ({ text, ...args }) {
      const textWithRemovedNewLines = text.replace(/(\r\n|\n|\r)/gm, ' ');

      resolve({ ...args, text: textWithRemovedNewLines });
    });
  });
};
