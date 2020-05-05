import {
  Fade,
  Grid,
  ListItemIcon,
  makeStyles,
  Menu,
  MenuItem,
  Typography,
  useTheme,
  Divider,
} from '@material-ui/core';
import HighlightOffIcon from '@material-ui/icons/HighlightOff';
import MoreHorizIcon from '@material-ui/icons/MoreHoriz';
import React from 'react';
import { Droppable } from 'react-beautiful-dnd';

import { DataType, ProposalTemplate, Question } from '../../generated/sdk';
import { Event, EventType } from '../../models/QuestionaryEditorModel';
import getTemplateFieldIcon from './getTemplateFieldIcon';
import QuestionaryEditorTopicItem, {
  IQuestionaryEditorTopicData,
} from './QuestionaryEditorTopicItem';

class QuestionItemAdapter implements IQuestionaryEditorTopicData {
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
    return undefined;
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
      background: '#DDD',
      flexBasis: '100%',
    },
    itemContainer: {
      minHeight: '180px',
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
  }))();

  const getListStyle = (isDraggingOver: any) => ({
    background: isDraggingOver
      ? theme.palette.primary.light
      : theme.palette.grey[100],
    transition: 'all 500ms cubic-bezier(0.190, 1.000, 0.220, 1.000)',
  });

  const getItems = () => {
    return template.complementaryQuestions.map((question, index) => (
      <QuestionaryEditorTopicItem
        index={index}
        data={new QuestionItemAdapter(question)}
        onClick={item => {}}
        key={question.proposalQuestionId.toString()}
      />
    ));
  };

  const onCreateNewQuestionClicked = (dataType: DataType) => {
    dispatch({
      type: EventType.CREATE_NEW_QUESTION_REQUESTED,
      payload: { dataType: dataType },
    });
    setAnchorEl(null);
  };

  return (
    <Grid container className={classes.container}>
      <Grid item xs={10}>
        Question drawer
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
            <ListItemIcon>{getTemplateFieldIcon(DataType.DATE)!}</ListItemIcon>
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

          <Divider />

          <MenuItem className={classes.addQuestionMenuItem} onClick={closeMe}>
            <ListItemIcon>
              <HighlightOffIcon />
            </ListItemIcon>
            <Typography variant="inherit">Close</Typography>
          </MenuItem>
        </Menu>
      </Grid>
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
  template: ProposalTemplate;
  dispatch: React.Dispatch<Event>;
  closeMe: () => void;
}
