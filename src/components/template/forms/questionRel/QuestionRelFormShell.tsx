import { Button, makeStyles, Typography, Link } from '@material-ui/core';
import { Form, Formik, FormikProps } from 'formik';
import React from 'react';

import { ProposalTemplate, QuestionRel } from '../../../../generated/sdk';
import { Event, EventType } from '../../../../models/QuestionaryEditorModel';
import getTemplateFieldIcon from '../../getTemplateFieldIcon';

export const QuestionRelFormShell = (props: {
  validationSchema: any;
  questionRel: QuestionRel;
  dispatch: React.Dispatch<Event>;
  closeMe: Function;
  label: string;
  template: ProposalTemplate;
  children: (formikProps: FormikProps<QuestionRel>) => React.ReactNode;
}) => {
  const classes = makeStyles(theme => ({
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
    actions: {
      marginTop: theme.spacing(4),
      display: 'flex',
      justifyContent: 'space-between',
    },
    naturalKey: {
      fontSize: '16px',
      paddingLeft: '21px',
      display: 'block',
      marginBottom: '16px',
    },
  }))();

  return (
    <div className={classes.container}>
      <Typography variant="h4" className={classes.heading}>
        {getTemplateFieldIcon(props.questionRel.question.dataType)}
        {props.label}
      </Typography>
      <Link
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
        onSubmit={async form => {
          props.dispatch({
            type: EventType.UPDATE_QUESTION_REL_REQUESTED,
            payload: {
              field: { ...props.questionRel, ...form },
              templateId: props.template.templateId,
            },
          });
          props.closeMe();
        }}
        validationSchema={props.validationSchema}
      >
        {formikProps => (
          <Form style={{ flexGrow: 1 }}>
            {props.children(formikProps)}
            <div className={classes.actions}>
              <Button
                type="button"
                variant="contained"
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
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};
