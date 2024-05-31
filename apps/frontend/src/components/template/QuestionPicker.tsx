import { Droppable } from '@hello-pangea/dnd';
import CloseIcon from '@mui/icons-material/Close';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Search from '@mui/icons-material/Search';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import Divider from '@mui/material/Divider';
import Fade from '@mui/material/Fade';
import Grid from '@mui/material/Grid';
import ListItemIcon from '@mui/material/ListItemIcon';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { useTheme } from '@mui/material/styles';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import React, { useState } from 'react';

import {
  getQuestionaryComponentDefinition,
  getQuestionaryComponentDefinitions,
  getTemplateFieldIcon,
} from 'components/questionary/QuestionaryComponentRegistry';
import {
  DataType,
  DependenciesLogicOperator,
  Question,
  Template,
  TemplateGroupId,
  Topic,
} from 'generated/sdk';
import { Event, EventType } from 'models/questionary/QuestionaryEditorModel';

import QuestionPickerFilter from './QuestionPickerFilter';
import TemplateQuestionEditor, {
  TemplateTopicEditorData,
} from './TemplateQuestionEditor';

class QuestionItemAdapter implements TemplateTopicEditorData {
  constructor(public source: Question) {}

  get id() {
    return this.source.id;
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
  get dependencies() {
    return [];
  }
  get config() {
    return this.source.config;
  }
  get dependenciesOperator() {
    return DependenciesLogicOperator.AND;
  }
  get categoryId() {
    return this.source.categoryId;
  }
}

export interface QuestionFilter {
  searchText: string;
  dataType: DataType | 'all';
}

export const QuestionPicker = (props: QuestionPickerProps) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = React.useState<null | SVGSVGElement>(null);
  const open = Boolean(anchorEl);
  const { dispatch, template, closeMe } = props;
  const isExtraLargeScreen = useMediaQuery(theme.breakpoints.up('xl'));
  const [questionFilter, setQuestionFilter] = useState<QuestionFilter | null>(
    null
  );
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const getListStyle = (isDraggingOver: boolean) => ({
    background: isDraggingOver ? theme.palette.primary.light : 'transparent',
    transition: 'all 500ms cubic-bezier(0.190, 1.000, 0.220, 1.000)',
  });

  const isQuestionMatchingFilter = (question: Question) => {
    if (!questionFilter) {
      return true;
    }

    const textMatch = question.question
      .toLowerCase()
      .includes(questionFilter.searchText.toLowerCase());

    const dataTypeMatch =
      questionFilter.dataType === 'all'
        ? true
        : question.dataType === questionFilter.dataType;

    return textMatch && dataTypeMatch;
  };

  const getItems = () =>
    template.complementaryQuestions
      .filter(isQuestionMatchingFilter)
      .filter(
        (question) =>
          getQuestionaryComponentDefinition(question.dataType).creatable
      )
      .map((question, index) => (
        <TemplateQuestionEditor
          index={index}
          data={new QuestionItemAdapter(question)}
          dispatch={dispatch}
          onClick={(item) => {
            const isAltDown = (window.event as MouseEvent)?.altKey;

            // NOTE: sortOrder is always 0 because we add at that position using alt key and after that you can reorder if you want.
            if (isAltDown) {
              dispatch({
                type: EventType.CREATE_QUESTION_REL_REQUESTED,
                payload: {
                  topicId: props.topic.id,
                  questionId: item.id,
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
          key={question.id.toString()}
        />
      ));

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
      sx={{
        alignItems: 'flex-start',
        alignContent: 'flex-start',
        flexBasis: '100%',
        marginRight: '10px',
        backgroundColor: theme.palette.grey[200],
        boxShadow: '5px 7px 9px -5px rgba(0,0,0,0.29)',
        position: 'sticky',
        top: 0,
        borderLeft: `2px solid ${theme.palette.grey[200]}`,
      }}
      id={props.id}
      data-cy="questionPicker"
    >
      <AppBar
        position="static"
        sx={{ background: 'transparent', boxShadow: 'none', paddingRight: 0 }}
      >
        <Toolbar sx={{ minHeight: '36px', padding: '0 6px' }}>
          <Box
            sx={{
              flexGrow: 1,
              color: theme.palette.grey[600],
              fontWeight: 'bold',
            }}
          >
            Question drawer
          </Box>
          <Search
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            sx={{
              cursor: 'pointer',
              color: theme.palette.grey[600],
              ...(isFilterOpen && { color: theme.palette.primary.main }),
            }}
            data-cy="search-button"
          />
          <MoreVertIcon
            onClick={(event: React.MouseEvent<SVGSVGElement>) =>
              setAnchorEl(event.currentTarget)
            }
            sx={{ cursor: 'pointer', color: theme.palette.grey[600] }}
            data-cy="show-more-button"
          />
          <CloseIcon
            onClick={closeMe}
            sx={{ cursor: 'pointer', color: theme.palette.grey[600] }}
            data-cy="close-button"
          />
          <Menu
            anchorEl={anchorEl}
            keepMounted
            open={open}
            onClose={() => setAnchorEl(null)}
            TransitionComponent={Fade}
          >
            {getQuestionaryComponentDefinitions()
              .filter((definition) => definition.creatable)
              .map((definition) => {
                return (
                  <MenuItem
                    sx={{
                      minHeight: 0,
                    }}
                    onClick={() =>
                      onCreateNewQuestionClicked(definition.dataType)
                    }
                    disabled={
                      (definition.dataType === DataType.SAMPLE_DECLARATION ||
                        definition.dataType === DataType.GENERIC_TEMPLATE) &&
                      template.groupId !== TemplateGroupId.PROPOSAL
                    }
                    key={definition.dataType}
                  >
                    <ListItemIcon>
                      {getTemplateFieldIcon(definition.dataType)}
                    </ListItemIcon>
                    <Typography variant="inherit">{`Add ${definition.name}`}</Typography>
                  </MenuItem>
                );
              })}
            <Divider />
            <MenuItem sx={{ minHeight: 0 }} onClick={closeMe}>
              <ListItemIcon>
                <HighlightOffIcon />
              </ListItemIcon>
              <Typography variant="inherit">Close</Typography>
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Collapse in={isFilterOpen} sx={{ width: '100%' }} unmountOnExit>
        <QuestionPickerFilter onChange={setQuestionFilter} />
      </Collapse>
      <Droppable droppableId="questionPicker" type="field">
        {(provided, snapshot) => (
          <Grid
            item
            xs={12}
            ref={provided.innerRef}
            className="tinyScroll"
            sx={{
              minHeight: '180px',
              maxHeight: isExtraLargeScreen ? '1240px' : '660px',
              overflowY: 'auto',
              overflowX: 'hidden',
            }}
            style={getListStyle(snapshot.isDraggingOver)}
            data-cy="question-list"
          >
            {getItems()}
            {provided.placeholder}
          </Grid>
        )}
      </Droppable>
    </Grid>
  );
};

interface QuestionPickerProps {
  topic: Topic;
  template: Template;
  dispatch: React.Dispatch<Event>;
  closeMe: () => void;
  id?: string;
}
