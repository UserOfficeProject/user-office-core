import { Formik, Form, Field } from 'formik';
import { TextField } from 'formik-material-ui';
import React from 'react';
import * as Yup from 'yup';

import { EmbellishmentConfig } from '../../generated/sdk';
import { EventType } from '../../models/QuestionaryEditorModel';
import FormikUICustomCheckbox from '../common/FormikUICustomCheckbox';
import FormikUICustomDependencySelector from '../common/FormikUICustomDependencySelector';
import FormikUICustomEditor from '../common/FormikUICustomEditor';
import TitledContainer from '../common/TitledContainer';
import { AdminComponentShell } from './AdminComponentShell';
import { AdminComponentSignature } from './QuestionaryFieldEditor';

export const AdminComponentEmbellishment: AdminComponentSignature = props => {
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
            html: Yup.string().required('Content is required'),
            plain: Yup.string().required('Plain description is required'),
          }),
        }),
      })}
    >
      {formikProps => (
        <Form style={{ flexGrow: 1 }}>
          <AdminComponentShell {...props} label="Embellishment">
            <Field
              name="question.config.html"
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
              data-cy="html"
            />

            <Field
              name="question.config.plain"
              label="Plain description"
              type="text"
              component={TextField}
              margin="normal"
              fullWidth
              data-cy="plain"
            />

            <Field
              name="question.config.omitFromPdf"
              checked={
                (formikProps.values.question.config as EmbellishmentConfig)
                  .omitFromPdf
              }
              component={FormikUICustomCheckbox}
              label="Omit from PDF"
              margin="normal"
              fullWidth
              data-cy="omit"
            />

            <TitledContainer label="Dependencies">
              <Field
                name="dependency"
                component={FormikUICustomDependencySelector}
                templateField={props.field}
                template={props.template}
                label="User must check it to continue"
                margin="normal"
                fullWidth
                data-cy="dependencies"
              />
            </TitledContainer>
          </AdminComponentShell>
        </Form>
      )}
    </Formik>
  );
};
