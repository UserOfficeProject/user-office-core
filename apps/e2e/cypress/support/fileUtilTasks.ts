import fs from 'fs';

import fetch from 'cross-fetch';
import pdf from 'pdf-parse';
import * as xlsx from 'xlsx';

export type DownloadFileResult = { success: boolean; message: string };

export async function downloadFile(args: {
  url: string;
  token: string;
  filename: string;
  downloadsFolder: string;
}): Promise<DownloadFileResult> {
  try {
    const response = await fetch(args.url, {
      headers: {
        authorization: `Bearer ${args.token}`,
      },
    });

    if (!response) {
      return { success: false, message: 'No response received from server' };
    }

    if (response.status !== 200) {
      return {
        success: false,
        message: `Bad status code: ${response.status}`,
      };
    }

    const arrayBuffer = await response.arrayBuffer();

    if (!fs.existsSync(args.downloadsFolder)) {
      fs.mkdirSync(args.downloadsFolder, { recursive: true });
    }

    const fullPath = `${args.downloadsFolder}/${args.filename}`;
    fs.writeFileSync(fullPath, Buffer.from(arrayBuffer));

    return {
      success: true,
      message: `downloadFile ${args.filename} downloaded`,
    };
  } catch (err: unknown) {
    let message = 'Unknown error';

    if (err instanceof Error) {
      message = err.message;
    } else if (typeof err === 'string') {
      message = err;
    }

    return { success: false, message: message };
  }
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

export const unzip = (args: { source: string; destination: string }) => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const AdmZip = require('adm-zip');
  const zip = new AdmZip(args.source);
  zip.extractAllTo(args.destination);

  return 'Files extracted to' + args.destination;
};

export const convertXlsxToJson = (filePath: string) => {
  const workbook = xlsx.readFile(filePath);
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const jsonData = xlsx.utils.sheet_to_json(worksheet);

  return jsonData;
};

export const deleteFile = (filePath: string) => {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  return null;
};
