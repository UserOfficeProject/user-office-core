import { BadgeProps, Badge } from '@mui/material';
import { TimeIcon } from '@mui/x-date-pickers';
import React from 'react';

const PendingBadge = ({ children, ...rest }: BadgeProps) => {
  return (
    <Badge badgeContent={<TimeIcon />} overlap="circular" {...rest}>
      {children}
    </Badge>
  );
};

export default PendingBadge;
