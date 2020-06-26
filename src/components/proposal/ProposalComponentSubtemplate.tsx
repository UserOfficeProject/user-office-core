import {
  Avatar,
  Button,
  FormControl,
  FormLabel,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemSecondaryAction,
  ListItemText,
  makeStyles,
} from '@material-ui/core';
import AddOutlinedIcon from '@material-ui/icons/AddOutlined';
import DeleteIcon from '@material-ui/icons/Delete';
import DescriptionIcon from '@material-ui/icons/Description';
import { useSnackbar } from 'notistack';
import React, { useEffect, useState } from 'react';

import { Questionary, SubtemplateConfig } from '../../generated/sdk';
import { useDataApi } from '../../hooks/useDataApi';
import { stringToNumericArray } from '../../utils/ArrayUtils';
import { SubquestionarySubmissionContainer } from '../questionary/SubquestionarySubmissionContainer';
import ModalWrapper from '../common/ModalWrapper';
import { BasicComponentProps } from './IBasicComponentProps';
import { ProposalErrorLabel } from './ProposalErrorLabel';

function QuestionariesListItem(props: {
  questionaryId: number;
  questionaryIdx: number;
  onEditClick: (questionaryId: number) => void;
  onDeleteClick: (questionaryId: number) => void;
}) {
  return (
    <ListItem button>
      <ListItemAvatar>
        <Avatar>
          <DescriptionIcon />
        </Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={`Sample ${props.questionaryIdx}`}
        onClick={() => props.onEditClick(props.questionaryId)}
      />
      <ListItemSecondaryAction>
        <IconButton
          edge="end"
          aria-label="delete"
          onClick={() => props.onDeleteClick(props.questionaryId)}
        >
          <DeleteIcon />
        </IconButton>
      </ListItemSecondaryAction>
    </ListItem>
  );
}

function QuestionariesList(props: {
  questionariesIds: number[];
  onAddNewClick: () => void;
  onDeleteClick: (questionaryId: number) => void;
  onEditClick: (questionaryId: number) => void;
  addButtonLabel?: string;
}) {
  const classes = makeStyles(() => ({
    questionariesList: {
      maxWidth: '300px',
      listStyle: 'none',
      padding: 0,
      marginBottom: 0,
      '& li': {
        paddingLeft: 0,
      },
    },
  }))();

  return (
    <List component="ul" className={classes.questionariesList}>
      {props.questionariesIds.map((questionaryId, idx) => {
        return (
          <QuestionariesListItem
            questionaryId={questionaryId}
            questionaryIdx={idx + 1}
            onEditClick={id => props.onEditClick(id)}
            onDeleteClick={id => props.onDeleteClick(id)}
            key={questionaryId}
          />
        );
      })}
      <ListItem key="addNew">
        <Button
          onClick={props.onAddNewClick}
          color="primary"
          variant="outlined"
          fullWidth
          startIcon={<AddOutlinedIcon />}
        >
          {props.addButtonLabel || 'Add'}
        </Button>
      </ListItem>
    </List>
  );
}

export function ProposalComponentSubtemplate(props: BasicComponentProps) {
  const {
    templateField,
    templateField: {
      question: { proposalQuestionId },
    },
    errors,
    onComplete,
  } = props;

  const config = templateField.config as SubtemplateConfig;
  const isError = errors[proposalQuestionId] ? true : false;

  const [stateValue, setStateValue] = useState<Array<number>>([]);
  const [
    selectedQuestionary,
    setSelectedQuestionary,
  ] = useState<Questionary | null>(null);

  const api = useDataApi();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    const newValue = templateField.value;
    if (Array.isArray(newValue)) {
      setStateValue(newValue);
    } else if (typeof newValue === 'string') {
      setStateValue(stringToNumericArray(newValue));
    } else {
      console.error(
        'Invalid datatype for ProposalComponentSubtemplate. Expected array or string'
      );
    }
  }, [templateField]);

  return (
    <>
      <FormControl
        style={{ padding: '20px 0' }}
        error={isError}
        required={config.required}
        fullWidth
      >
        <FormLabel error={isError} style={{ padding: '10px 0' }}>
          {templateField.question.question}
        </FormLabel>
        <span>{config.small_label}</span>

        <QuestionariesList
          questionariesIds={stateValue}
          addButtonLabel={config.addEntryButtonLabel}
          onEditClick={questionaryId =>
            api()
              .getQuestionary({ questionaryId })
              .then(response => {
                if (!response.questionary) {
                  enqueueSnackbar(
                    'Error occurred while retrieving questionary',
                    {
                      variant: 'error',
                    }
                  );

                  return;
                }
                setSelectedQuestionary(response.questionary);
              })
          }
          onDeleteClick={id =>
            // TODO make an API call deleteQuestionary()
            {
              const newValue = stateValue.slice();
              newValue.splice(
                newValue.findIndex(item => item === id),
                1
              );
              setStateValue(newValue);
              onComplete(null as any, newValue.join(',')); // convert [1,2,3,...] to "1,2,3,..." because GraphQL does not support arrays yet
            }
          }
          onAddNewClick={() =>
            api()
              .createQuestionary({ templateId: config.templateId })
              .then(response => {
                if (response.createQuestionary.error) {
                  enqueueSnackbar(response.createQuestionary.error, {
                    variant: 'error',
                  });

                  return;
                }
                const newQuestionaryId =
                  response.createQuestionary.questionary?.questionaryId;
                if (newQuestionaryId) {
                  const newValue = stateValue.slice();
                  newValue.push(newQuestionaryId);
                  setStateValue(newValue);

                  onComplete(null as any, newValue.join(','));
                }
              })
          }
        />
        {isError && (
          <ProposalErrorLabel>{errors[proposalQuestionId]}</ProposalErrorLabel>
        )}
      </FormControl>

      <ModalWrapper
        closeMe={() => setSelectedQuestionary(null)}
        isOpen={selectedQuestionary !== null}
      >
        <SubquestionarySubmissionContainer
          questionaryEditDone={() => setSelectedQuestionary(null)}
          questionary={selectedQuestionary!}
          title={templateField.question.question}
        />
      </ModalWrapper>
    </>
  );
}
