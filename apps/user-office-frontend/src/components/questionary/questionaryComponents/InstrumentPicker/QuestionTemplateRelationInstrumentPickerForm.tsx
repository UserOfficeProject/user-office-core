import React from 'react';
import * as Yup from 'yup';

import { QuestionTemplateRelationFormProps } from 'components/questionary/QuestionaryComponentRegistry';

import { QuestionExcerpt } from '../QuestionExcerpt';
import { QuestionTemplateRelationFormShell } from '../QuestionTemplateRelationFormShell';
import { QuestionInstrumentPickerFormCommon } from './QuestionInstrumentPickerFormCommon';

export const QuestionTemplateRelationInstrumentPickerForm = (
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
          <QuestionInstrumentPickerFormCommon />
        </>
      )}
    </QuestionTemplateRelationFormShell>
  );
};
