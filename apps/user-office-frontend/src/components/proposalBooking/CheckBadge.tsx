import { BadgeProps, Badge } from '@mui/material';
import React from 'react';

const CheckBadge = ({ children, ...rest }: BadgeProps) => {
  return (
    <Badge badgeContent="✔" overlap="circular" {...rest}>
      {children}
    </Badge>
  );
};

export default CheckBadge;
