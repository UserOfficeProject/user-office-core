import { makeStyles, Grid, useTheme } from '@material-ui/core';
import LockIcon from '@material-ui/icons/Lock';
import React, { useState } from 'react';
import { Draggable } from 'react-beautiful-dnd';

import { DataType, QuestionRel } from '../../generated/sdk';
import { EmbellishmentConfig } from '../../generated/sdk';
import { Event } from '../../models/QuestionaryEditorModel';
import getTemplateFieldIcon from './getTemplateFieldIcon';

export default function QuestionaryEditorTopicItem(props: {
  data: QuestionRel;
  dispatch: React.Dispatch<Event>;
  index: number;
  onClick: { (data: QuestionRel): void };
}) {
  const theme = useTheme();
  const classes = makeStyles(theme => ({
    icon: {
      color: theme.palette.grey[400],
      justifyItems: 'flex-end',
      justifyContent: 'flex-end',
      display: 'flex',
    },
    question: {
      color: '#000',
      fontSize: '15px',
      padding: '6px 0',
    },
    questionId: {
      fontSize: '12px',
      fontWeight: 'bold',
      color: theme.palette.grey[400],
    },
    dependencies: {
      fontSize: '12px',
      color: theme.palette.grey[400],
      display: 'flex',
      padding: '10px 0 5px 0',
      justifyContent: 'flex-end',
      alignItems: 'center',
      '& ul': {
        display: 'inline-block',
        padding: '0',
        margin: '0',
        '& li': {
          display: 'inline',
          marginLeft: '3px',
          listStyle: 'none',
        },
      },
    },
    lockIcon: {
      fontSize: '17px',
    },
  }))();

  const [isHover, setIsHover] = useState<boolean>(false);

  const getItemStyle = (isDragging: any, draggableStyle: any) => ({
    display: 'flex',
    padding: '12px 8px 8px 8px',
    margin: '1px',
    backgroundColor: isDragging
      ? theme.palette.grey[200]
      : isHover
      ? theme.palette.grey[100]
      : 'white',
    transition: 'all 500ms cubic-bezier(0.190, 1.000, 0.220, 1.000)',
    boxShadow: '0px 1px 2px 0px rgba(163,163,163,0.66)',
    maxWidth: '100%',
    ...draggableStyle,
  });

  const dependency = props.data.dependency;
  const dependencyJsx = dependency ? (
    <>
      <LockIcon className={classes.lockIcon} />
      <ul>
        return (
        <li key={dependency.dependencyId + dependency.questionId}>
          {dependency.dependencyNaturalKey}
        </li>
        );
      </ul>
    </>
  ) : null;

  return (
    <Draggable
      key={props.data.question.proposalQuestionId}
      draggableId={props.data.question.proposalQuestionId}
      index={props.index}
    >
      {(provided, snapshot) => (
        <Grid
          container
          spacing={1}
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={getItemStyle(
            snapshot.isDragging,
            provided.draggableProps.style
          )}
          onMouseEnter={() => setIsHover(true)}
          onMouseLeave={() => setIsHover(false)}
          onClick={() => {
            props.onClick(props.data);
          }}
        >
          <Grid
            item
            xs={10}
            className={classes.questionId}
            data-cy="proposal-question-id"
          >
            {props.data.question.naturalKey}
          </Grid>
          <Grid item xs={2} className={classes.icon}>
            {getTemplateFieldIcon(props.data.question.dataType)}
          </Grid>

          <Grid item xs={10} className={classes.question}>
            {props.data.question.dataType === DataType.EMBELLISHMENT
              ? (props.data.question.config as EmbellishmentConfig).plain
              : props.data.question.question}
          </Grid>

          <Grid item xs={12} className={classes.dependencies}>
            {dependencyJsx}
          </Grid>
        </Grid>
      )}
    </Draggable>
  );
}
