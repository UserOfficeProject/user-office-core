import { Form, Formik } from 'formik';
import React from 'react';
import * as Yup from 'yup';
import { EmbellishmentConfig } from '../../../generated/sdk';
import { EventType } from '../../../models/QuestionaryEditorModel';
import { EmbellishmentConfigFragment } from '../formFragments/EmbellishmentConfigFragment';
import { AdminComponentSignature } from '../QuestionRelEditor';
import { AdminComponentShell } from './FormShell';

export const QuestionEmbellismentForm: AdminComponentSignature = props => {
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
            <EmbellishmentConfigFragment
              config={formikProps.values.question.config as EmbellishmentConfig}
            />
          </AdminComponentShell>
        </Form>
      )}
    </Formik>
  );
};
