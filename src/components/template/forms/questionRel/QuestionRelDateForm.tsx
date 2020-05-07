import { Field, Form, Formik } from 'formik';
import React from 'react';
import * as Yup from 'yup';
import { DateConfig, QuestionRel } from '../../../../generated/sdk';
import { EventType } from '../../../../models/QuestionaryEditorModel';
import FormikUICustomDependencySelector from '../../../common/FormikUICustomDependencySelector';
import TitledContainer from '../../../common/TitledContainer';
import { DateConfigFragment } from '../fragments/DateConfigFragment';

import { QuestionRelFormShell } from './QuestionRelFormShell';
import { TFormSignature } from '../TFormSignature';

export const QuestionRelDateForm: TFormSignature<QuestionRel> = props => {
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
      validationSchema={Yup.object().shape({})}
    >
      {formikProps => (
        <Form style={{ flexGrow: 1 }}>
          <QuestionRelFormShell {...props} label="Date">
            <DateConfigFragment
              config={formikProps.values.question.config as DateConfig}
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
