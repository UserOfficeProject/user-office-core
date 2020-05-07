import { Button, Typography, makeStyles } from '@material-ui/core';
import React, { FunctionComponent } from 'react';

import { EventType } from '../../../../models/QuestionaryEditorModel';
import getTemplateFieldIcon from '../../getTemplateFieldIcon';
import { ProposalTemplate, Question } from '../../../../generated/sdk';
import { Event } from '../../../../models/QuestionaryEditorModel';
import { TFormSignature } from '../TFormSignature';

export const QuestionFormShell: TFormSignature<Question> = props => {
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
        {getTemplateFieldIcon(props.field.dataType)}
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
              type: EventType.DELETE_QUESTION_REQUESTED,
              payload: { fieldId: props.field.proposalQuestionId },
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

interface QuestionFormShellProps {
  field: Question;
  template: ProposalTemplate;
  dispatch: React.Dispatch<Event>;
  closeMe: Function;
  label: string;
}

type QuestionFormShellSignature = FunctionComponent<QuestionFormShellProps>;
