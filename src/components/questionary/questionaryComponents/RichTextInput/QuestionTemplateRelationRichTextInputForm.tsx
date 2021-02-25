import { Field } from 'formik';
import { TextField } from 'formik-material-ui';
import React from 'react';
import * as Yup from 'yup';

import FormikUICustomCheckbox from 'components/common/FormikUICustomCheckbox';
import TitledContainer from 'components/common/TitledContainer';
import { FormComponent } from 'components/questionary/QuestionaryComponentRegistry';
import { QuestionTemplateRelation } from 'generated/sdk';

import QuestionDependencyList from '../QuestionDependencyList';
import { QuestionExcerpt } from '../QuestionExcerpt';
import { QuestionTemplateRelationFormShell } from '../QuestionTemplateRelationFormShell';

export const QuestionTemplateRelationRichTextInputForm: FormComponent<QuestionTemplateRelation> = props => {
  return (
    <QuestionTemplateRelationFormShell
      closeMe={props.closeMe}
      dispatch={props.dispatch}
      questionRel={props.field}
      template={props.template}
      validationSchema={Yup.object().shape({
        question: Yup.object({
          config: Yup.object({
            required: Yup.boolean(),
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
              label="Is required"
              margin="normal"
              fullWidth
              data-cy="required"
            />

            <Field
              name="config.max"
              label="Max"
              type="text"
              component={TextField}
              margin="normal"
              fullWidth
              data-cy="max"
            />
          </TitledContainer>

          <TitledContainer label="Dependencies">
            <QuestionDependencyList
              form={formikProps}
              template={props.template}
            />
          </TitledContainer>
        </>
      )}
    </QuestionTemplateRelationFormShell>
  );
};
