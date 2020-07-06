import { Field } from 'formik';
import React from 'react';
import * as Yup from 'yup';

import { QuestionTemplateRelation } from '../../../../generated/sdk';
import FormikDropdown from '../../../common/FormikDropdown';
import FormikUICustomCheckbox from '../../../common/FormikUICustomCheckbox';
import FormikUICustomDependencySelector from '../../../common/FormikUICustomDependencySelector';
import FormikUICustomTable from '../../../common/FormikUICustomTable';
import TitledContainer from '../../../common/TitledContainer';
import { TFormSignature } from '../TFormSignature';
import { QuestionExcerpt } from './QuestionExcerpt';
import { QuestionTemplateRelationFormShell } from './QuestionTemplateRelationFormShell';

export const QuestionTemplateRelationMultipleChoiceForm: TFormSignature<QuestionTemplateRelation> = props => {
  return (
    <QuestionTemplateRelationFormShell
      closeMe={props.closeMe}
      dispatch={props.dispatch}
      questionRel={props.field}
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
          <QuestionExcerpt question={props.field.question} />
          <TitledContainer label="Constraints">
            <Field
              name="config.required"
              label="Is required"
              checked={formikProps.values.config.required}
              component={FormikUICustomCheckbox}
              margin="normal"
              fullWidth
              inputProps={{ 'data-cy': 'required' }}
            />
          </TitledContainer>

          <TitledContainer label="Options">
            <FormikDropdown
              name="config.variant"
              label="Variant"
              items={[
                { text: 'Radio', value: 'radio' },
                { text: 'Dropdown', value: 'dropdown' },
              ]}
              data-cy="variant"
            />
          </TitledContainer>

          <TitledContainer label="Items">
            <Field
              title=""
              name="config.options"
              component={FormikUICustomTable}
              columns={[{ title: 'Answer', field: 'answer' }]}
              dataTransforms={{
                toTable: (options: string[]) => {
                  return options.map(option => {
                    return { answer: option };
                  });
                },
                fromTable: (rows: any[]) => {
                  return rows.map(row => row.answer);
                },
              }}
              margin="normal"
              fullWidth
              data-cy="options"
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
              inputProps={{ 'data-cy': 'dependencies' }}
            />
          </TitledContainer>
        </>
      )}
    </QuestionTemplateRelationFormShell>
  );
};
