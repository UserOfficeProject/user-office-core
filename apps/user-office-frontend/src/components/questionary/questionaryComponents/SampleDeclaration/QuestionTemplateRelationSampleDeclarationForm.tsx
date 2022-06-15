import FormControl from '@mui/material/FormControl';
import Link from '@mui/material/Link';
import { Field } from 'formik';
import { TextField } from 'formik-mui';
import { ChangeEvent, default as React, FC, useContext } from 'react';
import * as Yup from 'yup';

import FormikUIAutocomplete from 'components/common/FormikUIAutocomplete';
import TitledContainer from 'components/common/TitledContainer';
import { QuestionTemplateRelationFormProps } from 'components/questionary/QuestionaryComponentRegistry';
import { FeatureContext } from 'context/FeatureContextProvider';
import {
  FeatureId,
  SampleDeclarationConfig,
  TemplateGroupId,
} from 'generated/sdk';
import { useActiveTemplates } from 'hooks/call/useCallTemplates';

import QuestionDependencyList from '../QuestionDependencyList';
import { QuestionExcerpt } from '../QuestionExcerpt';
import { QuestionTemplateRelationFormShell } from '../QuestionTemplateRelationFormShell';

export const QuestionTemplateRelationSampleDeclarationForm: FC<
  QuestionTemplateRelationFormProps
> = (props) => {
  const config = props.questionRel.config as SampleDeclarationConfig;

  const { templates } = useActiveTemplates(
    TemplateGroupId.SAMPLE,
    config.templateId
  );
  const { templates: esiTemplates } = useActiveTemplates(
    TemplateGroupId.SAMPLE_ESI,
    config.esiTemplateId
  );
  const { featuresMap } = useContext(FeatureContext);

  if (!templates || !esiTemplates) {
    return null;
  }

  const templateOptions = templates.map((template) => ({
    value: template.templateId,
    text: template.name,
  }));
  const ESITemplateOptions = esiTemplates.map((template) => ({
    value: template.templateId,
    text: template.name,
  }));

  return (
    <QuestionTemplateRelationFormShell
      {...props}
      validationSchema={Yup.object().shape({
        question: Yup.object({
          config: Yup.object({
            addEntryButtonLabel: Yup.string().required(),
            minEntries: Yup.number().min(0).nullable(),
            maxEntries: Yup.number().min(1).nullable(),
            templateId: Yup.number().required('Template is required'),
          }),
        }),
      })}
    >
      {(formikProps) => (
        <>
          <QuestionExcerpt question={props.questionRel.question} />

          <TitledContainer label="Options">
            <Field
              name="config.addEntryButtonLabel"
              label="Add button label"
              id="add-button-input"
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
                InputProps={{ 'data-cy': 'template-id' }}
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
              <FormikUIAutocomplete
                name="config.esiTemplateId"
                label="ESI template name"
                noOptionsText="No active templates"
                items={ESITemplateOptions}
                InputProps={{ 'data-cy': 'esi-template-id' }}
                TextFieldProps={{ margin: 'none' }}
              />
            )}
          </TitledContainer>

          <TitledContainer label="Constraints">
            <Field
              name="config.minEntries"
              label="Min entries"
              id="Min-input"
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
                formikProps.setFieldValue('config.minEntries', value || null)
              }
              // NOTE: This is needed to prevent console warning: `value` prop on `input` should not be null. `value` prop on `input` should not be null
              value={
                (formikProps.values.config as SampleDeclarationConfig)
                  .minEntries ?? ''
              }
            />
            <Field
              name="config.maxEntries"
              label="Max entries"
              id="Max-input"
              type="number"
              inputProps={{ min: 1 }}
              component={TextField}
              fullWidth
              data-cy="max-entries"
              // NOTE: This is needed to prevent sending empty string when there is no value
              onChange={({
                target: { value },
              }: ChangeEvent<HTMLInputElement>) =>
                formikProps.setFieldValue('config.maxEntries', value || null)
              }
              // NOTE: This is needed to prevent console warning: `value` prop on `input` should not be null. `value` prop on `input` should not be null
              value={
                (formikProps.values.config as SampleDeclarationConfig)
                  .maxEntries ?? ''
              }
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
