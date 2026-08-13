import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import React from 'react';

import { minTouchTarget } from 'hooks/common/useResponsive';

export type PersonListRowProps = {
  primary: string;
  secondary?: string;
  /** Markers such as the team lead or an invitation state. */
  chips?: React.ReactNode;
  onOpenActions?: () => void;
  actionsLabel?: string;
  dataCy?: string;
};

export default function PersonListRow({
  primary,
  secondary,
  chips,
  onOpenActions,
  actionsLabel,
  dataCy,
}: PersonListRowProps) {
  return (
    <ListItem
      divider
      data-cy={dataCy}
      sx={{ minHeight: 60, gap: 1, paddingX: 2 }}
      secondaryAction={
        onOpenActions && (
          <IconButton
            edge="end"
            aria-label={actionsLabel ?? `Actions for ${primary}`}
            onClick={onOpenActions}
            data-cy={dataCy && `${dataCy}-actions`}
            sx={(theme) => ({
              width: minTouchTarget(theme),
              height: minTouchTarget(theme),
            })}
          >
            <MoreHorizIcon />
          </IconButton>
        )
      }
    >
      <ListItemText
        primary={
          <Stack
            direction="row"
            spacing={0.75}
            sx={{ alignItems: 'center', flexWrap: 'wrap' }}
          >
            <Box component="span">{primary}</Box>
            {chips}
          </Stack>
        }
        secondary={secondary}
        slotProps={{
          primary: { variant: 'body1' },
          secondary: { variant: 'body2', noWrap: true },
        }}
      />
    </ListItem>
  );
}
