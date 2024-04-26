import makeStyles from '@mui/styles/makeStyles';
import React from 'react';
import * as Yup from 'yup';

import { QuestionTemplateRelationFormProps } from 'components/questionary/QuestionaryComponentRegistry';
import { InstrumentPickerConfig } from 'generated/sdk';

import { QuestionInstrumentPickerFormCommon } from './QuestionInstrumentPickerFormCommon';
import { QuestionExcerpt } from '../QuestionExcerpt';
import { QuestionTemplateRelationFormShell } from '../QuestionTemplateRelationFormShell';

export const QuestionTemplateRelationInstrumentPickerForm = (
  props: QuestionTemplateRelationFormProps
) => {
  const useStyles = makeStyles((theme) => ({
    label: {
      color: theme.palette.primary.main,
      backgroundColor: theme.palette.grey[300],
      fontSize: 'medium',
    },
  }));
  const classes = useStyles();

  return (
    <QuestionTemplateRelationFormShell
      {...props}
      validationSchema={Yup.object().shape({
        config: Yup.object({
          required: Yup.bool(),
          variant: Yup.string().required('Variant is required'),
        }),
      })}
    >
      {() => (
        <>
          <label className={classes.label}>
            You are editing the question as it appears on the current template
          </label>
          <QuestionExcerpt question={props.questionRel.question} />
          <QuestionInstrumentPickerFormCommon
            config={props.questionRel.question.config as InstrumentPickerConfig}
          />
        </>
      )}
    </QuestionTemplateRelationFormShell>
  );
};
