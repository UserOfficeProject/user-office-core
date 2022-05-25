/* eslint-disable quotes */
import fs from 'fs/promises';

import { logger } from '@user-office-software/duo-logger';
import { fileUploadQuestionValidationSchema } from '@user-office-software/duo-validation';
import NodeClam from 'clamscan';
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
    if (!(await fileUploadQuestionValidationSchema(field).isValid(value))) {
      return false;
    }
    const fileMutations = container.resolve(FileMutations);

    return await Promise.all(
      // Map each file to a promise that returns a list of file check results
      value.map((file: { id: string }) => {
        const errorContext = {
          question: field,
          answer: value,
          fileId: file.id,
        };

        return fileMutations.prepare(file.id).then(async (path) => {
          // Check the file id has a valid path
          if (isRejection(path)) {
            logger.logInfo(
              'Could not retrieve file to validate file upload question',
              errorContext
            );

            return Promise.resolve(true); // Allow the file
          } else {
            if (!(await passesVirusScan(path, errorContext))) {
              fs.unlink(path);

              return false;
            }

            const posFileTypes = await identifyFileType(path, errorContext);

            if (!(await isValidFileType(posFileTypes, field))) {
              fs.unlink(path);

              return false;
            }

            fs.unlink(path);

            return true;
          }
        });
      })
    )
      // Convert the list of boolean lists to a flat list of booleans
      .then((results) => results.flat())
      // Return whether they're all true
      .then((results) => results.every((check) => check));
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
            // eslint-disable-next-line quotes
            "jsonb_array_length((answers.answer->>'value')::jsonb) > 0"
          );
        } else {
          return queryBuilder.andWhereRaw(
            // eslint-disable-next-line quotes
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

/**
 * Checks the file signature of a file and returns the identified file types.
 *
 * @param path The path to the file
 * @param errorContext File details to be logged in the event of an error
 * @returns A string array of all possible file and mime types identified from
 * the file's signature. An empty array if there was a problem reading the file
 * or no file types could be identified.
 */
const identifyFileType = async (
  path: string,
  errorContext: any
): Promise<string[]> => {
  let data: Buffer;

  try {
    data = await fs.readFile(path);
  } catch (error) {
    logger.logInfo(
      'Could not read file to identify file upload question type',
      {
        error: error,
        ...errorContext,
      }
    );

    return [];
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

  return possibleTypes;
};

/**
 * Checks if the identified file types of a file is one of the allowed file types.
 *
 * @param identifiedFileTypes The identified file types from the file's signature
 * @param field The question data containing the config
 * @returns True if the required file type in the question configuration
 * is one of the file types identified from the file's signature. False if not.
 */
const isValidFileType = async (
  identifiedFileTypes: string[],
  field: QuestionTemplateRelation
): Promise<boolean> => {
  const config = field.config as FileUploadConfig;

  return identifiedFileTypes.some((type) => {
    const anySubtype = type.split('/')[0]?.concat('/*'); // e.g. 'image/*'

    return (
      config.file_type.includes(type) || config.file_type.includes(anySubtype)
    );
  });
};

/**
 * Checks if a file is deemed to be free of malware by Clam AntiVirus.
 *
 * @param path A valid path to the file to be scanned
 * @param errorContext File details to be logged in the event of an error
 * @returns True if the file is passes the virus scan, or if the scan cannot be
 * performed. False if Clam believes the file to be malicious.
 */
const passesVirusScan = async (
  path: string,
  errorContext: any
): Promise<boolean> => {
  const host = process.env.ANTIVIRUS_HOST;
  const port = process.env.ANTIVIRUS_PORT;

  if (host === undefined || port === undefined) {
    return Promise.resolve(true);
  }

  return new NodeClam()
    .init({
      clamdscan: {
        host,
        port: parseInt(port),
      },
    })
    .then((clamAV) => clamAV.isInfected(path))
    .then((response) => {
      const isInfected = response.isInfected;
      if (isInfected === null) {
        logger.logError('Clamscan was unable to virus scan file', {
          response,
          errorContext,
        });

        return true;
      } else if (isInfected) {
        logger.logError('Infected file was uploaded', {
          response,
          errorContext,
        });
      } else {
        logger.logInfo('Virus scan complete', { response });
      }

      return !isInfected;
    })
    .catch((reason) => {
      logger.logError('Unable to virus scan file', {
        reason,
        errorContext,
      });

      return true;
    });
};
