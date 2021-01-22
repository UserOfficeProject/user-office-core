import Grid from '@material-ui/core/Grid';
import makeStyles from '@material-ui/core/styles/makeStyles';
import useTheme from '@material-ui/core/styles/useTheme';
import LockIcon from '@material-ui/icons/Lock';
import React, { useState } from 'react';
import {
  Draggable,
  DraggingStyle,
  NotDraggingStyle,
} from 'react-beautiful-dnd';

import {
  getQuestionaryComponentDefinition,
  getTemplateFieldIcon,
} from 'components/questionary/QuestionaryComponentRegistry';
import {
  DataType,
  FieldConfig,
  FieldDependency,
  TemplateCategoryId,
} from 'generated/sdk';

export default function TemplateQuestionEditor(props: {
  data: TemplateTopicEditorData;
  index: number;
  onClick: { (data: TemplateTopicEditorData): void };
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

  const getItemStyle = (
    isDragging: boolean,
    draggableStyle: DraggingStyle | NotDraggingStyle | undefined
  ) => ({
    display: 'flex',
    padding: '12px 8px 8px 8px',
    margin: '0',
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
  const dependencyJsx = dependencies.length ? (
    <>
      <LockIcon className={classes.lockIcon} />
      <ul>
        {dependencies.map((dependency, i) => {
          const dependencyOperator = i < dependencies.length - 1 ? '&' : '';

          return (
            <li key={dependency.dependencyId + dependency.questionId}>
              {`${dependency.dependencyNaturalKey} ${dependencyOperator}`}
            </li>
          );
        })}
      </ul>
    </>
  ) : null;

  const questionDefinition = getQuestionaryComponentDefinition(
    props.data.dataType
  );

  return (
    <Draggable
      key={props.data.proposalQuestionId}
      draggableId={props.data.proposalQuestionId}
      index={props.index}
      isDragDisabled={questionDefinition.creatable === false}
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
          data-cy="question-container"
        >
          <Grid
            item
            xs={10}
            className={classes.questionId}
            data-cy="proposal-question-id"
          >
            {props.data.naturalKey}
          </Grid>
          <Grid item xs={2} className={classes.icon}>
            {getTemplateFieldIcon(props.data.dataType)}
          </Grid>

          <Grid item xs={10} className={classes.question}>
            {questionDefinition.renderers
              ? questionDefinition.renderers.questionRenderer({
                  question: props.data,
                })
              : props.data.question}
          </Grid>

          <Grid item xs={12} className={classes.dependencies}>
            {dependencyJsx}
          </Grid>
        </Grid>
      )}
    </Draggable>
  );
}

export interface TemplateTopicEditorData {
  proposalQuestionId: string;
  question: string;
  naturalKey: string;
  dataType: DataType;
  dependencies: FieldDependency[];
  config: FieldConfig;
  categoryId: TemplateCategoryId;
}
