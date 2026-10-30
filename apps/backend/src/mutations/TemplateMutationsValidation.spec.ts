import * as Yup from 'yup';

import { validateConfigBeforeWrite } from './TemplateMutations';
import database from '../datasources/postgres/database';
import { getQuestionDefinition } from '../models/questionTypes/QuestionRegistry';
import { TemplateGroupId } from '../models/Template';

jest.mock('../datasources/postgres/database');
jest.mock('../models/questionTypes/QuestionRegistry');

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
      validateConfigBeforeWrite(config, 'question-1', TemplateGroupId.PROPOSAL)
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
      validateConfigBeforeWrite(config, 'question-1', TemplateGroupId.PROPOSAL)
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
      validateConfigBeforeWrite(config, 'question-1', TemplateGroupId.PROPOSAL)
    ).rejects.toThrow();
  });

  it('should reject required questions with restricted read permissions', async () => {
    (database as any).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      first: jest.fn().mockResolvedValue({ data_type: 'boolean' }),
    });
    (getQuestionDefinition as jest.Mock).mockReturnValue({});

    const config = JSON.stringify({
      required: true,
      readPermissions: ['user_officer'],
    });

    await expect(
      validateConfigBeforeWrite(config, 'question-1', TemplateGroupId.PROPOSAL)
    ).rejects.toThrow('Required questions must be readable by the user role');
  });

  it('should allow required questions when the user role has read permission', async () => {
    (database as any).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      first: jest.fn().mockResolvedValue({ data_type: 'boolean' }),
    });
    (getQuestionDefinition as jest.Mock).mockReturnValue({});

    const config = JSON.stringify({
      required: true,
      readPermissions: ['user', 'user_officer'],
    });

    await expect(
      validateConfigBeforeWrite(config, 'question-1', TemplateGroupId.PROPOSAL)
    ).resolves.toBeUndefined();
  });

  it('should allow optional questions with restricted read permissions', async () => {
    (database as any).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      first: jest.fn().mockResolvedValue({ data_type: 'boolean' }),
    });
    (getQuestionDefinition as jest.Mock).mockReturnValue({});

    const config = JSON.stringify({
      required: false,
      readPermissions: ['user_officer'],
    });

    await expect(
      validateConfigBeforeWrite(config, 'question-1', TemplateGroupId.PROPOSAL)
    ).resolves.toBeUndefined();
  });

  it('should allow required questions without user permission in staff-facing templates', async () => {
    (database as any).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      first: jest.fn().mockResolvedValue({ data_type: 'boolean' }),
    });
    (getQuestionDefinition as jest.Mock).mockReturnValue({});

    const config = JSON.stringify({
      required: true,
      readPermissions: ['fap_reviewer'],
    });

    await expect(
      validateConfigBeforeWrite(
        config,
        'question-1',
        TemplateGroupId.FAP_REVIEW
      )
    ).resolves.toBeUndefined();
  });
});
