import * as Yup from 'yup';

import { CreateYupValidation } from 'components/questionary/QuestionaryComponentRegistry';
import { ExperimentSampleWithQuestionary } from 'models/questionary/experimentSample/ExperimentSampleWithQuestionary';

export const createProposalEsiBasisValidationSchema: CreateYupValidation =
  () => {
    let schema = Yup.array().of<Yup.AnyObjectSchema>(Yup.object());

    schema = schema.test(
      'allESIsCompleted',
      'All experiment safety inputs must be completed',
      (value?: ExperimentSampleWithQuestionary[]) => {
        return (
          value?.every(
            (experimentSample) => experimentSample?.isEsiSubmitted
          ) ?? false
        );
      }
    );

    return schema;
  };
