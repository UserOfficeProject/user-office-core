import EditIcon from '@mui/icons-material/Edit';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import HistoryIcon from '@mui/icons-material/History';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import PeopleIcon from '@mui/icons-material/People';
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
import { compactTouchTarget } from 'hooks/common/useResponsive';
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
  onOpenDataAccess?: () => void;
  sheetItems: CardActionSheetItem[];
};

export default function ProposalCard({
  proposal,
  readOnly,
  onOpen,
  onOpenDataAccess,
  sheetItems,
}: ProposalCardProps) {
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <Card variant="outlined" data-cy="proposal-card" sx={{ borderRadius: 2 }}>
      <CardContent>
        <Stack spacing={1.25}>
          <Stack
            direction="row"
            spacing={1.5}
            sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }}
          >
            <Typography
              variant="cardTitle"
              component="h3"
              sx={{ flex: 1, minWidth: 0 }}
            >
              {proposal.title}
            </Typography>
            <StatusChip status={proposal.publicStatus} />
          </Stack>
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
      </CardContent>
      <CardActions disableSpacing sx={{ gap: 1.5 }}>
        <Button
          fullWidth
          variant="quiet"
          startIcon={readOnly ? <VisibilityIcon /> : <EditIcon />}
          onClick={onOpen}
          sx={(theme) => compactTouchTarget(theme, 4.5)}
          data-cy="proposal-card-open"
        >
          {readOnly ? 'View' : 'Continue'}
        </Button>
        {onOpenDataAccess && (
          <IconButton
            aria-label={`Data access users for ${proposal.title}`}
            onClick={onOpenDataAccess}
            sx={(theme) => ({
              ...compactTouchTarget(theme, 4.5),
              width: theme.spacing(4.5),
              flexShrink: 0,
              border: 1,
              borderColor: 'divider',
              borderRadius: 1,
            })}
            data-cy="proposal-card-data-access"
          >
            <PeopleIcon />
          </IconButton>
        )}
        {sheetItems.length > 0 && (
          <IconButton
            aria-label={`More actions for ${proposal.title}`}
            onClick={() => setSheetOpen(true)}
            sx={(theme) => ({
              ...compactTouchTarget(theme, 4.5),
              width: theme.spacing(4.5),
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
