import Avatar from '@material-ui/core/Avatar';
import IconButton from '@material-ui/core/IconButton';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import DeleteIcon from '@material-ui/icons/Delete';
import DescriptionIcon from '@material-ui/icons/Description';
import FileCopy from '@material-ui/icons/FileCopy';
import React from 'react';

import { QuestionnairesListRow } from './QuestionnairesList';
export function QuestionariesListItem(props: {
  record: QuestionnairesListRow;
  onEditClick: (record: QuestionnairesListRow) => void;
  onDeleteClick: (record: QuestionnairesListRow) => void;
  onCloneClick: (record: QuestionnairesListRow) => void;
}) {
  return (
    <ListItem
      button
      onClick={() => props.onEditClick(props.record)}
      data-cy="questionaries-list-item"
    >
      <ListItemAvatar>
        <Avatar>
          <DescriptionIcon
            color={props.record.isCompleted ? undefined : 'error'}
          />
        </Avatar>
      </ListItemAvatar>
      <ListItemText primary={props.record.label} />
      <ListItemSecondaryAction>
        <IconButton
          edge="end"
          aria-label="clone"
          data-cy="clone"
          onClick={() => props.onCloneClick(props.record)}
        >
          <FileCopy />
        </IconButton>
        <IconButton
          edge="end"
          aria-label="delete"
          data-cy="delete"
          onClick={() => props.onDeleteClick(props.record)}
        >
          <DeleteIcon />
        </IconButton>
      </ListItemSecondaryAction>
    </ListItem>
  );
}
