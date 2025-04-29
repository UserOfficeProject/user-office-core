import { Badge, BadgeProps } from '@mui/material';
import React from 'react';
const PendingBadge = ({ children, ...rest }: BadgeProps) => {
  return (
    <Badge badgeContent="⏲" overlap="circular" {...rest}>
      {children}
    </Badge>
  );
};

export default PendingBadge;
