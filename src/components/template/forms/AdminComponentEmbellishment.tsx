import { Field, Form, Formik } from 'formik';
import React from 'react';
import * as Yup from 'yup';
import { EmbellishmentConfig } from '../../../generated/sdk';
import { EventType } from '../../../models/QuestionaryEditorModel';
import FormikUICustomDependencySelector from '../../common/FormikUICustomDependencySelector';
import TitledContainer from '../../common/TitledContainer';
import { AdminComponentShell } from './AdminComponentShell';
import { EmbellishmentConfigFragment } from '../formFragments/EmbellishmentConfigFragment';
import { AdminComponentSignature } from '../QuestionRelEditor';

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
            <EmbellishmentConfigFragment
              config={formikProps.values.question.config as EmbellishmentConfig}
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
