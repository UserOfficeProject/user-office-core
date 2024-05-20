import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import { SelectChangeEvent } from '@mui/material/Select';
import { Field } from 'formik';
import { Checkbox, Select, TextField } from 'formik-mui';
import React, { useState } from 'react';
import * as Yup from 'yup';

import FormikUICustomTable from 'components/common/FormikUICustomTable';
import TitledContainer from 'components/common/TitledContainer';
import { QuestionTemplateRelationFormProps } from 'components/questionary/QuestionaryComponentRegistry';
import {
  ApiCallRequestHeader,
  DynamicMultipleChoiceConfig,
} from 'generated/sdk';
import { urlValidationSchema } from 'utils/helperFunctions';

import TemplateEditLabel from '../../../template/QuestionTemplateLabel';
import { QuestionExcerpt } from '../QuestionExcerpt';
import { QuestionTemplateRelationFormShell } from '../QuestionTemplateRelationFormShell';
const columns = [
  { title: 'Name', field: 'name' },
  { title: 'Value', field: 'value' },
];

export const QuestionTemplateRelationDynamicMultipleChoiceForm = (
  props: QuestionTemplateRelationFormProps
) => {
  const config = props.questionRel.config as DynamicMultipleChoiceConfig;
  const [showIsMultipleSelectCheckbox, setShowIsMultipleSelectCheckbox] =
    useState(config.variant === 'dropdown');

  const availableVariantOptions = [
    { label: 'Radio', value: 'radio' },
    { label: 'Dropdown', value: 'dropdown' },
  ];

  const urlValidation = urlValidationSchema();

  return (
    <QuestionTemplateRelationFormShell
      {...props}
      validationSchema={Yup.object().shape({
        config: Yup.object({
          required: Yup.bool(),
          variant: Yup.string().required('Variant is required'),
          url: urlValidation,
        }),
      })}
    >
      {() => (
        <>
          <TemplateEditLabel pageType="Template" />
          <QuestionExcerpt question={props.questionRel.question} />
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

          <TitledContainer label="Dynamic URL">
            <FormControl fullWidth>
              <InputLabel htmlFor="config.url" shrink>
                Link
              </InputLabel>
              <Field
                name="config.url"
                id="config.url"
                type="text"
                component={TextField}
                fullWidth
                inputProps={{ 'data-cy': 'dynamic-url' }}
              />
            </FormControl>
            <FormControl fullWidth>
              <InputLabel htmlFor="config.jsonPath" shrink>
                JsonPath
              </InputLabel>
              <Field
                name="config.jsonPath"
                id="config.jsonPath"
                type="text"
                component={TextField}
                fullWidth
                inputProps={{ 'data-cy': 'dynamic-url-jsonPath' }}
              />
            </FormControl>
            <FormControl fullWidth>
              <TitledContainer
                label="Api request headers"
                data-cy="api-headers-container"
              >
                <Field
                  title=""
                  name="config.apiCallRequestHeaders"
                  component={FormikUICustomTable}
                  columns={columns}
                  dataTransforms={{
                    toTable: (options: ApiCallRequestHeader[]) => options,
                    fromTable: (rows: Record<string, unknown>[]) => rows,
                  }}
                  fullWidth
                  data-cy="options"
                />
              </TitledContainer>
            </FormControl>
          </TitledContainer>
        </>
      )}
    </QuestionTemplateRelationFormShell>
  );
};
