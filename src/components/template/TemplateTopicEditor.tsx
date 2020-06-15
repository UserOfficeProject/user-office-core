import {
  Divider,
  Fade,
  Grid,
  ListItemIcon,
  makeStyles,
  Menu,
  MenuItem,
  Typography,
  useTheme,
} from '@material-ui/core';
import DeleteRoundedIcon from '@material-ui/icons/DeleteRounded';
import MoreHorizIcon from '@material-ui/icons/MoreHoriz';
import PlaylistAddIcon from '@material-ui/icons/PlaylistAdd';
import React, { useState } from 'react';
import { Draggable, Droppable } from 'react-beautiful-dnd';

import { QuestionRel, TemplateStep } from '../../generated/sdk';
import { Event, EventType } from '../../models/QuestionaryEditorModel';
import TemplateQuestionEditor, {
  TemplateTopicEditorData,
} from './TemplateQuestionEditor';

class TemplateTopicEditor implements TemplateTopicEditorData {
  constructor(public source: QuestionRel) {}

  get proposalQuestionId() {
    return this.source.question.proposalQuestionId;
  }
  get question() {
    return this.source.question.question;
  }
  get naturalKey() {
    return this.source.question.naturalKey;
  }
  get dataType() {
    return this.source.question.dataType;
  }
  get dependency() {
    return this.source.dependency;
  }
  get config() {
    return this.source.config;
  }
}

export default function QuestionaryEditorTopic(props: {
  data: TemplateStep;
  dispatch: React.Dispatch<Event>;
  index: number;
  dragMode: boolean;
}) {
  const theme = useTheme();

  const classes = makeStyles(theme => ({
    container: {
      alignItems: 'flex-start',
      alignContent: 'flex-start',
      background: '#FFF',
      flexBasis: '100%',
    },
    inputHeading: {
      fontSize: '15px',
      color: theme.palette.grey[600],
      fontWeight: 600,
      width: '100%',
    },
    itemContainer: {
      minHeight: '180px',
    },
    topic: {
      fontSize: '15px',
      padding: '0 5px',
      marginBottom: '16px',
      color: theme.palette.grey[600],
      fontWeight: 600,
      background: 'white',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
    addQuestionMenuItem: {
      minHeight: 0,
    },
    showMoreButton: {
      cursor: 'pointer',
    },
    addIcon: {
      textAlign: 'right',
      paddingRight: '8px',
    },
    dragMode: {
      borderColor: theme.palette.grey[400],
      padding: '5px',
      borderWidth: '1px',
      borderStyle: 'dashed',
    },
  }))();

  const { data, dispatch, index } = props;
  const [title, setTitle] = useState<string>(data.topic.title);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [anchorEl, setAnchorEl] = React.useState<null | SVGSVGElement>(null);
  const open = Boolean(anchorEl);

  const getListStyle = (isDraggingOver: any) => ({
    background: isDraggingOver
      ? theme.palette.primary.light
      : theme.palette.grey[100],
    transition: 'all 500ms cubic-bezier(0.190, 1.000, 0.220, 1.000)',
  });

  const getItemStyle = (isDragging: any, draggableStyle: any) => ({
    background: '#FFF',
    ...draggableStyle,
  });

  const titleJsx = isEditMode ? (
    <input
      type="text"
      value={title}
      data-cy="topic-title-input"
      className={classes.inputHeading}
      onChange={event => setTitle(event.target.value)}
      onBlur={() => {
        setIsEditMode(false);
        dispatch({
          type: EventType.UPDATE_TOPIC_TITLE_REQUESTED,
          payload: { topicId: data.topic.id, title: title },
        });
      }}
      onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
          e.currentTarget.blur();
        }
      }}
    />
  ) : (
    <span
      onClick={() => {
        setIsEditMode(true);
      }}
      data-cy="topic-title"
    >
      {index + 2}. {title}
    </span>
  );

  const getItems = () => {
    if (props.dragMode) {
      return null;
    } else {
      return data.fields.map((item, index) => (
        <TemplateQuestionEditor
          index={index}
          data={new TemplateTopicEditor(item)}
          onClick={item =>
            dispatch({
              type: EventType.OPEN_QUESTIONREL_EDITOR,
              payload: (item as TemplateTopicEditor).source,
            })
          }
          key={item.question.proposalQuestionId.toString()}
        />
      ));
    }
  };

  return (
    <Draggable
      key={data.topic.id.toString()}
      draggableId={data.topic.id.toString()}
      index={index}
      isDragDisabled={!props.dragMode}
    >
      {(provided, snapshotDraggable) => (
        <Grid
          container
          className={`${classes.container} ${
            props.dragMode ? classes.dragMode : null
          }`}
          {...provided.draggableProps}
          ref={provided.innerRef}
          style={getItemStyle(
            snapshotDraggable.isDragging,
            provided.draggableProps.style
          )}
          {...provided.dragHandleProps}
        >
          <Grid item xs={10} className={classes.topic}>
            {titleJsx}
          </Grid>
          <Grid item xs={2} className={classes.addIcon}>
            <MoreHorizIcon
              onClick={(event: React.MouseEvent<SVGSVGElement>) =>
                setAnchorEl(event.currentTarget)
              }
              className={classes.showMoreButton}
              data-cy="show-more-button"
            />
            <Menu
              anchorEl={anchorEl}
              keepMounted
              open={open}
              onClose={() => setAnchorEl(null)}
              TransitionComponent={Fade}
            >
              <MenuItem
                className={classes.addQuestionMenuItem}
                onClick={() => {
                  dispatch({
                    type: EventType.PICK_QUESTION_REQUESTED,
                    payload: {
                      sortOrder: index + 1,
                      topic: props.data.topic,
                    },
                    // +1 means - add immediately after this topic
                  });
                  setAnchorEl(null);
                }}
              >
                <ListItemIcon>
                  <PlaylistAddIcon />
                </ListItemIcon>
                <Typography variant="inherit">Add question</Typography>
              </MenuItem>
              <Divider />
              <MenuItem
                className={classes.addQuestionMenuItem}
                onClick={() =>
                  dispatch({
                    type: EventType.DELETE_TOPIC_REQUESTED,
                    payload: data.topic.id,
                  })
                }
              >
                <ListItemIcon>
                  <DeleteRoundedIcon />
                </ListItemIcon>
                <Typography variant="inherit">Delete topic</Typography>
              </MenuItem>

              <MenuItem
                className={classes.addQuestionMenuItem}
                onClick={() =>
                  dispatch({
                    type: EventType.CREATE_TOPIC_REQUESTED,
                    payload: { sortOrder: index + 1 },
                    // +1 means - add immediately after this topic
                  })
                }
              >
                <ListItemIcon>
                  <PlaylistAddIcon />
                </ListItemIcon>
                <Typography variant="inherit">Add topic</Typography>
              </MenuItem>
            </Menu>
          </Grid>

          <Droppable droppableId={data.topic.id.toString()} type="field">
            {(provided, snapshot) => (
              <Grid
                item
                xs={12}
                ref={provided.innerRef}
                style={getListStyle(snapshot.isDraggingOver)}
                className={classes.itemContainer}
              >
                {getItems()}
                {provided.placeholder}
              </Grid>
            )}
          </Droppable>
        </Grid>
      )}
    </Draggable>
  );
}
