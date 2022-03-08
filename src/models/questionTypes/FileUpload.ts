import fs from 'fs/promises';

import { logger } from '@user-office-software/duo-logger';
import { fileUploadQuestionValidationSchema } from '@user-office-software/duo-validation';
import fileTypeInfo from 'magic-bytes.js';
import { GuessedFile } from 'magic-bytes.js/dist/model/tree';
import { container } from 'tsyringe';

import FileMutations from '../../mutations/FileMutations';
import { FileUploadConfig } from '../../resolvers/types/FieldConfig';
import { QuestionTemplateRelation } from '../../resolvers/types/QuestionTemplateRelation';
import { QuestionFilterCompareOperator } from '../Questionary';
import { isRejection } from '../Rejection';
import { DataType } from '../Template';
import { Question } from './QuestionRegistry';

export const fileUploadDefinition: Question = {
  dataType: DataType.FILE_UPLOAD,
  validate: async (field: QuestionTemplateRelation, value: any) => {
    const fileMutations = container.resolve(FileMutations);

    if (!(await fileUploadQuestionValidationSchema(field).isValid(value))) {
      return false;
    }

    const isValidType = async (fileId: string): Promise<boolean> => {
      const errorContext = {
        question: field,
        answer: value,
        fileId: fileId,
      };

      const path = await fileMutations.prepare(fileId);

      if (isRejection(path)) {
        logger.logInfo(
          'Could not retrieve file to validate file upload question',
          errorContext
        );

        return true; // Allow the file
      }

      let data: Buffer;

      try {
        data = await fs.readFile(path);
      } catch (error) {
        logger.logInfo('Could not read file to validate file upload question', {
          error: error,
          ...errorContext,
        });

        return true; // Allow the file
      }

      const possibleTypes: string[] = [];

      const getFileInfo = async (data: Buffer) => {
        fileTypeInfo(data).forEach((type: GuessedFile) => {
          if (type.extension) {
            possibleTypes.push('.'.concat(type.extension));
          }
          if (type.mime) {
            possibleTypes.push(type.mime);
          }
        });
      };

      await getFileInfo(data);

      fs.unlink(path);

      const config = field.config as FileUploadConfig;

      return possibleTypes.some((type) => {
        const anySubtype = type.split('/')[0]?.concat('/*'); // e.g. 'image/*'

        return (
          config.file_type.includes(type) ||
          config.file_type.includes(anySubtype)
        );
      });
    };

    const results: boolean[] = value.map(async (file: { id: string }) => {
      return await isValidType(file.id);
    });

    return (await Promise.all(results)).every((result) => {
      return result;
    });
  },
  createBlankConfig: (): FileUploadConfig => {
    const config = new FileUploadConfig();
    config.small_label = '';
    config.required = false;
    config.tooltip = '';
    config.file_type = [];
    config.max_files = 0;

    return config;
  },
  getDefaultAnswer: () => [],
  filterQuery: (queryBuilder, filter) => {
    const value = JSON.parse(filter.value).value;
    switch (filter.compareOperator) {
      case QuestionFilterCompareOperator.EXISTS:
        if (value === true) {
          return queryBuilder.andWhereRaw(
            "jsonb_array_length((answers.answer->>'value')::jsonb) > 0"
          );
        } else {
          return queryBuilder.andWhereRaw(
            "jsonb_array_length((answers.answer->>'value')::jsonb) = 0"
          );
        }

      default:
        throw new Error(
          `Unsupported comparator for Boolean ${filter.compareOperator}`
        );
    }
  },
};
