import * as Yup from 'yup';

import { CreateYupValidation } from 'components/questionary/QuestionaryComponentRegistry';

import { SampleEsiWithQuestionary } from './../../../../models/questionary/sampleEsi/SampleEsiWithQuestionary';

export const createProposalEsiBasisValidationSchema: CreateYupValidation =
  () => {
    let schema = Yup.array().of<Yup.AnyObjectSchema>(Yup.object());

    schema = schema.test(
      'allESIsCompleted',
      'All experiment safety inputs must be completed',
      (value?: SampleEsiWithQuestionary[]) => {
        return value?.every((esi) => esi?.isSubmitted) ?? false;
      }
    );

    return schema;
  };
