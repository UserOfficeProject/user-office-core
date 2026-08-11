import Chip, { ChipProps } from '@mui/material/Chip';
import React from 'react';

import { ProposalPublicStatus } from 'generated/sdk';

const STATUS: Record<
  ProposalPublicStatus,
  { label: string; color: ChipProps['color'] }
> = {
  [ProposalPublicStatus.DRAFT]: { label: 'Draft', color: 'warning' },
  [ProposalPublicStatus.SUBMITTED]: { label: 'Submitted', color: 'default' },
  [ProposalPublicStatus.ACCEPTED]: { label: 'Accepted', color: 'success' },
  [ProposalPublicStatus.REJECTED]: { label: 'Rejected', color: 'error' },
  [ProposalPublicStatus.RESERVED]: { label: 'Reserved', color: 'info' },
  [ProposalPublicStatus.UNKNOWN]: { label: 'Unknown', color: 'default' },
};

export default function StatusChip({
  status,
}: {
  status: ProposalPublicStatus;
}) {
  const { label, color } =
    STATUS[status] ?? STATUS[ProposalPublicStatus.UNKNOWN];

  return (
    <Chip
      size="small"
      variant="outlined"
      color={color}
      label={label}
      data-cy={`proposal-status-${status}`}
    />
  );
}
