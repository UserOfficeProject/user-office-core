import EditIcon from '@mui/icons-material/Edit';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import HistoryIcon from '@mui/icons-material/History';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import TagIcon from '@mui/icons-material/Tag';
import VisibilityIcon from '@mui/icons-material/Visibility';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import React, { useState } from 'react';

import { ProposalPublicStatus } from 'generated/sdk';
import { minTouchTarget } from 'hooks/common/useResponsive';
import { timeAgo } from 'utils/Time';

import CardActionSheet, { CardActionSheetItem } from './CardActionSheet';
import CardDetailLine, { CardDetailList } from './CardDetailLine';
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
    <Card variant="outlined" data-cy="proposal-card" sx={{ borderRadius: 2 }}>
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
            variant="h5"
            component="h3"
            sx={{ lineHeight: 1.35, textWrap: 'pretty' }}
          >
            {proposal.title}
          </Typography>
          <CardDetailList>
            <CardDetailLine icon={<TagIcon />} label="Proposal ID">
              {proposal.proposalId}
            </CardDetailLine>
            <CardDetailLine icon={<FolderOpenIcon />} label="Call">
              {proposal.call?.shortCode ?? '-'}
            </CardDetailLine>
            <CardDetailLine icon={<HistoryIcon />} label="Created">
              {timeAgo(proposal.created)}
            </CardDetailLine>
          </CardDetailList>
        </Box>
        <Box sx={{ flexShrink: 0 }}>
          <StatusChip status={proposal.publicStatus} />
        </Box>
      </Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          paddingX: 2,
          paddingBottom: 2.5,
        }}
      >
        <Button
          fullWidth
          variant="outlined"
          startIcon={readOnly ? <VisibilityIcon /> : <EditIcon />}
          onClick={onOpen}
          sx={(theme) => ({
            minHeight: minTouchTarget(theme),
            color: 'action.active',
            borderColor: 'divider',
            borderRadius: 1,
            '&:hover': {
              borderColor: 'divider',
              backgroundColor: 'action.hover',
            },
          })}
          data-cy="proposal-card-open"
        >
          {readOnly ? 'View' : 'Continue'}
        </Button>
        {sheetItems.length > 0 && (
          <IconButton
            aria-label={`More actions for ${proposal.title}`}
            onClick={() => setSheetOpen(true)}
            sx={(theme) => ({
              width: minTouchTarget(theme),
              height: minTouchTarget(theme),
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
