import { Answer } from '../../models/Questionary';
import { DataType } from '../../models/Template';
import { logger } from '../../utils/Logger';

export const getFileAttachmentIds = (answer: Answer) => {
  if (answer.question.dataType === DataType.FILE_UPLOAD && answer.value) {
    if (Array.isArray(answer.value)) {
      return answer.value;
    } else if (typeof answer.value === 'string') {
      return answer.value.split(',');
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
