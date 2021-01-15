import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import makeStyles from '@material-ui/core/styles/makeStyles';
import AddOutlinedIcon from '@material-ui/icons/AddOutlined';
import React from 'react';

import { QuestionnairesListItem } from './QuestionnairesListItem';

export interface QuestionnairesListRow {
  id: number;
  label: string;
}
export interface QuestionnairesListProps {
  onAddNewClick?: () => void;
  onDeleteClick?: (record: QuestionnairesListRow) => void;
  onEditClick?: (record: QuestionnairesListRow) => void;
  onCloneClick?: (record: QuestionnairesListRow) => void;
  data: Array<QuestionnairesListRow>;
  addButtonLabel?: string;
}

const useStyles = makeStyles(() => ({
  questionnairesList: {
    maxWidth: '440px',
    padding: 0,
    marginBottom: 0,
    '& li': {
      paddingLeft: 0,
      paddingRight: 0,
    },
  },
}));

export function QuestionnairesList(props: QuestionnairesListProps) {
  const classes = useStyles();

  return (
    <List component="ul" className={classes.questionnairesList}>
      {props.data.map(record => {
        return (
          <QuestionnairesListItem
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
