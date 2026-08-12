import Chip, { ChipProps } from '@mui/material/Chip';
import React from 'react';

import { ProposalPublicStatus } from 'generated/sdk';

const STATUS: Record<
  ProposalPublicStatus,
  { label: string; color: ChipProps['color'] }
> = {
  [ProposalPublicStatus.DRAFT]: { label: 'Draft', color: 'warning' },
  [ProposalPublicStatus.SUBMITTED]: { label: 'Submitted', color: 'neutral' },
  [ProposalPublicStatus.ACCEPTED]: { label: 'Accepted', color: 'success' },
  [ProposalPublicStatus.REJECTED]: { label: 'Rejected', color: 'error' },
  [ProposalPublicStatus.RESERVED]: { label: 'Reserved', color: 'info' },
  [ProposalPublicStatus.UNKNOWN]: { label: 'Unknown', color: 'neutral' },
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
      variant="outlined"
      color={color}
      label={label}
      data-cy={`proposal-status-${status}`}
      sx={(theme) => ({
        fontSize: theme.typography.pxToRem(14),
        fontWeight: 550,
        borderWidth: 1,
      })}
    />
  );
}
