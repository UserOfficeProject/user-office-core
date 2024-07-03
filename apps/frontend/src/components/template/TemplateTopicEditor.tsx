import {
  Draggable,
  DraggingStyle,
  Droppable,
  NotDraggingStyle,
} from '@hello-pangea/dnd';
import { Check } from '@mui/icons-material';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import EditIcon from '@mui/icons-material/Edit';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Fade from '@mui/material/Fade';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { useTheme } from '@mui/material/styles';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { Field, Form, Formik } from 'formik';
import { useSnackbar } from 'notistack';
import React, { useState } from 'react';
import * as Yup from 'yup';

import TextField from 'components/common/FormikUITextField';
import { getQuestionaryComponentDefinition } from 'components/questionary/QuestionaryComponentRegistry';
import {
  DependenciesLogicOperator,
  QuestionTemplateRelation,
  TemplateStep,
} from 'generated/sdk';
import { Event, EventType } from 'models/questionary/QuestionaryEditorModel';

import TemplateQuestionEditor, {
  TemplateTopicEditorData,
} from './TemplateQuestionEditor';

class TemplateTopicEditor implements TemplateTopicEditorData {
  constructor(public source: QuestionTemplateRelation) {}

  get id() {
    return this.source.question.id;
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
  get dependencies() {
    return this.source.dependencies;
  }
  get dependenciesOperator() {
    return this.source.dependenciesOperator as DependenciesLogicOperator;
  }
  get config() {
    return this.source.config;
  }
  get categoryId() {
    return this.source.question.categoryId;
  }
}

export default function QuestionaryEditorTopic(props: {
  data: TemplateStep;
  dispatch: React.Dispatch<Event>;
  index: number;
  dragMode: boolean;
  hoveredDependency: string;
}) {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();

  const { data, dispatch, index } = props;
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [anchorEl, setAnchorEl] = React.useState<null | SVGSVGElement>(null);
  const open = Boolean(anchorEl);

  const getListStyle = (isDraggingOver: boolean) => ({
    background: isDraggingOver
      ? theme.palette.primary.light
      : theme.palette.grey[100],
    transition: 'all 500ms cubic-bezier(0.190, 1.000, 0.220, 1.000)',
  });

  const getItemStyle = (
    draggableStyle: DraggingStyle | NotDraggingStyle | undefined
  ) => ({
    background: '#FFF',
    ...draggableStyle,
  });

  const titleJsx = (
    <Formik
      initialValues={{ title: data.topic.title }}
      validationSchema={Yup.object().shape({
        title: Yup.string().min(1),
      })}
      onSubmit={async (values): Promise<void> => {
        dispatch({
          type: EventType.UPDATE_TOPIC_TITLE_REQUESTED,
          payload: {
            topicId: data.topic.id,
            title: values.title,
            sortOrder: data.topic.sortOrder,
          },
        });
        setIsEditMode(false);
      }}
    >
      {({ isSubmitting, handleChange, values }) => (
        <Form>
          {isEditMode ? (
            <div style={{ display: 'flex' }}>
              <label htmlFor="title" hidden>
                Topic title
              </label>
              <Field
                name="title"
                id="title"
                type="text"
                inputProps={{ maxLength: '32' }}
                component={TextField}
                sx={{ margin: '3px 8px', flex: 1 }}
                value={values.title}
                onChange={handleChange}
                data-cy="topic-title-input"
                required
                autoFocus
                onBlur={() => {
                  setIsEditMode(false);
                  dispatch({
                    type: EventType.UPDATE_TOPIC_TITLE_REQUESTED,
                    payload: {
                      topicId: data.topic.id,
                      title: values.title,
                      sortOrder: data.topic.sortOrder,
                    },
                  });
                }}
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === 'Enter') {
                    e.currentTarget.blur();
                  }
                }}
              />
              <IconButton
                disabled={isSubmitting}
                type="submit"
                sx={{ padding: '3px' }}
                data-cy="topic-title-update"
              >
                <Check />
              </IconButton>
            </div>
          ) : (
            <Box
              sx={{
                display: 'flex',
                padding: theme.spacing(1),
                cursor: 'pointer',
                position: 'relative',

                '& > svg': {
                  right: -16,
                  color: 'transparent',
                  transition: '300ms',
                  position: 'absolute',
                },
                '& span': {
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                },
                '&:hover': {
                  '& > svg': {
                    right: 0,
                    color: theme.palette.grey[600],
                  },
                  '& span': {
                    marginRight: theme.spacing(2),
                    transition: '100ms',
                  },
                },
              }}
              onClick={() => {
                setIsEditMode(true);
              }}
            >
              <span data-cy="topic-title">{values.title}</span>
              <EditIcon fontSize="small" data-cy="topic-title-edit" />
            </Box>
          )}
        </Form>
      )}
    </Formik>
  );

  const getItems = () => {
    if (props.dragMode) {
      return null;
    } else {
      return data.fields.map((item, index) => (
        <TemplateQuestionEditor
          index={index}
          data={new TemplateTopicEditor(item)}
          isHighlighted={props.hoveredDependency === item.question.id}
          dispatch={dispatch}
          onClick={(item) =>
            dispatch({
              type: EventType.OPEN_QUESTIONREL_EDITOR,
              payload: { questionId: item.id },
            })
          }
          key={item.question.id.toString()}
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
      {(provided) => (
        <Grid
          container
          sx={{
            alignItems: 'flex-start',
            alignContent: 'flex-start',
            background: '#FFF',
            flexBasis: '100%',
            height: '100%',
            minWidth: '220px',
            overflow: 'hidden',
            ...(props.dragMode && {
              borderColor: theme.palette.grey[400],
              padding: '5px',
              borderWidth: '1px',
              borderStyle: 'dashed',
            }),
          }}
          {...provided.draggableProps}
          ref={provided.innerRef}
          style={getItemStyle(provided.draggableProps.style)}
          {...provided.dragHandleProps}
        >
          <Grid item xs={12}>
            <AppBar
              position="static"
              sx={{
                background: 'transparent',
                boxShadow: 'none',
                paddingRight: 0,
              }}
            >
              <Toolbar
                sx={{
                  display: 'flex',
                  minHeight: '36px',
                  padding: '0 6px 0 0',
                  width: '100%',
                }}
              >
                <Box
                  sx={{
                    fontSize: '1rem',
                    color: theme.palette.grey[900],
                    overflow: 'hidden',
                    flex: 1,
                  }}
                >
                  {titleJsx}
                </Box>
                <Box sx={{ textAlign: 'right', paddingRight: '8px' }}>
                  <MoreVertIcon
                    onClick={(event: React.MouseEvent<SVGSVGElement>) =>
                      setAnchorEl(event.currentTarget)
                    }
                    sx={{ cursor: 'pointer', color: theme.palette.grey[600] }}
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
                      data-cy="add-question-menu-item"
                      sx={{ minHeight: 0 }}
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
                      sx={{ minHeight: 0 }}
                      data-cy="delete-topic-menu-item"
                      onClick={() => {
                        const isAllQuestionsInTopicDeletable =
                          data.fields.every((item) => {
                            const definition =
                              getQuestionaryComponentDefinition(
                                item.question.dataType
                              );

                            return definition.creatable;
                          });
                        if (isAllQuestionsInTopicDeletable === false) {
                          enqueueSnackbar(
                            'This topic can not be deleted because it contains protected question(s)',
                            {
                              variant: 'warning',
                            }
                          );

                          return;
                        }

                        dispatch({
                          type: EventType.DELETE_TOPIC_REQUESTED,
                          payload: data.topic.id,
                        });
                        setAnchorEl(null);
                      }}
                    >
                      <ListItemIcon>
                        <DeleteRoundedIcon />
                      </ListItemIcon>
                      <Typography variant="inherit">Delete topic</Typography>
                    </MenuItem>

                    <MenuItem
                      sx={{ minHeight: 0 }}
                      data-cy="add-topic-menu-item"
                      onClick={() => {
                        dispatch({
                          type: EventType.CREATE_TOPIC_REQUESTED,
                          payload: {
                            topicId: data.topic.id,
                            isFirstTopic: false,
                          },
                        });
                        setAnchorEl(null);
                      }}
                    >
                      <ListItemIcon>
                        <PlaylistAddIcon />
                      </ListItemIcon>
                      <Typography variant="inherit">Add topic</Typography>
                    </MenuItem>
                  </Menu>
                </Box>
              </Toolbar>
            </AppBar>
          </Grid>
          <Droppable droppableId={data.topic.id.toString()} type="field">
            {(provided, snapshot) => (
              <Grid
                item
                xs={12}
                ref={provided.innerRef}
                style={getListStyle(snapshot.isDraggingOver)}
                sx={{
                  minHeight: '180px',
                  height: 'calc(100% - 36px)',
                  padding: '1px',
                }}
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
