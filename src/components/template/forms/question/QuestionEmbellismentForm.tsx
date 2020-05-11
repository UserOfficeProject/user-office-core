import React from 'react';
import * as Yup from 'yup';
import { EmbellishmentConfig, Question } from '../../../../generated/sdk';
import { EmbellishmentConfigFragment } from '../fragments/EmbellishmentConfigFragment';
import { TFormSignature } from '../TFormSignature';
import { QuestionFormShell } from './QuestionFormShell';

export const QuestionEmbellismentForm: TFormSignature<Question> = props => {
  return (
    <QuestionFormShell
      closeMe={props.closeMe}
      dispatch={props.dispatch}
      field={props.field}
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
        <>
          <EmbellishmentConfigFragment
            config={formikProps.values.config as EmbellishmentConfig}
          />
        </>
      )}
    </QuestionFormShell>
  );
};
