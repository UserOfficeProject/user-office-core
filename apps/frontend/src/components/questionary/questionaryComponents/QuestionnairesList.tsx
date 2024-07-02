import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { Box } from '@mui/material';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import React from 'react';

import { StyledButtonContainer } from 'styles/StyledComponents';

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
  onCopyClick?: () => void;
  data: Array<QuestionnairesListRow>;
  addButtonLabel?: string;
  canCopy?: boolean;
  copyButtonLabel?: string;
  maxEntries?: number;
  style?: React.CSSProperties;
}

export function QuestionnairesList({
  onAddNewClick,
  onDeleteClick,
  onEditClick,
  onCloneClick,
  onCopyClick,
  style,
  data,
  maxEntries,
  addButtonLabel,
  canCopy,
  copyButtonLabel,
}: QuestionnairesListProps) {
  const isListEmpty = data.length === 0;

  return (
    <>
      {isListEmpty ? (
        <Box
          sx={(theme) => ({
            display: 'flex',
            justifyContent: 'center',
            fontStyle: 'italic',
            padding: theme.spacing(2),
            color: theme.palette.grey[500],
          })}
        >
          The list is empty
        </Box>
      ) : (
        <List
          component="ul"
          sx={{
            padding: 0,
            marginBottom: '10px',
            '& li': {
              paddingLeft: 0,
              paddingRight: 0,
            },
          }}
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
      )}
      <Box display="flex" alignItems="center">
        {`${data.length} item(s)`}
        <StyledButtonContainer
          sx={{
            flex: '1 1 0px',
            '& button': {
              marginLeft: 6,
            },
          }}
        >
          {canCopy && (
            <Button
              onClick={onCopyClick}
              variant="outlined"
              data-cy="copy-button"
              color="primary"
              startIcon={<AddCircleOutlineIcon />}
              disabled={
                (!!maxEntries && data.length >= maxEntries) ||
                onCopyClick === undefined
              }
            >
              {copyButtonLabel || 'Copy'}
            </Button>
          )}
          <Button
            onClick={onAddNewClick}
            variant="outlined"
            data-cy="add-button"
            color="primary"
            startIcon={<AddCircleOutlineIcon />}
            disabled={
              (!!maxEntries && data.length >= maxEntries) ||
              onAddNewClick === undefined
            }
          >
            {addButtonLabel || 'Add'}
          </Button>
        </StyledButtonContainer>
      </Box>
    </>
  );
}
