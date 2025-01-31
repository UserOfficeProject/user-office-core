import { Collapse, FormControl } from '@mui/material';
import Link from '@mui/material/Link';
import { Field } from 'formik';
import React from 'react';
import * as Yup from 'yup';

import FormikUIAutocomplete from 'components/common/FormikUIAutocomplete';
import CheckboxWithLabel from 'components/common/FormikUICheckboxWithLabel';
import TextField from 'components/common/FormikUITextField';
import TitledContainer from 'components/common/TitledContainer';
import { QuestionFormProps } from 'components/questionary/QuestionaryComponentRegistry';
import { SubTemplateConfig, TemplateGroupId } from 'generated/sdk';
import { useActiveTemplates } from 'hooks/call/useCallTemplates';
import { useNaturalKeySchema } from 'utils/userFieldValidationSchema';

import { QuestionFormShell } from '../QuestionFormShell';

export const QuestionGenericTemplateForm = (props: QuestionFormProps) => {
  const field = props.question;
  const naturalKeySchema = useNaturalKeySchema(field.naturalKey);

  const { templates } = useActiveTemplates(TemplateGroupId.GENERIC_TEMPLATE);

  if (!templates) {
    return null;
  }

  const templateOptions = templates.map((template) => ({
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
          addEntryButtonLabel: Yup.string(),
          maxEntries: Yup.number().nullable(),
          canCopy: Yup.bool().required(),
          copyButtonLabel: Yup.string().when('canCopy', {
            is: (canCopy: boolean) => canCopy,
            then: Yup.string().required('Copy button label is required'),
          }),
        }),
      })}
    >
      {(formikProps) => (
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
            <FormControl fullWidth>
              <FormikUIAutocomplete
                name="config.templateId"
                items={templateOptions}
                label="Template name"
                noOptionsText="No Sub Templates available"
                InputProps={{ 'data-cy': 'template-id' }}
                TextFieldProps={{ margin: 'none' }}
                required
              />
              <Link
                href="/GenericTemplates/"
                target="blank"
                style={{ textAlign: 'right' }}
              >
                View all templates
              </Link>
            </FormControl>

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
            <Field
              component={CheckboxWithLabel}
              type="checkbox"
              id="can-copy-checkbox-input"
              data-cy="cancopy"
              Label={{
                label: 'Can copy',
              }}
              name="config.canCopy"
              checked={(formikProps.values.config as SubTemplateConfig).canCopy}
            />
            <Collapse
              in={(formikProps.values.config as SubTemplateConfig).canCopy}
            >
              <Field
                name="config.copyButtonLabel"
                id="copy-button-label-input"
                label="Copy button label"
                placeholder='(e.g. "copy")'
                type="text"
                component={TextField}
                fullWidth
                data-cy="copyButtonLabel"
              />
              <Field
                component={CheckboxWithLabel}
                type="checkbox"
                id="is-multiple-copy-select-checkbox-input"
                Label={{
                  label: 'Multiple copy selection',
                }}
                name="config.isMultipleCopySelect"
                data-cy="isMultipleCopySelect"
              />
              <Field
                component={CheckboxWithLabel}
                type="checkbox"
                id="is-complete-on-copy-checkbox-input"
                Label={{
                  label: 'Copy is complete',
                }}
                name="config.isCompleteOnCopy"
                data-cy="isCompleteOnCopy"
              />
            </Collapse>
          </TitledContainer>
          <TitledContainer label="Constraints">
            <Field
              name="config.required"
              id="Is-Required-Input"
              component={CheckboxWithLabel}
              type="checkbox"
              Label={{
                label: 'Is required',
              }}
              data-cy="required"
            />
            <Field
              name="config.minEntries"
              id="Min-Input"
              label="Min entries"
              placeholder="(e.g. 1, leave blank for unlimited)"
              type="text"
              component={TextField}
              fullWidth
              data-cy="min-entries"
            />
            <Field
              name="config.maxEntries"
              id="Max-Input"
              label="Max entries"
              placeholder="(e.g. 4, leave blank for unlimited)"
              type="text"
              component={TextField}
              fullWidth
              data-cy="max-entries"
            />
          </TitledContainer>
        </>
      )}
    </QuestionFormShell>
  );
};
