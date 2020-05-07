import { Field, Form, Formik } from 'formik';
import React from 'react';
import * as Yup from 'yup';
import { FileUploadConfig } from '../../../../generated/sdk';
import { EventType } from '../../../../models/QuestionaryEditorModel';
import FormikUICustomDependencySelector from '../../../common/FormikUICustomDependencySelector';
import TitledContainer from '../../../common/TitledContainer';
import { QuestionFormShell } from '../question/QuestionFormShell';
import { FileUploadConfigFragment } from '../fragments/FileUploadConfigFragment';
import { AdminComponentSignature } from '../QuestionRelEditor';

export const QuestionRelFileUploadForm: AdminComponentSignature = props => {
  const field = props.field;

  return (
    <Formik
      initialValues={field}
      onSubmit={async vals => {
        props.dispatch({
          type: EventType.UPDATE_FIELD_REQUESTED,
          payload: {
            field: { ...field, ...vals },
          },
        });
        props.closeMe();
      }}
      validationSchema={Yup.object().shape({
        question: Yup.object({
          config: Yup.object({
            file_type: Yup.array(),
            small_label: Yup.string(),
            max_files: Yup.number(),
          }),
        }),
      })}
    >
      {formikProps => (
        <Form style={{ flexGrow: 1 }}>
          <QuestionFormShell {...props} label="File upload">
            <FileUploadConfigFragment
              config={formikProps.values.question.config as FileUploadConfig}
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
          </QuestionFormShell>
        </Form>
      )}
    </Formik>
  );
};
