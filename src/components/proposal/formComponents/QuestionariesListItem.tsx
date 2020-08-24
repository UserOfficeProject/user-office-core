import {
  Avatar,
  IconButton,
  ListItem,
  ListItemAvatar,
  ListItemSecondaryAction,
  ListItemText,
} from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import DescriptionIcon from '@material-ui/icons/Description';
import React from 'react';

import { QuestionariesListRow } from './QuestionariesList';
export function QuestionariesListItem(props: {
  record: QuestionariesListRow;
  onEditClick: (record: QuestionariesListRow) => void;
  onDeleteClick: (record: QuestionariesListRow) => void;
}) {
  return (
    <ListItem button onClick={() => props.onEditClick(props.record)}>
      <ListItemAvatar>
        <Avatar>
          <DescriptionIcon />
        </Avatar>
      </ListItemAvatar>
      <ListItemText primary={props.record.label} />
      <ListItemSecondaryAction>
        <IconButton
          edge="end"
          aria-label="delete"
          onClick={() => props.onDeleteClick(props.record)}
        >
          <DeleteIcon />
        </IconButton>
      </ListItemSecondaryAction>
    </ListItem>
  );
}
