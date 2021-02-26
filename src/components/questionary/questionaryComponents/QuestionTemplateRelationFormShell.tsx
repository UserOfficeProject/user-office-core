import Button from '@material-ui/core/Button';
import Link from '@material-ui/core/Link';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Typography from '@material-ui/core/Typography';
import { Form, Formik, FormikProps } from 'formik';
import React from 'react';

import { ActionButtonContainer } from 'components/common/ActionButtonContainer';
import { getQuestionaryComponentDefinition } from 'components/questionary/QuestionaryComponentRegistry';
import { QuestionTemplateRelation, Template } from 'generated/sdk';
import { Event, EventType } from 'models/QuestionaryEditorModel';
import { FunctionType } from 'utils/utilTypes';

const useStyles = makeStyles((theme) => ({
  container: {
    width: '100%',
  },
  heading: {
    marginTop: theme.spacing(2),
    marginBottom: '21px',
    display: 'flex',
    alignItems: 'center',
    color: theme.palette.grey[600],
    '& SVG': {
      marginRight: theme.spacing(1),
    },
  },
  naturalKey: {
    fontSize: '16px',
    paddingLeft: '21px',
    display: 'block',
    marginBottom: '16px',
  },
}));

export const QuestionTemplateRelationFormShell = (props: {
  validationSchema?: unknown;
  questionRel: QuestionTemplateRelation;
  dispatch: React.Dispatch<Event>;
  closeMe: FunctionType;
  template: Template;
  children?: (
    formikProps: FormikProps<QuestionTemplateRelation>
  ) => React.ReactNode;
}) => {
  const classes = useStyles();
  const definition = getQuestionaryComponentDefinition(
    props.questionRel.question.dataType
  );

  return (
    <div className={classes.container}>
      <Typography variant="h4" className={classes.heading}>
        {definition.icon}
        {definition.name}
      </Typography>
      <Link
        data-cy="natural-key"
        href="#"
        onClick={() => {
          props.dispatch({
            type: EventType.OPEN_QUESTION_EDITOR,
            payload: props.questionRel.question,
          });
          props.closeMe();
        }}
        className={classes.naturalKey}
      >
        {props.questionRel.question.naturalKey}
      </Link>
      <Formik
        initialValues={props.questionRel}
        onSubmit={async (values): Promise<void> => {
          props.dispatch({
            type: EventType.UPDATE_QUESTION_REL_REQUESTED,
            payload: {
              field: { ...props.questionRel, ...values },
              templateId: props.template.templateId,
            },
          });
          props.closeMe();
        }}
        validationSchema={props.validationSchema}
      >
        {(formikProps) => (
          <Form style={{ flexGrow: 1 }}>
            {props.children?.(formikProps)}
            <ActionButtonContainer>
              <Button
                type="button"
                variant="outlined"
                color="primary"
                data-cy="delete"
                onClick={() => {
                  props.dispatch({
                    type: EventType.DELETE_QUESTION_REL_REQUESTED,
                    payload: {
                      fieldId: props.questionRel.question.proposalQuestionId,
                      templateId: props.template.templateId,
                    },
                  });
                  props.closeMe();
                }}
                disabled={definition.creatable === false}
              >
                Remove from template
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                data-cy="submit"
              >
                Update
              </Button>
            </ActionButtonContainer>
          </Form>
        )}
      </Formik>
    </div>
  );
};
