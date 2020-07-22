import { Button, makeStyles, Typography } from '@material-ui/core';
import { Form, Formik, FormikProps } from 'formik';
import React from 'react';

import { ActionButtonContainer } from 'components/common/ActionButtonContainer';
import { Question } from 'generated/sdk';
import { Event, EventType } from 'models/QuestionaryEditorModel';

import getTemplateFieldIcon from '../../getTemplateFieldIcon';

export const QuestionFormShell = (props: {
  validationSchema: any;
  question: Question;
  dispatch: React.Dispatch<Event>;
  label: string;
  closeMe: Function;
  children: (formikProps: FormikProps<Question>) => React.ReactNode;
}) => {
  const classes = makeStyles(theme => ({
    container: {
      width: '100%',
    },
    heading: {
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(1),
      display: 'flex',
      alignItems: 'center',
      color: theme.palette.grey[600],
      '& SVG': {
        marginRight: theme.spacing(1),
      },
    },
    actions: {
      marginTop: theme.spacing(4),
      display: 'flex',
      justifyContent: 'space-between',
    },
  }))();

  return (
    <div className={classes.container}>
      <Typography variant="h4" className={classes.heading}>
        {getTemplateFieldIcon(props.question.dataType)}
        {props.label}
      </Typography>
      <Formik
        initialValues={props.question}
        onSubmit={async form => {
          props.dispatch({
            type: EventType.UPDATE_QUESTION_REQUESTED,
            payload: {
              field: { ...props.question, ...form },
            },
          });
          props.closeMe();
        }}
        validationSchema={props.validationSchema}
      >
        {formikProps => (
          <Form style={{ flexGrow: 1 }}>
            {props.children(formikProps)}

            <ActionButtonContainer>
              <Button
                type="button"
                variant="outlined"
                color="primary"
                data-cy="delete"
                onClick={() => {
                  props.dispatch({
                    type: EventType.DELETE_QUESTION_REQUESTED,
                    payload: { questionId: props.question.proposalQuestionId },
                  });
                  props.closeMe();
                }}
              >
                Delete
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                data-cy="submit"
              >
                Save
              </Button>
            </ActionButtonContainer>
          </Form>
        )}
      </Formik>
    </div>
  );
};
