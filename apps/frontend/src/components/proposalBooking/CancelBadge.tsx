import { BadgeProps, Badge } from '@mui/material';
import React from 'react';

const CancelBadge = ({ children, ...rest }: BadgeProps) => {
  return (
    <Badge badgeContent="✖" overlap="circular" {...rest}>
      {children}
    </Badge>
  );
};

export default CancelBadge;
