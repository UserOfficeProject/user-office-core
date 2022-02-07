import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import makeStyles from '@material-ui/core/styles/makeStyles';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import React from 'react';

import { ButtonContainer } from 'styles/StyledComponents';

import { QuestionnairesListItem } from './QuestionnairesListItem';

export interface QuestionnairesListRow {
  id: number;
  label: string;
  isCompleted: boolean;
}
export interface QuestionnairesListProps {
  onAddNewClick?: () => void;
  onDeleteClick?: (record: QuestionnairesListRow) => void;
  onEditClick?: (record: QuestionnairesListRow) => void;
  onCloneClick?: (record: QuestionnairesListRow) => void;
  data: Array<QuestionnairesListRow>;
  addButtonLabel?: string;
  maxEntries?: number;
  style?: React.CSSProperties;
}

const useStyles = makeStyles(() => ({
  questionnairesList: {
    maxWidth: '440px',
    padding: 0,
    marginBottom: '10px',
    '& li': {
      paddingLeft: 0,
      paddingRight: 0,
    },
  },
}));

export function QuestionnairesList({
  onAddNewClick,
  onDeleteClick,
  onEditClick,
  onCloneClick,
  style,
  data,
  maxEntries,
  addButtonLabel,
}: QuestionnairesListProps) {
  const classes = useStyles();

  return (
    <div>
      <List
        component="ul"
        className={classes.questionnairesList}
        style={{ ...style }}
      >
        {data.map((record) => {
          return (
            <QuestionnairesListItem
              record={record}
              onEditClick={onEditClick}
              onDeleteClick={onDeleteClick}
              onCloneClick={onCloneClick}
              key={record.id}
            />
          );
        })}
      </List>
      <ButtonContainer>
        <Button
          onClick={onAddNewClick}
          variant="outlined"
          data-cy="add-button"
          size="small"
          color="primary"
          startIcon={<AddCircleOutlineIcon />}
          disabled={
            (!!maxEntries && data.length >= maxEntries) ||
            onAddNewClick === undefined
          }
        >
          {addButtonLabel || 'Add'}
        </Button>
      </ButtonContainer>
    </div>
  );
}
