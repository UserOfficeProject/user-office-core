import {
  AppBar,
  Divider,
  Fade,
  Grid,
  ListItemIcon,
  makeStyles,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
  useTheme,
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import HighlightOffIcon from '@material-ui/icons/HighlightOff';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import React from 'react';
import { Droppable } from 'react-beautiful-dnd';

import {
  DataType,
  Question,
  Template,
  TemplateCategoryId,
  Topic,
} from '../../generated/sdk';
import { Event, EventType } from '../../models/QuestionaryEditorModel';
import getTemplateFieldIcon from './getTemplateFieldIcon';
import TemplateQuestionEditor, {
  TemplateTopicEditorData,
} from './TemplateQuestionEditor';

class QuestionItemAdapter implements TemplateTopicEditorData {
  constructor(public source: Question) {}

  get proposalQuestionId() {
    return this.source.proposalQuestionId;
  }
  get question() {
    return this.source.question;
  }
  get naturalKey() {
    return this.source.naturalKey;
  }
  get dataType() {
    return this.source.dataType;
  }
  get dependency() {
    return null;
  }
  get config() {
    return this.source.config;
  }
}

export const QuestionPicker = (props: IQuestionPickerProps) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = React.useState<null | SVGSVGElement>(null);
  const open = Boolean(anchorEl);
  const { dispatch, template, closeMe } = props;

  const classes = makeStyles(() => ({
    container: {
      alignItems: 'flex-start',
      alignContent: 'flex-start',
      flexBasis: '100%',
      marginRight: '10px',
      backgroundColor: theme.palette.grey[200],
      boxShadow: '5px 7px 9px -5px rgba(0,0,0,0.29)',
    },
    appbar: {
      background: 'transparent',
      boxShadow: 'none',
      paddingRight: 0,
    },
    toolbar: {
      minHeight: '36px',
      padding: '0 6px',
    },
    title: {
      flexGrow: 1,
      color: theme.palette.grey[600],
      fontWeight: 'bold',
    },
    itemContainer: {
      minHeight: '180px',
    },
    addQuestionMenuItem: {
      minHeight: 0,
    },
    toolbarButton: {
      cursor: 'pointer',
      color: theme.palette.grey[600],
    },
  }))();

  const getListStyle = (isDraggingOver: any) => ({
    background: isDraggingOver ? theme.palette.primary.light : 'transparent',
    transition: 'all 500ms cubic-bezier(0.190, 1.000, 0.220, 1.000)',
  });

  const getItems = () => {
    return template.complementaryQuestions.map((question, index) => (
      <TemplateQuestionEditor
        index={index}
        data={new QuestionItemAdapter(question)}
        onClick={item => {
          const isAltDown = (window.event as MouseEvent)?.altKey;

          if (isAltDown) {
            dispatch({
              type: EventType.CREATE_QUESTION_REL_REQUESTED,
              payload: {
                topicId: props.topic.id,
                questionId: item.proposalQuestionId,
                sortOrder: 0,
                templateId: template.templateId,
              },
            });
          } else {
            props.dispatch({
              type: EventType.OPEN_QUESTION_EDITOR,
              payload: question,
            });
          }
        }}
        key={question.proposalQuestionId.toString()}
      />
    ));
  };

  const onCreateNewQuestionClicked = (dataType: DataType) => {
    dispatch({
      type: EventType.CREATE_QUESTION_REQUESTED,
      payload: { dataType: dataType },
    });
    setAnchorEl(null);
  };

  return (
    <Grid
      container
      className={classes.container}
      id={props.id}
      data-cy="questionPicker"
    >
      <AppBar position="static" className={classes.appbar}>
        <Toolbar className={classes.toolbar}>
          <span className={classes.title}>Question drawer</span>
          <MoreVertIcon
            onClick={(event: React.MouseEvent<SVGSVGElement>) =>
              setAnchorEl(event.currentTarget)
            }
            className={classes.toolbarButton}
            data-cy="show-more-button"
          />
          <CloseIcon
            onClick={closeMe}
            className={classes.toolbarButton}
            data-cy="close-button"
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
              onClick={() => onCreateNewQuestionClicked(DataType.TEXT_INPUT)}
            >
              <ListItemIcon>
                {getTemplateFieldIcon(DataType.TEXT_INPUT)!}
              </ListItemIcon>
              <Typography variant="inherit">Add Text input</Typography>
            </MenuItem>

            <MenuItem
              className={classes.addQuestionMenuItem}
              onClick={() => onCreateNewQuestionClicked(DataType.EMBELLISHMENT)}
            >
              <ListItemIcon>
                {getTemplateFieldIcon(DataType.EMBELLISHMENT)!}
              </ListItemIcon>
              <Typography variant="inherit">Add Embellishment</Typography>
            </MenuItem>

            <MenuItem
              className={classes.addQuestionMenuItem}
              onClick={() => onCreateNewQuestionClicked(DataType.DATE)}
            >
              <ListItemIcon>
                {getTemplateFieldIcon(DataType.DATE)!}
              </ListItemIcon>
              <Typography variant="inherit">Add Date</Typography>
            </MenuItem>

            <MenuItem
              className={classes.addQuestionMenuItem}
              onClick={() => onCreateNewQuestionClicked(DataType.FILE_UPLOAD)}
            >
              <ListItemIcon>
                {getTemplateFieldIcon(DataType.FILE_UPLOAD)!}
              </ListItemIcon>
              <Typography variant="inherit">Add File upload</Typography>
            </MenuItem>

            <MenuItem
              className={classes.addQuestionMenuItem}
              onClick={() =>
                onCreateNewQuestionClicked(DataType.SELECTION_FROM_OPTIONS)
              }
            >
              <ListItemIcon>
                {getTemplateFieldIcon(DataType.SELECTION_FROM_OPTIONS)!}
              </ListItemIcon>
              <Typography variant="inherit">Add Multiple choice</Typography>
            </MenuItem>

            <MenuItem
              className={classes.addQuestionMenuItem}
              onClick={() => onCreateNewQuestionClicked(DataType.BOOLEAN)}
            >
              <ListItemIcon>
                {getTemplateFieldIcon(DataType.BOOLEAN)!}
              </ListItemIcon>
              <Typography variant="inherit">Add Boolean</Typography>
            </MenuItem>

            <MenuItem
              className={classes.addQuestionMenuItem}
              onClick={() => onCreateNewQuestionClicked(DataType.SUBTEMPLATE)}
              disabled={
                template.categoryId !== TemplateCategoryId.PROPOSAL_QUESTIONARY
              }
            >
              <ListItemIcon>
                {getTemplateFieldIcon(DataType.SUBTEMPLATE)!}
              </ListItemIcon>
              <Typography variant="inherit">Add Subtemplate</Typography>
            </MenuItem>

            <Divider />

            <MenuItem className={classes.addQuestionMenuItem} onClick={closeMe}>
              <ListItemIcon>
                <HighlightOffIcon />
              </ListItemIcon>
              <Typography variant="inherit">Close</Typography>
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Droppable droppableId="questionPicker" type="field">
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
  );
};

interface IQuestionPickerProps {
  topic: Topic;
  template: Template;
  dispatch: React.Dispatch<Event>;
  closeMe: () => void;
  id?: string;
}
