import { makeStyles, Grid, useTheme } from '@material-ui/core';
import LockIcon from '@material-ui/icons/Lock';
import React, { useState } from 'react';
import { Draggable } from 'react-beautiful-dnd';

import { DataType } from '../../generated/sdk';
import {
  ProposalTemplateField,
  EmbellishmentConfig,
} from '../../generated/sdk';
import { Event } from '../../models/QuestionaryEditorModel';
import getTemplateFieldIcon from './getTemplateFieldIcon';

export default function QuestionaryEditorTopicItem(props: {
  data: ProposalTemplateField;
  dispatch: React.Dispatch<Event>;
  index: number;
  onClick: { (data: ProposalTemplateField): void };
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

  const dependencies = props.data.dependencies;
  const dependenciesJsx =
    dependencies && dependencies.length > 0 ? (
      <>
        <LockIcon className={classes.lockIcon} />
        <ul>
          {dependencies.map(dep => {
            return (
              <li key={dep.question_id + dep.dependency_id}>
                {dep.dependency_natural_key}
              </li>
            );
          })}
        </ul>
      </>
    ) : null;

  return (
    <Draggable
      key={props.data.proposal_question_id}
      draggableId={props.data.proposal_question_id}
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
            {props.data.natural_key}
          </Grid>
          <Grid item xs={2} className={classes.icon}>
            {getTemplateFieldIcon(props.data.data_type)}
          </Grid>

          <Grid item xs={10} className={classes.question}>
            {props.data.data_type === DataType.EMBELLISHMENT
              ? (props.data.config as EmbellishmentConfig).plain
              : props.data.question}
          </Grid>

          <Grid item xs={12} className={classes.dependencies}>
            {dependenciesJsx}
          </Grid>
        </Grid>
      )}
    </Draggable>
  );
}
