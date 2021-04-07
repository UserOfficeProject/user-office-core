import { FormControlLabel } from '@material-ui/core';
import { Field } from 'formik';
import { Checkbox } from 'formik-material-ui';
import React, { ChangeEvent, FC, useState } from 'react';
import * as Yup from 'yup';

import FormikDropdown from 'components/common/FormikDropdown';
import FormikUICustomTable from 'components/common/FormikUICustomTable';
import TitledContainer from 'components/common/TitledContainer';
import { QuestionTemplateRelationFormProps } from 'components/questionary/QuestionaryComponentRegistry';
import { SelectionFromOptionsConfig } from 'generated/sdk';

import QuestionDependencyList from '../QuestionDependencyList';
import { QuestionExcerpt } from '../QuestionExcerpt';
import { QuestionTemplateRelationFormShell } from '../QuestionTemplateRelationFormShell';

export const QuestionTemplateRelationMultipleChoiceForm: FC<QuestionTemplateRelationFormProps> = (
  props
) => {
  const config = props.questionRel.config as SelectionFromOptionsConfig;
  const [
    showIsMultipleSelectCheckbox,
    setShowIsMultipleSelectCheckbox,
  ] = useState(config.variant === 'dropdown');

  return (
    <QuestionTemplateRelationFormShell
      {...props}
      validationSchema={Yup.object().shape({
        question: Yup.object({
          config: Yup.object({
            required: Yup.bool(),
            variant: Yup.string().required('Variant is required'),
          }),
        }),
      })}
    >
      {(formikProps) => (
        <>
          <QuestionExcerpt question={props.questionRel.question} />
          <TitledContainer label="Constraints">
            <FormControlLabel
              control={
                <Field
                  name="config.required"
                  component={Checkbox}
                  margin="normal"
                  type="checkbox"
                  inputProps={{ 'data-cy': 'required' }}
                />
              }
              label="Is required"
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
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                setShowIsMultipleSelectCheckbox(e.target.value === 'dropdown');
              }}
            />
            {showIsMultipleSelectCheckbox && (
              <FormControlLabel
                control={
                  <Field
                    name="config.isMultipleSelect"
                    component={Checkbox}
                    margin="normal"
                    type="checkbox"
                    inputProps={{ 'data-cy': 'is-multiple-select' }}
                  />
                }
                label="Is multiple select"
              />
            )}
          </TitledContainer>

          <TitledContainer label="Items">
            <Field
              title=""
              name="config.options"
              component={FormikUICustomTable}
              columns={[{ title: 'Answer', field: 'answer' }]}
              dataTransforms={{
                toTable: (options: string[]) => {
                  return options.map((option) => {
                    return { answer: option };
                  });
                },
                fromTable: (rows: Record<string, unknown>[]) => {
                  return rows.map((row) => row.answer);
                },
              }}
              margin="normal"
              fullWidth
              data-cy="options"
            />
          </TitledContainer>
          <TitledContainer label="Dependencies">
            <QuestionDependencyList
              template={props.template}
              form={formikProps}
            />
          </TitledContainer>
        </>
      )}
    </QuestionTemplateRelationFormShell>
  );
};
