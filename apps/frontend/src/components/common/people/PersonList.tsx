import AddIcon from '@mui/icons-material/Add';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import List from '@mui/material/List';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import React from 'react';

import { minTouchTarget } from 'hooks/common/useResponsive';

type PersonListProps = {
  title: string;
  /** One entry per person; build them with `PersonListRow`. */
  children: React.ReactNode;
  count: number;
  emptyState?: React.ReactNode;
  addButtonLabel?: string;
  onAdd?: () => void;
  disabled?: boolean;
  dataCy?: string;
};

export default function PersonList({
  title,
  children,
  count,
  emptyState,
  addButtonLabel = 'Add',
  onAdd,
  disabled,
  dataCy,
}: PersonListProps) {
  return (
    <Box data-cy={dataCy}>
      <Stack
        direction="row"
        spacing={1}
        sx={{
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingBottom: 1,
        }}
      >
        <Typography variant="h5" component="h3" sx={{ fontWeight: 500 }}>
          {title}
        </Typography>
        {onAdd && (
          <Button
            variant="quiet"
            startIcon={<AddIcon />}
            onClick={onAdd}
            disabled={disabled}
            data-cy={dataCy && `${dataCy}-add`}
            sx={(theme) => ({
              flexShrink: 0,
              minHeight: minTouchTarget(theme),
            })}
          >
            {addButtonLabel}
          </Button>
        )}
      </Stack>
      <Card variant="outlined" sx={{ borderRadius: 2 }}>
        {count === 0 ? emptyState : <List disablePadding>{children}</List>}
      </Card>
    </Box>
  );
}
