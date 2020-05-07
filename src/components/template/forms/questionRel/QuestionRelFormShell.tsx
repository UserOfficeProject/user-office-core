import { Button, Typography, makeStyles } from '@material-ui/core';
import React, { FunctionComponent } from 'react';

import { EventType } from '../../../../models/QuestionaryEditorModel';
import getTemplateFieldIcon from '../../getTemplateFieldIcon';
import { QuestionRel, ProposalTemplate } from '../../../../generated/sdk';
import { Event } from '../../../../models/QuestionaryEditorModel';

export const QuestionRelFormShell: QuestionRelFormShellSignature = props => {
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
        {getTemplateFieldIcon(props.field.question.dataType)}
        {props.label}
      </Typography>
      {props.children}
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
                fieldId: props.field.question.proposalQuestionId,
                templateId: props.template.templateId,
              },
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
      </div>
    </div>
  );
};

interface QuestionRelFormShellProps {
  field: QuestionRel;
  template: ProposalTemplate;
  dispatch: React.Dispatch<Event>;
  closeMe: Function;
  label: string;
}

type QuestionRelFormShellSignature = FunctionComponent<
  QuestionRelFormShellProps
>;
