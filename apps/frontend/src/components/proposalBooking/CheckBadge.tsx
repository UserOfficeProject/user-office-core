import Badge, { BadgeProps } from '@mui/material/Badge';
import React from 'react';

const CheckBadge = ({ children, ...rest }: BadgeProps) => {
  return (
    <Badge badgeContent="✔" overlap="circular" {...rest}>
      {children}
    </Badge>
  );
};

export default CheckBadge;
