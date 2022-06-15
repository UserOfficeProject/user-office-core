import { logger } from '@user-office-software/duo-logger';
import { DateTime } from 'luxon';
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
  new Promise((resolve) => {
    const buffer: Buffer[] = [];

    req.on('data', (chunk) =>
      buffer.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
    );

    req.on('complete', () => resolve(Buffer.concat(buffer).toString()));
  });

const DATE_TIMESTAMP_FORMAT = 'yyyy-MM-dd_HHmmss';

export const getCurrentTimestamp = () =>
  DateTime.now().toUTC().toFormat(DATE_TIMESTAMP_FORMAT);
