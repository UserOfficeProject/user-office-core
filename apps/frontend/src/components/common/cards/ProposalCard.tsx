import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import EditIcon from '@mui/icons-material/Edit';
import HistoryIcon from '@mui/icons-material/History';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import VisibilityIcon from '@mui/icons-material/Visibility';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import React, { useState } from 'react';

import { ProposalPublicStatus } from 'generated/sdk';
import { timeAgo } from 'utils/Time';

import CardActionSheet, { CardActionSheetItem } from './CardActionSheet';
import CardDetailLine from './CardDetailLine';
import StatusChip from './StatusChip';

// Structural rather than ProposalTableUser's PartialProposalsDataType, which
// would close an import cycle back through ProposalTable.
type ProposalCardData = {
  proposalId: string;
  title: string;
  publicStatus: ProposalPublicStatus;
  created: string | null;
  call?: { shortCode: string } | null;
};

/** Spacing units, so both footer controls clear the 44px minimum hit target. */
const TOUCH_TARGET = 5.5;

type ProposalCardProps = {
  proposal: ProposalCardData;
  readOnly: boolean;
  onOpen: () => void;
  sheetItems: CardActionSheetItem[];
};

export default function ProposalCard({
  proposal,
  readOnly,
  onOpen,
  sheetItems,
}: ProposalCardProps) {
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <Card variant="outlined" data-cy="proposal-card">
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 1.5,
          paddingX: 2,
          paddingY: 2.5,
        }}
      >
        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
          }}
        >
          <Typography
            variant="h6"
            component="h3"
            sx={{ lineHeight: 1.35, textWrap: 'pretty' }}
          >
            {proposal.title}
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
            <CardDetailLine icon={<CalendarTodayIcon />}>
              {proposal.call?.shortCode ?? '-'}
            </CardDetailLine>
            <CardDetailLine icon={<HistoryIcon />}>
              Created {timeAgo(proposal.created)}
            </CardDetailLine>
          </Box>
        </Box>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: 0.5,
            flexShrink: 0,
          }}
        >
          <StatusChip status={proposal.publicStatus} />
          <Typography variant="caption" color="text.secondary" noWrap>
            {proposal.proposalId}
          </Typography>
        </Box>
      </Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          padding: 2,
          paddingTop: 1.5,
          borderTop: 1,
          borderColor: 'divider',
        }}
      >
        <Button
          fullWidth
          color="secondary"
          variant="outlined"
          startIcon={readOnly ? <VisibilityIcon /> : <EditIcon />}
          onClick={onOpen}
          sx={(theme) => ({ minHeight: theme.spacing(TOUCH_TARGET) })}
          data-cy="proposal-card-open"
        >
          {readOnly ? 'View' : 'Continue'}
        </Button>
        {sheetItems.length > 0 && (
          <IconButton
            aria-label={`More actions for ${proposal.title}`}
            onClick={() => setSheetOpen(true)}
            sx={(theme) => ({
              width: theme.spacing(TOUCH_TARGET),
              height: theme.spacing(TOUCH_TARGET),
              flexShrink: 0,
              border: 1,
              borderColor: 'divider',
              borderRadius: 1,
            })}
            data-cy="proposal-card-menu"
          >
            <MoreHorizIcon />
          </IconButton>
        )}
      </Box>
      <CardActionSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title={proposal.title}
        items={sheetItems}
      />
    </Card>
  );
}
