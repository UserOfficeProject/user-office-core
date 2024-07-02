import FormControl from '@mui/material/FormControl';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import { Field } from 'formik';
import React, { useContext, ChangeEvent } from 'react';
import * as Yup from 'yup';

import FormikUIAutocomplete from 'components/common/FormikUIAutocomplete';
import RefreshListIcon from 'components/common/RefresListIcon';
import TitledContainer from 'components/common/TitledContainer';
import { QuestionFormProps } from 'components/questionary/QuestionaryComponentRegistry';
import { FeatureContext } from 'context/FeatureContextProvider';
import {
  FeatureId,
  SampleDeclarationConfig,
  TemplateGroupId,
} from 'generated/sdk';
import { useActiveTemplates } from 'hooks/call/useCallTemplates';
import { useNaturalKeySchema } from 'utils/userFieldValidationSchema';

import { QuestionFormShell } from '../QuestionFormShell';

export const QuestionSampleDeclarationForm = (props: QuestionFormProps) => {
  const field = props.question;
  const config = field.config as SampleDeclarationConfig;
  const naturalKeySchema = useNaturalKeySchema(field.naturalKey);
  const { featuresMap } = useContext(FeatureContext);
  const {
    templates: sampleTemplates,
    refreshTemplates: refreshSampleTemplates,
  } = useActiveTemplates(TemplateGroupId.SAMPLE, config.templateId);

  const { templates: esiTemplates, refreshTemplates: refreshEsiTemplates } =
    useActiveTemplates(TemplateGroupId.SAMPLE_ESI, config.esiTemplateId);

  if (!sampleTemplates || !esiTemplates) {
    return null;
  }

  const templateOptions = sampleTemplates.map((template) => ({
    value: template.templateId,
    text: template.name,
  }));
  const ESITemplateOptions = esiTemplates.map((template) => ({
    value: template.templateId,
    text: template.name,
  }));

  return (
    <QuestionFormShell
      {...props}
      validationSchema={Yup.object().shape({
        naturalKey: naturalKeySchema,
        question: Yup.string().required('Question is required'),
        config: Yup.object({
          templateId: Yup.number().required('Template is required'),
          addEntryButtonLabel: Yup.string().required(),
          minEntries: Yup.number().min(0).nullable(),
          maxEntries: Yup.number().min(1).nullable(),
        }),
      })}
    >
      {({ values, setFieldValue }) => (
        <>
          <Field
            name="naturalKey"
            id="Key-Input"
            label="Key"
            type="text"
            component={TextField}
            fullWidth
            inputProps={{ 'data-cy': 'natural_key' }}
          />

          <Field
            name="question"
            id="Question-Input"
            label="Question"
            type="text"
            component={TextField}
            fullWidth
            inputProps={{ 'data-cy': 'question' }}
          />

          <TitledContainer label="Options">
            <Field
              name="config.addEntryButtonLabel"
              id="Add-button-label-Input"
              label="Add button label"
              placeholder='(e.g. "add new")'
              type="text"
              component={TextField}
              fullWidth
              data-cy="addEntryButtonLabel"
            />
            <FormControl fullWidth>
              <FormikUIAutocomplete
                name="config.templateId"
                label="Template name"
                noOptionsText="No active templates"
                items={templateOptions}
                InputProps={{
                  'data-cy': 'template-id',
                  endAdornment: (
                    <RefreshListIcon onClick={refreshSampleTemplates} />
                  ),
                }}
                TextFieldProps={{ margin: 'none' }}
                required
              />
              <Link
                href="/SampleDeclarationTemplates/"
                target="blank"
                style={{ textAlign: 'right' }}
              >
                View all templates
              </Link>
            </FormControl>

            {featuresMap.get(FeatureId.RISK_ASSESSMENT)?.isEnabled && (
              <FormControl fullWidth>
                <FormikUIAutocomplete
                  name="config.esiTemplateId"
                  label="ESI template name"
                  noOptionsText="No active templates"
                  items={ESITemplateOptions}
                  InputProps={{
                    'data-cy': 'esi-template-id',
                    endAdornment: (
                      <RefreshListIcon onClick={refreshEsiTemplates} />
                    ),
                  }}
                  TextFieldProps={{ margin: 'none' }}
                />
                <Link
                  href="/SampleEsiTemplates/"
                  target="blank"
                  style={{ textAlign: 'right' }}
                >
                  View all templates
                </Link>
              </FormControl>
            )}
          </TitledContainer>

          <TitledContainer label="Constraints">
            <Field
              name="config.minEntries"
              id="Min-Input"
              label="Min entries"
              placeholder="(e.g. 1, leave blank for unlimited)"
              type="number"
              inputProps={{ min: 0 }}
              component={TextField}
              fullWidth
              data-cy="min-entries"
              // NOTE: This is needed to prevent sending empty string when there is no value
              onChange={({
                target: { value },
              }: ChangeEvent<HTMLInputElement>) =>
                setFieldValue('config.minEntries', value || null)
              }
              // NOTE: This is needed to prevent console warning: `value` prop on `input` should not be null. `value` prop on `input` should not be null
              value={
                (values.config as SampleDeclarationConfig).minEntries ?? ''
              }
            />
            <Field
              name="config.maxEntries"
              id="Max-Input"
              label="Max entries"
              placeholder="(e.g. 4, leave blank for unlimited)"
              type="number"
              component={TextField}
              fullWidth
              inputProps={{ min: 1 }}
              data-cy="max-entries"
              // NOTE: This is needed to prevent sending empty string when there is no value
              onChange={({
                target: { value },
              }: ChangeEvent<HTMLInputElement>) =>
                setFieldValue('config.maxEntries', value || null)
              }
              // NOTE: This is needed to prevent console warning: `value` prop on `input` should not be null. `value` prop on `input` should not be null
              value={
                (values.config as SampleDeclarationConfig).maxEntries ?? ''
              }
            />
          </TitledContainer>
        </>
      )}
    </QuestionFormShell>
  );
};
