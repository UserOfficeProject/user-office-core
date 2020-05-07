import { Field, Form, Formik } from 'formik';
import React from 'react';
import * as Yup from 'yup';
import { TextInputConfig } from '../../../../generated/sdk';
import { EventType } from '../../../../models/QuestionaryEditorModel';
import FormikUICustomDependencySelector from '../../../common/FormikUICustomDependencySelector';
import TitledContainer from '../../../common/TitledContainer';
import { TextInputConfigFragment } from '../fragments/TextInputConfigFragment';
import { QuestionRelAdminComponentSignature } from '../QuestionRelEditor';
import { QuestionRelFormShell } from './QuestionRelFormShell';

export const QuestionRelTextInputForm: QuestionRelAdminComponentSignature = props => {
  const field = props.field;

  return (
    <Formik
      initialValues={field}
      onSubmit={async vals => {
        props.dispatch({
          type: EventType.UPDATE_FIELD_REQUESTED,
          payload: {
            field: {
              ...field,
              ...vals,
              config: {
                ...vals.question.config,
                htmlQuestion: (vals.question.config as TextInputConfig)
                  .isHtmlQuestion
                  ? (vals.question.config as TextInputConfig).htmlQuestion
                  : null,
              },
            },
          },
        });
        props.closeMe();
      }}
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
        <Form style={{ flexGrow: 1 }}>
          <QuestionRelFormShell {...props} label="Text input">
            <TextInputConfigFragment
              config={formikProps.values.question.config as TextInputConfig}
            />

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
          </QuestionRelFormShell>
        </Form>
      )}
    </Formik>
  );
};
