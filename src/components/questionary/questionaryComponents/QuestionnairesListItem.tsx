import Avatar from '@material-ui/core/Avatar';
import IconButton from '@material-ui/core/IconButton';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Tooltip from '@material-ui/core/Tooltip';
import DeleteIcon from '@material-ui/icons/Delete';
import DescriptionIcon from '@material-ui/icons/Description';
import FileCopy from '@material-ui/icons/FileCopy';
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

export function QuestionnairesListItem(props: {
  record: QuestionnairesListRow;
  onEditClick: (record: QuestionnairesListRow) => void;
  onDeleteClick: (record: QuestionnairesListRow) => void;
  onCloneClick: (record: QuestionnairesListRow) => void;
}) {
  const classes = useStyles();

  return (
    <ListItem
      button
      onClick={() => props.onEditClick(props.record)}
      data-cy="questionnaires-list-item"
    >
      <ListItemAvatar>
        <Avatar>
          <DescriptionIcon
            color={props.record.isCompleted ? undefined : 'error'}
            data-cy={`questionnaires-list-item-completed:${props.record.isCompleted}`}
          />
        </Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={
          <Tooltip
            title={props.record.label}
            enterDelay={500}
            enterNextDelay={500}
          >
            <div>{props.record.label}</div>
          </Tooltip>
        }
        className={classes.text}
      />
      <ListItemIcon className={`${classes.icon} ${classes.iconPadding}`}>
        <IconButton
          edge="start"
          aria-label="clone"
          data-cy="clone"
          onClick={(e: MouseEvent) => {
            e.stopPropagation();
            props.onCloneClick(props.record);
          }}
        >
          <FileCopy />
        </IconButton>
      </ListItemIcon>
      <ListItemIcon className={classes.icon}>
        <IconButton
          edge="end"
          aria-label="delete"
          data-cy="delete"
          onClick={(e: MouseEvent) => {
            e.stopPropagation();
            props.onDeleteClick(props.record);
          }}
        >
          <DeleteIcon />
        </IconButton>
      </ListItemIcon>
    </ListItem>
  );
}
