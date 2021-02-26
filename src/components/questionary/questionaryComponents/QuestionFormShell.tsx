import Button from '@material-ui/core/Button';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Typography from '@material-ui/core/Typography';
import { Form, Formik, FormikProps } from 'formik';
import React from 'react';

import { ActionButtonContainer } from 'components/common/ActionButtonContainer';
import { getQuestionaryComponentDefinition } from 'components/questionary/QuestionaryComponentRegistry';
import { Question } from 'generated/sdk';
import { Event, EventType } from 'models/QuestionaryEditorModel';
import { FunctionType } from 'utils/utilTypes';

const useStyles = makeStyles((theme) => ({
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
}));

export const QuestionFormShell = (props: {
  validationSchema: unknown;
  question: Question;
  dispatch: React.Dispatch<Event>;
  closeMe: FunctionType;
  children: (formikProps: FormikProps<Question>) => React.ReactNode;
}) => {
  const classes = useStyles();
  const definition = getQuestionaryComponentDefinition(props.question.dataType);

  return (
    <div className={classes.container}>
      <Typography variant="h4" className={classes.heading}>
        {definition.icon}
        {definition.name}
      </Typography>
      <Formik
        initialValues={props.question}
        onSubmit={async (values): Promise<void> => {
          props.dispatch({
            type: EventType.UPDATE_QUESTION_REQUESTED,
            payload: {
              field: { ...props.question, ...values },
            },
          });
          props.closeMe();
        }}
        validationSchema={props.validationSchema}
      >
        {(formikProps) => (
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
                disabled={definition.creatable === false}
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
