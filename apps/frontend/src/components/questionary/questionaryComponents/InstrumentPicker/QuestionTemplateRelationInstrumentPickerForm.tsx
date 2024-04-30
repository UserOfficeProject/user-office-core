import React from 'react';
import * as Yup from 'yup';

import { QuestionTemplateRelationFormProps } from 'components/questionary/QuestionaryComponentRegistry';
import { InstrumentPickerConfig } from 'generated/sdk';

import { QuestionInstrumentPickerFormCommon } from './QuestionInstrumentPickerFormCommon';
import TemplateEdit from '../../../template/QuestionTemplateLabel';
import { QuestionExcerpt } from '../QuestionExcerpt';
import { QuestionTemplateRelationFormShell } from '../QuestionTemplateRelationFormShell';
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
          <TemplateEdit pageType="Template" />
          <QuestionExcerpt question={props.questionRel.question} />
          <QuestionInstrumentPickerFormCommon
            config={props.questionRel.question.config as InstrumentPickerConfig}
          />
        </>
      )}
    </QuestionTemplateRelationFormShell>
  );
};
