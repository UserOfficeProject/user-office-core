import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import makeStyles from '@material-ui/core/styles/makeStyles';
import AddOutlinedIcon from '@material-ui/icons/AddOutlined';
import React from 'react';

import { QuestionariesListItem } from './QuestionariesListItem';

export interface QuestionariesListRow {
  id: number;
  label: string;
}
export interface QuestionariesListProps {
  onAddNewClick?: () => void;
  onDeleteClick?: (record: QuestionariesListRow) => void;
  onEditClick?: (record: QuestionariesListRow) => void;
  onCloneClick?: (record: QuestionariesListRow) => void;
  data: Array<QuestionariesListRow>;
  addButtonLabel?: string;
}

const useStyles = makeStyles(() => ({
  questionariesList: {
    maxWidth: '300px',
    listStyle: 'none',
    padding: 0,
    marginBottom: 0,
    '& li': {
      paddingLeft: 0,
    },
  },
}));
export function QuestionariesList(props: QuestionariesListProps) {
  const classes = useStyles();

  return (
    <List component="ul" className={classes.questionariesList}>
      {props.data.map(record => {
        return (
          <QuestionariesListItem
            record={record}
            onEditClick={record => props.onEditClick?.(record)}
            onDeleteClick={record => props.onDeleteClick?.(record)}
            onCloneClick={record => props.onCloneClick?.(record)}
            key={record.id}
          />
        );
      })}
      <ListItem key="add-new">
        <Button
          onClick={props.onAddNewClick}
          color="primary"
          variant="outlined"
          fullWidth
          startIcon={<AddOutlinedIcon />}
          data-cy="add-button"
        >
          {props.addButtonLabel || 'Add'}
        </Button>
      </ListItem>
    </List>
  );
}
