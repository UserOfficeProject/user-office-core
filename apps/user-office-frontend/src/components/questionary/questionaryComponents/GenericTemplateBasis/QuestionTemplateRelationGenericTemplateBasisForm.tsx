//import { FormControlLabel } from '@mui/material';
import { Field } from 'formik';
import { TextField } from 'formik-mui';
import React, { FC } from 'react';
import * as Yup from 'yup';

import TitledContainer from 'components/common/TitledContainer';
import { QuestionTemplateRelationFormProps } from 'components/questionary/QuestionaryComponentRegistry';

import { QuestionTemplateRelationFormShell } from '../QuestionTemplateRelationFormShell';

export const QuestionTemplateRelationGenericTemplateBasisForm: FC<
  QuestionTemplateRelationFormProps
> = (props) => {
  return (
    <QuestionTemplateRelationFormShell
      {...props}
      validationSchema={Yup.object().shape({
        question: Yup.object({
          config: Yup.object({
            titlePlaceholder: Yup.string(),
            questionLabel: Yup.string(),
          }),
        }),
      })}
    >
      {() => (
        <>
          <TitledContainer label="Question">
            <Field
              name="config.questionLabel"
              label="Question"
              component={TextField}
              type="text"
              inputProps={{ 'data-cy': 'question' }}
            />
          </TitledContainer>
        </>
      )}
    </QuestionTemplateRelationFormShell>
  );
};
