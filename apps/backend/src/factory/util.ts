import { logger } from '@user-office-software/duo-logger';
import { DateTime } from 'luxon';

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

const DATE_TIMESTAMP_FORMAT = 'yyyy-MM-dd_HHmmss';

export const getCurrentTimestamp = () =>
  DateTime.now().toUTC().toFormat(DATE_TIMESTAMP_FORMAT);
