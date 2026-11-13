import Badge, { BadgeProps } from '@mui/material/Badge';
import React from 'react';

const CancelBadge = ({ children, ...rest }: BadgeProps) => {
  return (
    <Badge badgeContent="✖" overlap="circular" {...rest}>
      {children}
    </Badge>
  );
};

export default CancelBadge;
