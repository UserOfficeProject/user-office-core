import {
  Button,
  FormControl,
  FormLabel,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  makeStyles,
  ListItemAvatar,
  Avatar,
} from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import DescriptionIcon from '@material-ui/icons/Description';
import React, { useEffect, useState } from 'react';
import { SubtemplateConfig } from '../../generated/sdk';
import { useDataApi } from '../../hooks/useDataApi';
import { BasicComponentProps } from './IBasicComponentProps';
import { ProposalErrorLabel } from './ProposalErrorLabel';
import { useSnackbar } from 'notistack';

export function ProposalComponentSubtemplate(props: BasicComponentProps) {
  const api = useDataApi();
  const { enqueueSnackbar } = useSnackbar();
  const classes = makeStyles(() => ({
    list: {
      listStyle: 'none',
      padding: 0,
      marginBottom: 0,
      '& li': {
        paddingLeft: 0,
      },
    },
    formControl: {
      maxWidth: 300,
    },
  }))();
  const {
    templateField,
    templateField: {
      question: { proposalQuestionId },
    },
    errors,
    onComplete,
  } = props;
  const isError = errors[proposalQuestionId] ? true : false;
  const config = templateField.config as SubtemplateConfig;
  const [stateValue, setStateValue] = useState<Array<number>>([]);

  function stringToNumericArray(value: any): Array<number> {
    return value
      .split(',')
      .map((str: string) => parseInt(str))
      .filter((maybeNumber: any) => Number.isNaN(maybeNumber) === false);
  }

  useEffect(() => {
    const newValue = templateField.value;
    if (Array.isArray(newValue)) {
      setStateValue(newValue);
    }
    if (typeof newValue === 'string') {
      setStateValue(stringToNumericArray(newValue));
    }
  }, [templateField]);

  return (
    <FormControl
      className={classes.formControl}
      error={isError}
      required={config.required ? true : false}
      fullWidth
    >
      <FormLabel error={isError}>{templateField.question.question}</FormLabel>
      <span>{config.small_label}</span>

      <List component="ul" className={classes.list}>
        {stateValue.map &&
          stateValue.map((questionaryId, idx) => {
            return (
              <QuestionaryEntry
                questionaryId={questionaryId}
                questionaryIdx={idx + 1}
                onEditClick={questionaryId => console.log(questionaryId)}
                onDeleteClick={questionaryId => console.log(questionaryId)}
              />
            );
          })}
        <ListItem key="addNew">
          <Button
            onClick={() =>
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

                    onComplete(null as any, newValue);
                  }
                })
            }
          >
            {config.addEntryButtonLabel}
          </Button>
        </ListItem>
      </List>
      {isError && (
        <ProposalErrorLabel>{errors[proposalQuestionId]}</ProposalErrorLabel>
      )}
    </FormControl>
  );
}

function QuestionaryEntry(props: {
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
