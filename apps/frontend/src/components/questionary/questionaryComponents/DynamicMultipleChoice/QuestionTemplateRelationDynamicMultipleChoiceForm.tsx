import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import { SelectChangeEvent } from '@mui/material/Select';
import { Field } from 'formik';
import React, { useState, useContext } from 'react';
import * as Yup from 'yup';

import CheckboxWithLabel from 'components/common/FormikUICheckboxWithLabel';
import FormikUICustomTable from 'components/common/FormikUICustomTable';
import Select from 'components/common/FormikUISelect';
import TextField from 'components/common/FormikUITextField';
import TitledContainer from 'components/common/TitledContainer';
import { QuestionTemplateRelationFormProps } from 'components/questionary/QuestionaryComponentRegistry';
import { SettingsContext } from 'context/SettingsContextProvider';
import {
  ApiCallRequestHeader,
  DynamicMultipleChoiceConfig,
  SettingsId,
} from 'generated/sdk';
import { urlValidationSchema } from 'utils/helperFunctions';

import { QuestionExcerpt } from '../QuestionExcerpt';
import { QuestionTemplateRelationFormShell } from '../QuestionTemplateRelationFormShell';

const columns = [
  { title: 'Name', field: 'name' },
  { title: 'Value', field: 'value' },
];

const pathNameValidationSchema = Yup.string()
  .matches(
    /^(?!http|www)/i,
    'Provide a valid pathname, the base domain is already provided'
  )
  .matches(/^(?!\/).+$/, 'Leading slash should not be included')
  .required('Pathname is required');

export const QuestionTemplateRelationDynamicMultipleChoiceForm = (
  props: QuestionTemplateRelationFormProps
) => {
  const config = props.questionRel.config as DynamicMultipleChoiceConfig;
  const [showIsMultipleSelectCheckbox, setShowIsMultipleSelectCheckbox] =
    useState(config.variant === 'dropdown');
  const [useBaseDomain, setUseBaseDomain] = useState(
    config.useBaseDomain ?? false
  );

  const availableVariantOptions = [
    { label: 'Radio', value: 'radio' },
    { label: 'Dropdown', value: 'dropdown' },
  ];

  const urlValidation = urlValidationSchema();
  const { settingsMap } = useContext(SettingsContext);

  return (
    <QuestionTemplateRelationFormShell
      {...props}
      validationSchema={Yup.object().shape({
        config: Yup.object({
          required: Yup.bool(),
          variant: Yup.string().required('Variant is required'),
          url: Yup.string().when('useBaseDomain', (useBaseDomain, schema) =>
            useBaseDomain
              ? schema.concat(pathNameValidationSchema)
              : schema.concat(urlValidation)
          ),
        }),
      })}
    >
      {({ setFieldValue }) => (
        <>
          <QuestionExcerpt question={props.questionRel.question} />
          <TitledContainer label="Constraints">
            <Field
              name="config.required"
              component={CheckboxWithLabel}
              type="checkbox"
              Label={{
                label: 'Is required',
              }}
              data-cy="required"
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
                options={availableVariantOptions.map(({ label, value }) => ({
                  text: label,
                  value: value,
                }))}
              />
            </FormControl>
            {showIsMultipleSelectCheckbox && (
              <Field
                name="config.isMultipleSelect"
                component={CheckboxWithLabel}
                type="checkbox"
                Label={{
                  label: 'Is multiple select',
                }}
                data-cy="is-multiple-select"
              />
            )}
          </TitledContainer>
          <TitledContainer label="Dynamic URL">
            <FormControl fullWidth>
              <InputLabel htmlFor="config.url" shrink>
                Link
              </InputLabel>

              <div style={{ display: 'flex', gap: '8px' }}>
                {useBaseDomain && (
                  <span
                    style={{
                      whiteSpace: 'nowrap',
                      color: 'grey',
                      paddingTop: '20px',
                    }}
                  >
                    {`http://${settingsMap.get(SettingsId.BASE_URL)?.settingsValue}/`}
                  </span>
                )}

                <Field
                  name="config.url"
                  id="config.url"
                  type="text"
                  component={TextField}
                  fullWidth
                  inputProps={{ 'data-cy': 'dynamic-url' }}
                />
              </div>

              <Field
                name="config.useBaseDomain"
                id="config.useBaseDomain"
                type="checkbox"
                component={CheckboxWithLabel}
                Label={{ label: 'Use base domain for dynamic URL' }}
                data-cy="use-base-domain"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const checked = e.target.checked;
                  setUseBaseDomain(checked);
                  setFieldValue('config.useBaseDomain', checked);
                }}
              />
            </FormControl>

            <FormControl fullWidth style={{ paddingTop: '30px' }}>
              <InputLabel
                htmlFor="config.jsonPath"
                shrink
                style={{ paddingTop: '40px' }}
              >
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
