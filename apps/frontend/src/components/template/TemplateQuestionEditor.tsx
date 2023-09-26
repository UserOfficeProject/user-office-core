import LockIcon from '@mui/icons-material/Lock';
import Grid from '@mui/material/Grid';
import makeStyles from '@mui/styles/makeStyles';
import useTheme from '@mui/styles/useTheme';
import React, { useState } from 'react';
import {
  Draggable,
  DraggingStyle,
  NotDraggingStyle,
} from 'react-beautiful-dnd';

import defaultRenderer from 'components/questionary/DefaultQuestionRenderer';
import {
  getQuestionaryComponentDefinition,
  getTemplateFieldIcon,
} from 'components/questionary/QuestionaryComponentRegistry';
import {
  DataType,
  DependenciesLogicOperator,
  FieldConfig,
  FieldDependency,
  TemplateCategoryId,
} from 'generated/sdk';
import { Event, EventType } from 'models/questionary/QuestionaryEditorModel';

const useStyles = makeStyles((theme) => ({
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
    color: theme.palette.grey[800],
  },
  dependencies: {
    fontSize: '12px',
    color: theme.palette.grey[900],
    display: 'flex',
    padding: '10px 0 5px 0',
    '& div': {
      marginLeft: 'auto',
      alignItems: 'center',
      display: 'flex',
      cursor: 'pointer',
    },
    '& ul': {
      display: 'inline-block',
      padding: '0',
      margin: '0',
      '& li': {
        display: 'inline',
        marginLeft: '3px',
        listStyle: 'none',
        '&:hover': {
          transitionDuration: '300ms',
          textDecoration: 'underline',
          color: theme.palette.primary.main,
        },
      },
    },
  },
  lockIcon: {
    fontSize: '17px',
  },
}));

export default function TemplateQuestionEditor(props: {
  data: TemplateTopicEditorData;
  index: number;
  onClick: { (data: TemplateTopicEditorData): void };
  dispatch: React.Dispatch<Event>;
  isHighlighted?: boolean;
}) {
  const theme = useTheme();
  const classes = useStyles();

  const [isHover, setIsHover] = useState<boolean>(false);

  const getItemStyle = (
    isDragging: boolean,
    draggableStyle: DraggingStyle | NotDraggingStyle | undefined,
    isHighlighted: boolean
  ) => ({
    display: 'flex',
    padding: '12px 8px 8px 8px',
    outline: isHighlighted
      ? `1px solid ${theme.palette.primary.main}`
      : 'inherit',
    outlineOffset: '-1px',
    transitionDuration: '300ms',
    margin: '0 0 1px 0',
    borderTop: '1px solid white',
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
  let dependencyComparator =
    props.data.dependenciesOperator === DependenciesLogicOperator.AND
      ? '&&'
      : '||';
  const dependencyJsx = dependencies.length ? (
    <div>
      <LockIcon className={classes.lockIcon} />
      <ul data-cy="dependency-list">
        {dependencies.map((dependency, i) => {
          dependencyComparator =
            i < dependencies.length - 1 ? dependencyComparator : '';

          const dependenciesAreVisible = !!dependency.dependencyNaturalKey;

          return (
            dependenciesAreVisible && (
              <li
                key={dependency.dependencyId + dependency.questionId}
                onMouseEnter={() =>
                  props.dispatch({
                    type: EventType.DEPENDENCY_HOVER,
                    payload: { dependency: dependency.dependencyId },
                  })
                }
                onMouseLeave={() =>
                  props.dispatch({
                    type: EventType.DEPENDENCY_HOVER,
                    payload: { dependency: '' },
                  })
                }
                onClick={(e) => {
                  e.stopPropagation();
                  props.dispatch({
                    type: EventType.OPEN_QUESTIONREL_EDITOR,
                    payload: { questionId: dependency.dependencyId },
                  });
                }}
              >
                {`${dependency.dependencyNaturalKey} `}
                <strong>{`${dependencyComparator}`}</strong>
              </li>
            )
          );
        })}
      </ul>
    </div>
  ) : null;

  const questionDefinition = getQuestionaryComponentDefinition(
    props.data.dataType
  );

  return (
    <Draggable
      key={props.data.id}
      draggableId={props.data.id}
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
            provided.draggableProps.style,
            props.isHighlighted === true
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
              ? questionDefinition.renderers.questionRenderer(props.data)
              : defaultRenderer.questionRenderer(props.data)}
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
  id: string;
  question: string;
  naturalKey: string;
  dataType: DataType;
  dependencies: FieldDependency[];
  dependenciesOperator: DependenciesLogicOperator;
  config: FieldConfig;
  categoryId: TemplateCategoryId;
}
