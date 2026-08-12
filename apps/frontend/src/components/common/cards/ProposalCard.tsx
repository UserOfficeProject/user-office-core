import EditIcon from '@mui/icons-material/Edit';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import HistoryIcon from '@mui/icons-material/History';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import TagIcon from '@mui/icons-material/Tag';
import VisibilityIcon from '@mui/icons-material/Visibility';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
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
      <CardContent>
        <Stack
          direction="row"
          spacing={1.5}
          sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }}
        >
          <Stack spacing={1.5} sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="h5"
              component="h3"
              sx={{ lineHeight: 1.35, textWrap: 'pretty' }}
            >
              {proposal.title}
            </Typography>
            <CardDetailList>
              <CardDetailLine
                icon={<TagIcon fontSize="small" color="action" />}
                label="Proposal ID"
              >
                {proposal.proposalId}
              </CardDetailLine>
              <CardDetailLine
                icon={<FolderOpenIcon fontSize="small" color="action" />}
                label="Call"
              >
                {proposal.call?.shortCode ?? '-'}
              </CardDetailLine>
              <CardDetailLine
                icon={<HistoryIcon fontSize="small" color="action" />}
                label="Created"
              >
                {timeAgo(proposal.created)}
              </CardDetailLine>
            </CardDetailList>
          </Stack>
          <StatusChip status={proposal.publicStatus} />
        </Stack>
      </CardContent>
      <CardActions
        disableSpacing
        sx={{ gap: 2, paddingX: 2, paddingBottom: 2 }}
      >
        <Button
          fullWidth
          variant="quiet"
          startIcon={readOnly ? <VisibilityIcon /> : <EditIcon />}
          onClick={onOpen}
          sx={(theme) => ({ minHeight: minTouchTarget(theme) })}
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
      </CardActions>
      <CardActionSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title={proposal.title}
        items={sheetItems}
      />
    </Card>
  );
}
