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
import withConfirm, { WithConfirmType } from 'utils/withConfirm';

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

interface QuestionFormShellProps extends QuestionFormProps {
  validationSchema: unknown;
  confirm: WithConfirmType;
}

export const QuestionFormShell = withConfirm(
  (props: QuestionFormShellProps) => {
    const { question, validationSchema, confirm, children } = props;
    const { onUpdated, onDeleted, closeMe } = props;

    const classes = useStyles();
    const { api } = useDataApiWithFeedback();
    const definition = getQuestionaryComponentDefinition(question.dataType);

    const submitHandler = async (values: Question): Promise<void> => {
      const { updateQuestion } = await api().updateQuestion({
        id: values.id,
        naturalKey: values.naturalKey,
        question: values.question,
        config: values.config ? JSON.stringify(values.config) : undefined,
      });

      if (updateQuestion.question) {
        onUpdated?.({
          ...question,
          ...updateQuestion.question,
        });
        closeMe?.();
      }
    };

    const deleteHandler = () =>
      confirm(
        async () => {
          const { deleteQuestion } = await api().deleteQuestion({
            questionId: question.id,
          });
          if (deleteQuestion.question) {
            onDeleted?.(deleteQuestion.question);
            closeMe?.();
          }
        },
        {
          title: 'Delete question',
          description: 'Are you sure you want to delete this question?',
        }
      )();

    return (
      <div className={classes.container}>
        <Typography variant="h4" component="h1" className={classes.heading}>
          {definition.icon}
          {definition.name}
        </Typography>
        <Formik
          initialValues={question}
          onSubmit={submitHandler}
          validationSchema={validationSchema}
        >
          {(formikProps) => (
            <Form style={{ flexGrow: 1 }}>
              {children?.(formikProps)}

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
                <Button
                  type="submit"
                  data-cy="submit"
                  disabled={!formikProps.isValid}
                >
                  Save
                </Button>
              </ActionButtonContainer>
            </Form>
          )}
        </Formik>
      </div>
    );
  }
);
