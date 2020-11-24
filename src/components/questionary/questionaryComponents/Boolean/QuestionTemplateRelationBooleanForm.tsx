import { Field } from 'formik';
import React from 'react';
import * as Yup from 'yup';

import FormikUICustomCheckbox from 'components/common/FormikUICustomCheckbox';
import FormikUICustomDependencySelector from 'components/common/FormikUICustomDependencySelector';
import TitledContainer from 'components/common/TitledContainer';
import { FormComponent } from 'components/questionary/QuestionaryComponentRegistry';
import { QuestionExcerpt } from 'components/questionary/questionaryComponents/QuestionExcerpt';
import { QuestionTemplateRelation } from 'generated/sdk';

import { QuestionTemplateRelationFormShell } from '../QuestionTemplateRelationFormShell';

export const QuestionTemplateRelationBooleanForm: FormComponent<QuestionTemplateRelation> = props => {
  return (
    <QuestionTemplateRelationFormShell
      closeMe={props.closeMe}
      dispatch={props.dispatch}
      questionRel={props.field}
      template={props.template}
      validationSchema={Yup.object().shape({
        question: Yup.object({
          config: Yup.object({
            required: Yup.bool(),
          }),
        }),
      })}
    >
      {formikProps => (
        <>
          <QuestionExcerpt question={props.field.question} />
          <TitledContainer label="Constraints">
            <Field
              name="config.required"
              component={FormikUICustomCheckbox}
              label="User must check it to continue"
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
    </QuestionTemplateRelationFormShell>
  );
};
