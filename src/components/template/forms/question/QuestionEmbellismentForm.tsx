import { Form, Formik } from 'formik';
import React from 'react';
import * as Yup from 'yup';
import { EmbellishmentConfig, Question } from '../../../../generated/sdk';
import { EventType } from '../../../../models/QuestionaryEditorModel';
import { EmbellishmentConfigFragment } from '../fragments/EmbellishmentConfigFragment';
import { QuestionFormShell } from './QuestionFormShell';
import { TFormSignature } from '../TFormSignature';

export const QuestionEmbellismentForm: TFormSignature<Question> = props => {
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
          <QuestionFormShell {...props}>
            <EmbellishmentConfigFragment
              config={formikProps.values.config as EmbellishmentConfig}
            />
          </QuestionFormShell>
        </Form>
      )}
    </Formik>
  );
};
