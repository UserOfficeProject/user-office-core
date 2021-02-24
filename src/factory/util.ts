import { logger } from '@esss-swap/duo-logger';
import moment from 'moment';
import request from 'request';

import { Answer } from '../models/Questionary';
import { DataType } from '../models/Template';

export type Attachment = { id: string; figure?: string; caption?: string };

export const getFileAttachments = (answer: Answer): Attachment[] => {
  if (answer.question.dataType === DataType.FILE_UPLOAD && answer.value) {
    if (Array.isArray(answer.value)) {
      return answer.value;
    } else {
      logger.logError(
        'Questionary answer with DataType `FILE_UPLOAD` has neither string nor array value',
        { answer }
      );

      return [];
    }
  }

  return [];
};

export const bufferRequestBody = (req: request.Request) =>
  new Promise(resolve => {
    const buffer: Buffer[] = [];

    req.on('data', chunk =>
      buffer.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
    );

    req.on('complete', () => resolve(Buffer.concat(buffer).toString()));
  });

export function getCurrentTimestamp() {
  return moment.utc().format('YYYY-MM-DD_hhmmss');
}
