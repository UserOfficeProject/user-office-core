import React from 'react';
import * as Yup from 'yup';

import { QuestionTemplateRelationFormProps } from 'components/questionary/QuestionaryComponentRegistry';
import { TechniquePickerConfig } from 'generated/sdk';

import { QuestionTechniquePickerFormCommon } from './QuestionTechniquePickerFormCommon';
import { QuestionExcerpt } from '../QuestionExcerpt';
import { QuestionTemplateRelationFormShell } from '../QuestionTemplateRelationFormShell';

export const QuestionTemplateRelationTechniquePickerForm = (
  props: QuestionTemplateRelationFormProps
) => {
  return (
    <QuestionTemplateRelationFormShell
      {...props}
      validationSchema={Yup.object().shape({
        config: Yup.object({
          required: Yup.bool(),
          variant: Yup.string().required('Variant is required'),
        }),
      })}
    >
      {() => (
        <>
          <QuestionExcerpt question={props.questionRel.question} />
          <QuestionTechniquePickerFormCommon
            config={props.questionRel.question.config as TechniquePickerConfig}
          />
        </>
      )}
    </QuestionTemplateRelationFormShell>
  );
};
