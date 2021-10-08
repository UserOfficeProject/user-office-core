import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Link from '@material-ui/core/Link';
import MenuItem from '@material-ui/core/MenuItem';
import { Field } from 'formik';
import { Select, TextField } from 'formik-material-ui';
import React, { FC, useContext } from 'react';
import * as Yup from 'yup';

import TitledContainer from 'components/common/TitledContainer';
import { QuestionFormProps } from 'components/questionary/QuestionaryComponentRegistry';
import { FeatureContext } from 'context/FeatureContextProvider';
import { TemplateGroupId } from 'generated/sdk';
import { useActiveTemplates } from 'hooks/call/useCallTemplates';
import { useNaturalKeySchema } from 'utils/userFieldValidationSchema';

import { QuestionFormShell } from '../QuestionFormShell';

export const QuestionGenericTemplateForm: FC<QuestionFormProps> = (props) => {
  const field = props.question;
  //const config = field.config as GenericTemplateConfig;
  const naturalKeySchema = useNaturalKeySchema(field.naturalKey);
  const { features } = useContext(FeatureContext);
  const { templates } = useActiveTemplates(
    TemplateGroupId.GENERIC_TEMPLATE
    //config.templateId
  );

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
            margin="normal"
            fullWidth
            inputProps={{ 'data-cy': 'natural_key' }}
          />

          <Field
            name="question"
            id="Question-Input"
            label="Question"
            type="text"
            component={TextField}
            margin="normal"
            fullWidth
            inputProps={{ 'data-cy': 'question' }}
          />

          <TitledContainer label="Options">
            <FormControl fullWidth margin="normal">
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
              margin="normal"
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
              margin="normal"
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
              margin="normal"
              fullWidth
              data-cy="max-entries"
            />
          </TitledContainer>
        </>
      )}
    </QuestionFormShell>
  );
};
