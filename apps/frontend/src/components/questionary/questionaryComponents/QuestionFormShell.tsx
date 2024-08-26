import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
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

interface QuestionFormShellProps extends QuestionFormProps {
  validationSchema: unknown;
  confirm: WithConfirmType;
}

export const QuestionFormShell = withConfirm(
  (props: QuestionFormShellProps) => {
    const { question, validationSchema, confirm, children } = props;
    const { onUpdated, onDeleted, closeMe } = props;
    const { api } = useDataApiWithFeedback();
    const definition = getQuestionaryComponentDefinition(question.dataType);

    const submitHandler = async (values: Question): Promise<void> => {
      const { updateQuestion } = await api().updateQuestion({
        id: values.id,
        naturalKey: values.naturalKey,
        question: values.question,
        config: values.config ? JSON.stringify(values.config) : undefined,
      });

      if (updateQuestion) {
        onUpdated?.({
          ...question,
          ...updateQuestion,
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
          if (deleteQuestion) {
            onDeleted?.(deleteQuestion);
            closeMe?.();
          }
        },
        {
          title: 'Delete question',
          description: 'Are you sure you want to delete this question?',
        }
      )();

    return (
      <Box
        sx={{
          width: '100%',
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          sx={(theme) => ({
            marginTop: theme.spacing(2),
            marginBottom: theme.spacing(1),
            display: 'flex',
            alignItems: 'center',
            color: theme.palette.grey[600],
            '& SVG': {
              marginRight: theme.spacing(1),
            },
          })}
        >
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
      </Box>
    );
  }
);
