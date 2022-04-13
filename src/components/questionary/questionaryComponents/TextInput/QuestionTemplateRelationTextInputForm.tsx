import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import { Field } from 'formik';
import { CheckboxWithLabel, TextField } from 'formik-mui';
import React, { FC } from 'react';
import * as Yup from 'yup';

import FormikUICustomEditor from 'components/common/FormikUICustomEditor';
import TitledContainer from 'components/common/TitledContainer';
import { QuestionTemplateRelationFormProps } from 'components/questionary/QuestionaryComponentRegistry';
import { TextInputConfig } from 'generated/sdk';

import QuestionDependencyList from '../QuestionDependencyList';
import { QuestionExcerpt } from '../QuestionExcerpt';
import { QuestionTemplateRelationFormShell } from '../QuestionTemplateRelationFormShell';

export const QuestionTemplateRelationTextInputForm: FC<
  QuestionTemplateRelationFormProps
> = (props) => {
  return (
    <QuestionTemplateRelationFormShell
      {...props}
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
      {(formikProps) => (
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

            <Field
              name="config.min"
              label="Min"
              id="Min-input"
              type="text"
              component={TextField}
              fullWidth
              data-cy="min"
            />

            <Field
              name="config.max"
              label="Max"
              id="Max-input"
              type="text"
              component={TextField}
              fullWidth
              data-cy="max"
            />
          </TitledContainer>
          <TitledContainer label="Options">
            <Field
              name="config.placeholder"
              label="Placeholder text"
              id="Placeholder-input"
              type="text"
              component={TextField}
              fullWidth
              data-cy="placeholder"
            />
            <Box component="div">
              <Field
                name="config.multiline"
                checked={
                  (formikProps.values.config as TextInputConfig).multiline
                }
                component={CheckboxWithLabel}
                type="checkbox"
                Label={{
                  label: 'Multiple lines',
                }}
                data-cy="multiline"
              />
            </Box>

            <Box component="div">
              <Field
                name="config.isCounterHidden"
                checked={
                  (formikProps.values.config as TextInputConfig).isCounterHidden
                }
                component={CheckboxWithLabel}
                type="checkbox"
                Label={{
                  label: 'Hide counter',
                }}
                data-cy="multiline"
              />
            </Box>

            <Field
              name="config.isHtmlQuestion"
              component={CheckboxWithLabel}
              type="checkbox"
              Label={{
                label: 'Enable rich text question',
              }}
            />
            <Collapse
              in={(formikProps.values.config as TextInputConfig).isHtmlQuestion}
            >
              <Field
                visible={
                  (formikProps.values.config as TextInputConfig).isHtmlQuestion
                }
                name="config.htmlQuestion"
                type="text"
                component={FormikUICustomEditor}
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
