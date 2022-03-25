import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import makeStyles from '@mui/styles/makeStyles';
import { Form, Formik } from 'formik';
import React from 'react';

import { ActionButtonContainer } from 'components/common/ActionButtonContainer';
import {
  getQuestionaryComponentDefinition,
  QuestionFormProps,
} from 'components/questionary/QuestionaryComponentRegistry';
import { Question } from 'generated/sdk';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

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

export const QuestionFormShell = (
  props: QuestionFormProps & {
    validationSchema: unknown;
  }
) => {
  const classes = useStyles();
  const { api } = useDataApiWithFeedback();
  const definition = getQuestionaryComponentDefinition(props.question.dataType);

  const submitHandler = async (values: Question): Promise<void> => {
    api()
      .updateQuestion({
        id: values.id,
        naturalKey: values.naturalKey,
        question: values.question,
        config: values.config ? JSON.stringify(values.config) : undefined,
      })
      .then((data) => {
        if (data.updateQuestion.question) {
          props.onUpdated?.({
            ...props.question,
            ...data.updateQuestion.question,
          });
          props.closeMe?.();
        }
      });
  };

  const deleteHandler = () =>
    api()
      .deleteQuestion({
        questionId: props.question.id,
      })
      .then((data) => {
        if (data.deleteQuestion.question) {
          props.onDeleted?.(data.deleteQuestion.question);
          props.closeMe?.();
        }
      });

  return (
    <div className={classes.container}>
      <Typography variant="h4" component="h1" className={classes.heading}>
        {definition.icon}
        {definition.name}
      </Typography>
      <Formik
        initialValues={props.question}
        onSubmit={submitHandler}
        validationSchema={props.validationSchema}
      >
        {(formikProps) => (
          <Form style={{ flexGrow: 1 }}>
            {props.children?.(formikProps)}

            <ActionButtonContainer>
              <Button
                type="button"
                variant="outlined"
                data-cy="delete"
                onClick={deleteHandler}
                disabled={definition.creatable === false}
              >
                Delete
              </Button>
              <Button type="submit" data-cy="submit">
                Save
              </Button>
            </ActionButtonContainer>
          </Form>
        )}
      </Formik>
    </div>
  );
};
