import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import { SelectChangeEvent } from '@mui/material/Select';
import { Field } from 'formik';
import { Checkbox, Select, TextField } from 'formik-mui';
import React, { FC, useState } from 'react';
import * as Yup from 'yup';

import FormikUICustomTable from 'components/common/FormikUICustomTable';
import TitledContainer from 'components/common/TitledContainer';
import { QuestionFormProps } from 'components/questionary/QuestionaryComponentRegistry';
import { SelectionFromOptionsConfig } from 'generated/sdk';
import { useNaturalKeySchema } from 'utils/userFieldValidationSchema';

import { QuestionFormShell } from '../QuestionFormShell';

const columns = [{ title: 'Answer', field: 'answer' }];

export const QuestionMultipleChoiceForm: FC<QuestionFormProps> = (props) => {
  const field = props.question;
  const config = field.config as SelectionFromOptionsConfig;

  const naturalKeySchema = useNaturalKeySchema(field.naturalKey);
  const [showIsMultipleSelectCheckbox, setShowIsMultipleSelectCheckbox] =
    useState(config.variant === 'dropdown');

  const availableVariantOptions = [
    { label: 'Radio', value: 'radio' },
    { label: 'Dropdown', value: 'dropdown' },
  ];

  return (
    <QuestionFormShell
      {...props}
      validationSchema={Yup.object().shape({
        naturalKey: naturalKeySchema,
        question: Yup.string().required('Question is required'),
        config: Yup.object({
          required: Yup.bool(),
          variant: Yup.string().required('Variant is required'),
        }),
      })}
    >
      {() => (
        <>
          <Field
            name="naturalKey"
            label="Key"
            id="Key-input"
            type="text"
            component={TextField}
            fullWidth
            inputProps={{ 'data-cy': 'natural_key' }}
          />
          <Field
            name="question"
            id="Question-input"
            label="Question"
            type="text"
            component={TextField}
            fullWidth
            inputProps={{ 'data-cy': 'question' }}
          />

          <TitledContainer label="Constraints">
            <FormControlLabel
              control={
                <Field
                  name="config.required"
                  component={Checkbox}
                  type="checkbox"
                  inputProps={{ 'data-cy': 'required' }}
                />
              }
              label="Is required"
            />
          </TitledContainer>

          <TitledContainer label="Options">
            <FormControl fullWidth>
              <InputLabel htmlFor="config.variant" shrink>
                Variant
              </InputLabel>
              <Field
                id="config.variant"
                name="config.variant"
                type="text"
                component={Select}
                data-cy="variant"
                onChange={(e: SelectChangeEvent) => {
                  setShowIsMultipleSelectCheckbox(
                    e.target.value === 'dropdown'
                  );
                }}
              >
                {availableVariantOptions.map(({ value, label }) => {
                  return (
                    <MenuItem value={value} key={value}>
                      {label}
                    </MenuItem>
                  );
                })}
              </Field>
            </FormControl>

            {showIsMultipleSelectCheckbox && (
              <FormControlLabel
                control={
                  <Field
                    name="config.isMultipleSelect"
                    component={Checkbox}
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
              columns={columns}
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
              fullWidth
              data-cy="options"
            />
          </TitledContainer>
        </>
      )}
    </QuestionFormShell>
  );
};
