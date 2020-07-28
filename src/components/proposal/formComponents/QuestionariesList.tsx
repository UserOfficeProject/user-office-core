import { Button, List, ListItem, makeStyles } from '@material-ui/core';
import AddOutlinedIcon from '@material-ui/icons/AddOutlined';
import React from 'react';

import { QuestionariesListItem } from './QuestionariesListItem';

export interface QuestionariesListRow {
  id: number;
  label: string;
}
export interface QuestionariesListProps {
  onAddNewClick: () => void;
  onDeleteClick: (record: QuestionariesListRow) => void;
  onEditClick: (record: QuestionariesListRow) => void;
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
            onEditClick={record => props.onEditClick(record)}
            onDeleteClick={record => props.onDeleteClick(record)}
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
        >
          {props.addButtonLabel || 'Add'}
        </Button>
      </ListItem>
    </List>
  );
}
