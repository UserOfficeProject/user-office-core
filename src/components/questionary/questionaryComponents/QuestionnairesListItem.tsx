import DeleteIcon from '@mui/icons-material/Delete';
import DescriptionIcon from '@mui/icons-material/Description';
import FileCopy from '@mui/icons-material/FileCopy';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Tooltip from '@mui/material/Tooltip';
import makeStyles from '@mui/styles/makeStyles';
import React, { MouseEvent } from 'react';

import { QuestionnairesListRow } from './QuestionnairesList';

const useStyles = makeStyles((theme) => ({
  text: {
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
  },
  icon: {
    maxWidth: 'unset',
  },
  iconPadding: {
    paddingLeft: theme.spacing(2),
  },
}));

interface QuestionnairesListProps {
  record: QuestionnairesListRow;
  onDeleteClick?: (record: QuestionnairesListRow) => void;
  onEditClick?: (record: QuestionnairesListRow) => void;
  onCloneClick?: (record: QuestionnairesListRow) => void;
}

export function QuestionnairesListItem({
  record,
  onEditClick,
  onDeleteClick,
  onCloneClick,
}: QuestionnairesListProps) {
  const classes = useStyles();

  return (
    <ListItem
      button
      onClick={() => onEditClick?.(record)}
      data-cy="questionnaires-list-item"
    >
      <ListItemAvatar>
        <Avatar>
          <DescriptionIcon
            color={record.isCompleted ? undefined : 'error'}
            data-cy={`questionnaires-list-item-completed:${record.isCompleted}`}
          />
        </Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={
          <Tooltip title={record.label} enterDelay={500} enterNextDelay={500}>
            <div>{record.label}</div>
          </Tooltip>
        }
        className={classes.text}
      />
      {onCloneClick && (
        <ListItemIcon className={`${classes.icon} ${classes.iconPadding}`}>
          <IconButton
            edge="start"
            aria-label="clone"
            data-cy="clone"
            title="Copy"
            onClick={(e: MouseEvent) => {
              e.stopPropagation();
              onCloneClick(record);
            }}
          >
            <FileCopy />
          </IconButton>
        </ListItemIcon>
      )}

      {onDeleteClick && (
        <ListItemIcon className={classes.icon}>
          <IconButton
            edge="end"
            aria-label="delete"
            data-cy="delete"
            title="Remove"
            onClick={(e: MouseEvent) => {
              e.stopPropagation();
              onDeleteClick(record);
            }}
          >
            <DeleteIcon />
          </IconButton>
        </ListItemIcon>
      )}
    </ListItem>
  );
}
