import EditIcon from '@mui/icons-material/Edit';
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
      <Box sx={{ padding: 2 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            marginBottom: 1,
          }}
        >
          <StatusChip status={proposal.publicStatus} />
          <Typography variant="caption" color="text.secondary" noWrap>
            {proposal.proposalId}
          </Typography>
        </Box>
        <Typography
          variant="subtitle1"
          component="h3"
          sx={{
            fontWeight: 500,
            lineHeight: 1.35,
            textWrap: 'pretty',
            marginBottom: 1,
          }}
        >
          {proposal.title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {proposal.call?.shortCode ?? '-'} &middot; created{' '}
          {timeAgo(proposal.created)}
        </Typography>
      </Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          padding: 2,
          paddingTop: 1.5,
          borderTop: 1,
          borderColor: 'divider',
        }}
      >
        <Button
          fullWidth
          variant={readOnly ? 'outlined' : 'contained'}
          startIcon={readOnly ? <VisibilityIcon /> : <EditIcon />}
          onClick={onOpen}
          sx={{ minHeight: 44 }}
          data-cy="proposal-card-open"
        >
          {readOnly ? 'View' : 'Continue'}
        </Button>
        {sheetItems.length > 0 && (
          <IconButton
            aria-label={`More actions for ${proposal.title}`}
            onClick={() => setSheetOpen(true)}
            sx={{ width: 44, height: 44, border: 1, borderColor: 'divider' }}
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
