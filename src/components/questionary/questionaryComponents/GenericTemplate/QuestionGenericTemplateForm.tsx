import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Link from '@mui/material/Link';
import MenuItem from '@mui/material/MenuItem';
import { Field } from 'formik';
import { Select, TextField } from 'formik-mui';
import React, { FC } from 'react';
import * as Yup from 'yup';

import TitledContainer from 'components/common/TitledContainer';
import { QuestionFormProps } from 'components/questionary/QuestionaryComponentRegistry';
import { TemplateGroupId } from 'generated/sdk';
import { useActiveTemplates } from 'hooks/call/useCallTemplates';
import { useNaturalKeySchema } from 'utils/userFieldValidationSchema';

import { QuestionFormShell } from '../QuestionFormShell';

export const QuestionGenericTemplateForm: FC<QuestionFormProps> = (props) => {
  const field = props.question;
  const naturalKeySchema = useNaturalKeySchema(field.naturalKey);

  const { templates } = useActiveTemplates(TemplateGroupId.GENERIC_TEMPLATE);

  if (!templates) {
    return null;
  }

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
        }),
      })}
    >
      {() => (
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
              <InputLabel htmlFor="config.templateId">Template name</InputLabel>
              <Field
                name="config.templateId"
                id="config.templateId"
                type="text"
                component={Select}
                data-cy="template-id"
              >
                {templates.length ? (
                  templates.map((template) => {
                    return (
                      <MenuItem
                        value={template.templateId}
                        key={template.templateId}
                      >
                        {template.name}
                      </MenuItem>
                    );
                  })
                ) : (
                  <MenuItem value="noTemplates" key="noTemplates" disabled>
                    No active templates
                  </MenuItem>
                )}
              </Field>
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
