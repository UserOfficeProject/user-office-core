import { Field } from 'formik';
import React from 'react';
import * as Yup from 'yup';
import {
  QuestionRel,
  SelectionFromOptionsConfig,
} from '../../../../generated/sdk';
import FormikUICustomDependencySelector from '../../../common/FormikUICustomDependencySelector';
import TitledContainer from '../../../common/TitledContainer';
import { MultipleChoiceConfigFragment } from '../fragments/MultipleChoiceConfigFragment';
import { TFormSignature } from '../TFormSignature';
import { QuestionRelFormShell } from './QuestionRelFormShell';

export const QuestionRelMultipleChoiceForm: TFormSignature<QuestionRel> = props => {
  return (
    <QuestionRelFormShell
      closeMe={props.closeMe}
      dispatch={props.dispatch}
      field={props.field}
      label="Multiple choice"
      template={props.template}
      validationSchema={Yup.object().shape({
        question: Yup.object({
          config: Yup.object({
            required: Yup.bool(),
            variant: Yup.string().required('Variant is required'),
          }),
        }),
      })}
    >
      {formikProps => (
        <>
          <MultipleChoiceConfigFragment
            config={
              formikProps.values.question.config as SelectionFromOptionsConfig
            }
          />
          <TitledContainer label="Dependencies">
            <Field
              name="dependency"
              component={FormikUICustomDependencySelector}
              templateField={props.field}
              template={props.template}
              margin="normal"
              fullWidth
              inputProps={{ 'data-cy': 'dependencies' }}
            />
          </TitledContainer>
        </>
      )}
    </QuestionRelFormShell>
  );
};
