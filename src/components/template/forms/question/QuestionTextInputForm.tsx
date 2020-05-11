import { Collapse } from '@material-ui/core';
import { Field } from 'formik';
import { TextField } from 'formik-material-ui';
import React, { useState } from 'react';
import * as Yup from 'yup';

import { Question, TextInputConfig } from '../../../../generated/sdk';
import { useNaturalKeySchema } from '../../../../utils/userFieldValidationSchema';
import FormikUICustomCheckbox from '../../../common/FormikUICustomCheckbox';
import FormikUICustomEditor from '../../../common/FormikUICustomEditor';
import TitledContainer from '../../../common/TitledContainer';
import { TFormSignature } from '../TFormSignature';
import { QuestionFormShell } from './QuestionFormShell';

export const QuestionTextInputForm: TFormSignature<Question> = props => {
  const field = props.field;
  const naturalKeySchema = useNaturalKeySchema(field.naturalKey);
  const [isRichQuestion, setIsRichQuestion] = useState<boolean>(
    (field.config as TextInputConfig).isHtmlQuestion
  );

  return (
    <QuestionFormShell
      label="Text input"
      closeMe={props.closeMe}
      dispatch={props.dispatch}
      question={props.field}
      validationSchema={Yup.object().shape({
        naturalKey: naturalKeySchema,
        question: Yup.string().required('Question is required'),
        config: Yup.object({
          min: Yup.number().nullable(),
          max: Yup.number().nullable(),
          required: Yup.boolean(),
          placeholder: Yup.string(),
          multiline: Yup.boolean(),
          isHtmlQuestion: Yup.boolean(),
        }),
      })}
    >
      {formikProps => (
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
          <Field
            label="Enable rich text question"
            name="config.isHtmlQuestion"
            component={FormikUICustomCheckbox}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setIsRichQuestion(event.target.checked);
            }}
            checked={isRichQuestion}
          />
          <Collapse in={isRichQuestion}>
            <Field
              visible={isRichQuestion}
              name="config.htmlQuestion"
              type="text"
              component={FormikUICustomEditor}
              margin="normal"
              fullWidth
              init={{
                skin: false,
                content_css: false,
                plugins: ['link', 'preview', 'image', 'code'],
                toolbar: 'bold italic',
                branding: false,
              }}
              data-cy="htmlQuestion"
            />
          </Collapse>
          <TitledContainer label="Constraints">
            <Field
              name="config.required"
              checked={formikProps.values.config.required}
              component={FormikUICustomCheckbox}
              label="Is required"
              margin="normal"
              fullWidth
              data-cy="required"
            />

            <Field
              name="config.min"
              label="Min"
              type="text"
              component={TextField}
              margin="normal"
              fullWidth
              data-cy="min"
            />

            <Field
              name="config.max"
              label="Max"
              type="text"
              component={TextField}
              margin="normal"
              fullWidth
              data-cy="max"
            />
          </TitledContainer>
          <TitledContainer label="Options">
            <Field
              name="config.placeholder"
              label="Placeholder text"
              type="text"
              component={TextField}
              margin="normal"
              fullWidth
              data-cy="placeholder"
            />

            <Field
              name="config.multiline"
              checked={(formikProps.values.config as TextInputConfig).multiline}
              component={FormikUICustomCheckbox}
              label="Multiple line"
              margin="normal"
              fullWidth
              data-cy="multiline"
            />
          </TitledContainer>
        </>
      )}
    </QuestionFormShell>
  );
};
