import { Box } from '@material-ui/core';
import Collapse from '@material-ui/core/Collapse';
import { Field } from 'formik';
import { TextField } from 'formik-material-ui';
import React, { useState } from 'react';
import * as Yup from 'yup';

import FormikUICustomCheckbox from 'components/common/FormikUICustomCheckbox';
import FormikUICustomDependencySelector from 'components/common/FormikUICustomDependencySelector';
import FormikUICustomEditor from 'components/common/FormikUICustomEditor';
import TitledContainer from 'components/common/TitledContainer';
import { FormComponent } from 'components/questionary/QuestionaryComponentRegistry';
import { QuestionTemplateRelation, TextInputConfig } from 'generated/sdk';

import { QuestionExcerpt } from '../QuestionExcerpt';
import { QuestionTemplateRelationFormShell } from '../QuestionTemplateRelationFormShell';

export const QuestionTemplateRelationTextInputForm: FormComponent<QuestionTemplateRelation> = props => {
  const config = props.field.config as TextInputConfig;

  const [isRichQuestion, setIsRichQuestion] = useState<boolean>(
    (props.field.config as TextInputConfig).isHtmlQuestion
  );

  return (
    <QuestionTemplateRelationFormShell
      closeMe={props.closeMe}
      dispatch={props.dispatch}
      questionRel={props.field}
      template={props.template}
      validationSchema={Yup.object().shape({
        question: Yup.object({
          config: Yup.object({
            min: Yup.number().nullable(),
            max: Yup.number().nullable(),
            required: Yup.boolean(),
            placeholder: Yup.string(),
            multiline: Yup.boolean(),
            isHtmlQuestion: Yup.boolean(),
          }),
        }),
      })}
    >
      {formikProps => (
        <>
          <QuestionExcerpt question={props.field.question} />

          <TitledContainer label="Constraints">
            <Field
              name="config.required"
              checked={config.required}
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
            <Box component="div">
              <Field
                name="config.multiline"
                checked={
                  (formikProps.values.config as TextInputConfig).multiline
                }
                component={FormikUICustomCheckbox}
                label="Multiple lines"
                margin="normal"
                data-cy="multiline"
              />
            </Box>

            <Box component="div">
              <Field
                name="config.isCounterHidden"
                checked={
                  (formikProps.values.config as TextInputConfig).isCounterHidden
                }
                component={FormikUICustomCheckbox}
                label="Hide counter"
                margin="normal"
                data-cy="multiline"
              />
            </Box>

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
          </TitledContainer>

          <TitledContainer label="Dependencies">
            <Field
              name="dependency"
              component={FormikUICustomDependencySelector}
              templateField={props.field}
              template={props.template}
              margin="normal"
              fullWidth
              data-cy="dependencies"
            />
          </TitledContainer>
        </>
      )}
    </QuestionTemplateRelationFormShell>
  );
};
