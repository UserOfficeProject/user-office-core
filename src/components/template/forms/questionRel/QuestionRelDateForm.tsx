import { TextField } from 'formik-material-ui';
import { Field } from 'formik';
import React from 'react';
import * as Yup from 'yup';

import { QuestionRel } from '../../../../generated/sdk';
import FormikUICustomCheckbox from '../../../common/FormikUICustomCheckbox';
import FormikUICustomDependencySelector from '../../../common/FormikUICustomDependencySelector';
import TitledContainer from '../../../common/TitledContainer';
import { TFormSignature } from '../TFormSignature';
import { QuestionRelFormShell } from './QuestionRelFormShell';
import { QuestionExcerpt } from './QuestionExcerpt';

export const QuestionRelDateForm: TFormSignature<QuestionRel> = props => {
  return (
    <QuestionRelFormShell
      closeMe={props.closeMe}
      dispatch={props.dispatch}
      questionRel={props.field}
      label="Date"
      template={props.template}
      validationSchema={Yup.object().shape({})}
    >
      {formikProps => (
        <>
          <QuestionExcerpt question={props.field.question} />
          <Field
            name="question.config.tooltip"
            label="Tooltip"
            type="text"
            component={TextField}
            margin="normal"
            fullWidth
            data-cy="tooltip"
          />
          <TitledContainer label="Constraints">
            <Field
              name="question.config.required"
              label="Is required"
              checked={formikProps.values.question.config.required}
              component={FormikUICustomCheckbox}
              margin="normal"
              fullWidth
              data-cy="required"
            />
          </TitledContainer>
          <TitledContainer label="Dependencies">
            <Field
              name="dependency"
              component={FormikUICustomDependencySelector}
              templateField={props.field}
              template={props.template}
              margin="normal"
              fullWidth
              data-cy="dependencies"
            />
          </TitledContainer>
        </>
      )}
    </QuestionRelFormShell>
  );
};
