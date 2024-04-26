import CloseIcon from '@mui/icons-material/Close';
import { IconButton } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import { Field } from 'formik';
import { CheckboxWithLabel, TextField } from 'formik-mui';
import React, { useState } from 'react';
import * as Yup from 'yup';

import InputDialog from 'components/common/InputDialog';
import TitledContainer from 'components/common/TitledContainer';
import { QuestionFormProps } from 'components/questionary/QuestionaryComponentRegistry';
import { QuestionFormShell } from 'components/questionary/questionaryComponents/QuestionFormShell';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import { useNaturalKeySchema } from 'utils/userFieldValidationSchema';

const useStyles = makeStyles((theme) => ({
  iconVerticalAlign: {
    verticalAlign: 'middle',
    marginLeft: theme.spacing(0.5),
  },
  textRightAlign: {
    marginLeft: 'auto',
    marginRight: 0,
  },
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
  },
}));

export const QuestionTimeRequestedForm = (props: QuestionFormProps) => {
  const [show, setShow] = useState(false);
  const field = props.question;
  const naturalKeySchema = useNaturalKeySchema(field.naturalKey);
  useDataApiWithFeedback();
  const classes = useStyles();

  return (
    <QuestionFormShell
      {...props}
      validationSchema={Yup.object().shape({
        naturalKey: naturalKeySchema,
        question: Yup.string().required('Question is required'),
        config: Yup.object({
          required: Yup.bool(),
          units: Yup.array().of(
            Yup.object({
              id: Yup.string(),
              quantity: Yup.string(),
              siConversionFormula: Yup.string(),
              symbol: Yup.string(),
              unit: Yup.string(),
            })
          ),
        }),
      })}
    >
      {() => (
        <>
          <Field
            name="naturalKey"
            label="Key"
            id="Key-input"
            type="text"
            component={TextField}
            fullWidth
            inputProps={{ 'data-cy': 'natural_key' }}
          />
          <Field
            name="question"
            label="Question"
            id="Question-input"
            type="text"
            component={TextField}
            fullWidth
            inputProps={{ 'data-cy': 'question' }}
          />

          <TitledContainer label="Constraints">
            <Field
              name="config.required"
              component={CheckboxWithLabel}
              type="checkbox"
              Label={{
                label: 'Is required',
              }}
              InputProps={{ 'data-cy': 'required' }}
            />
          </TitledContainer>
          <InputDialog
            aria-labelledby="simple-modal-title"
            aria-describedby="simple-modal-description"
            data-cy="unit-modal"
            open={show}
            fullWidth={true}
            onClose={(_, reason) => {
              if (reason && reason == 'backdropClick') return;
              setShow(false);
            }}
          >
            <IconButton
              className={classes.closeButton}
              data-cy="close-modal-btn"
              onClick={() => {
                setShow(false);
              }}
            >
              <CloseIcon />
            </IconButton>
          </InputDialog>
        </>
      )}
    </QuestionFormShell>
  );
};
