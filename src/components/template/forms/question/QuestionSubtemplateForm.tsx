import { Field } from 'formik';
import { TextField } from 'formik-material-ui';
import React from 'react';
import * as Yup from 'yup';
import { Question, TemplateCategoryId } from '../../../../generated/sdk';
import { useTemplates } from '../../../../hooks/useTemplates';
import { useNaturalKeySchema } from '../../../../utils/userFieldValidationSchema';
import FormikUICustomSelect from '../../../common/FormikUICustomSelect';
import TitledContainer from '../../../common/TitledContainer';
import { TFormSignature } from '../TFormSignature';
import { QuestionFormShell } from './QuestionFormShell';

export const QuestionSubtemplateForm: TFormSignature<Question> = props => {
  const field = props.field;
  const naturalKeySchema = useNaturalKeySchema(field.naturalKey);
  const { templates } = useTemplates(
    false,
    TemplateCategoryId.SAMPLE_DECLARATION
  );

  return (
    <QuestionFormShell
      label="Template"
      closeMe={props.closeMe}
      dispatch={props.dispatch}
      question={props.field}
      validationSchema={Yup.object().shape({
        naturalKey: naturalKeySchema,
        question: Yup.string().required('Question is required'),
        config: Yup.object({
          subtemplateId: Yup.number(),
          title: Yup.string(),
          addEntryButtonLabel: Yup.string(),
          maxEntries: Yup.number(),
        }),
      })}
    >
      {() => (
        <>
          <Field
            name="naturalKey"
            label="Key"
            type="text"
            component={TextField}
            margin="normal"
            fullWidth
            inputProps={{ 'data-cy': 'natural_key' }}
          />
          <Field
            name="question"
            label="Question"
            type="text"
            component={TextField}
            margin="normal"
            fullWidth
            inputProps={{ 'data-cy': 'question' }}
          />

          <TitledContainer label="Options">
            <Field
              name="config.subtemplateId"
              label="Template id"
              placeholder="Choose template"
              type="text"
              component={FormikUICustomSelect}
              margin="normal"
              fullWidth
              data-cy="subtemplateId"
              availableOptions={templates.map(template => {
                return { value: template.templateId, label: template.name };
              })}
            />
            <Field
              name="config.title"
              label="Title"
              placeholder="The title"
              type="text"
              component={TextField}
              margin="normal"
              fullWidth
              data-cy="title"
            />
            <Field
              name="config.addEntryButtonLabel"
              label="Add button label"
              placeholder='(e.g. "add new")'
              type="text"
              component={TextField}
              margin="normal"
              fullWidth
              data-cy="addEntryButtonLabel"
            />
          </TitledContainer>
        </>
      )}
    </QuestionFormShell>
  );
};
