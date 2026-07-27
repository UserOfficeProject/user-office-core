import * as Yup from 'yup';

import database from './database';
import { validateConfigBeforeWrite } from './TemplateDataSource';
import { getQuestionDefinition } from '../../models/questionTypes/QuestionRegistry';

jest.mock('../database');
jest.mock('../QuestionRegistry');

describe('validateConfigBeforeWrite', () => {
  it('should validate a valid config without throwing', async () => {
    (database as any).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      first: jest.fn().mockResolvedValue({
        data_type: 'instrument_picker',
      }),
    });

    (getQuestionDefinition as jest.Mock).mockReturnValue({
      customYupSchema: Yup.object({
        variant: Yup.string().required(),
        instruments: Yup.array()
          .of(
            Yup.object({
              id: Yup.number().required(),
              name: Yup.string().required(),
            })
          )
          .required(),
        isMultipleSelect: Yup.boolean().required(),
        requestTime: Yup.boolean().required(),
      }),
      validateConfig: jest.fn(),
    });

    const config = JSON.stringify({
      small_label: '',
      required: true,
      tooltip: '',
      readPermissions: [],
      variant: 'radio',
      instruments: [],
      isMultipleSelect: false,
      requestTime: false,
    });

    await expect(
      validateConfigBeforeWrite(config, 'question-1')
    ).resolves.toBeUndefined();
  });

  it('Should throw an error when an extra field is supplied', async () => {
    (database as any).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      first: jest.fn().mockResolvedValue({
        data_type: 'instrument_picker',
      }),
    });

    (getQuestionDefinition as jest.Mock).mockReturnValue({
      customYupSchema: Yup.object({
        variant: Yup.string().required(),
        instruments: Yup.array()
          .of(
            Yup.object({
              id: Yup.number().required(),
              name: Yup.string().required(),
            })
          )
          .required(),
        isMultipleSelect: Yup.boolean().required(),
        requestTime: Yup.boolean().required(),
      }),
      validateConfig: jest.fn(),
    });

    const config = JSON.stringify({
      small_label: '',
      required: true,
      tooltip: '',
      readPermissions: [],
      variant: 'radio',
      instruments: [],
      isMultipleSelect: false,
      requestTime: false,
      extraField: true,
    });

    await expect(
      validateConfigBeforeWrite(config, 'question-1')
    ).rejects.toThrow();
  });

  it('Should throw an error when missing a field', async () => {
    (database as any).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      first: jest.fn().mockResolvedValue({
        data_type: 'instrument_picker',
      }),
    });

    (getQuestionDefinition as jest.Mock).mockReturnValue({
      customYupSchema: Yup.object({
        variant: Yup.string().required(),
        instruments: Yup.array()
          .of(
            Yup.object({
              id: Yup.number().required(),
              name: Yup.string().required(),
            })
          )
          .required(),
        isMultipleSelect: Yup.boolean().required(),
        requestTime: Yup.boolean().required(),
      }),
      validateConfig: jest.fn(),
    });

    const config = JSON.stringify({
      small_label: '',
      required: true,
      tooltip: '',
      readPermissions: [],
      variant: 'radio',
      instruments: [],
      isMultipleSelect: false,
      extraField: true,
    });

    await expect(
      validateConfigBeforeWrite(config, 'question-1')
    ).rejects.toThrow();
  });
});
