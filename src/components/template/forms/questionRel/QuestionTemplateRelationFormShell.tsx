import { Button, makeStyles, Typography, Link } from '@material-ui/core';
import { Form, Formik, FormikProps } from 'formik';
import React from 'react';

import { ActionButtonContainer } from 'components/common/ActionButtonContainer';
import { Template, QuestionTemplateRelation } from 'generated/sdk';
import { Event, EventType } from 'models/QuestionaryEditorModel';

import getTemplateFieldIcon from '../../getTemplateFieldIcon';

export const QuestionTemplateRelationFormShell = (props: {
  validationSchema: any;
  questionRel: QuestionTemplateRelation;
  dispatch: React.Dispatch<Event>;
  closeMe: Function;
  label: string;
  template: Template;
  children: (
    formikProps: FormikProps<QuestionTemplateRelation>
  ) => React.ReactNode;
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
