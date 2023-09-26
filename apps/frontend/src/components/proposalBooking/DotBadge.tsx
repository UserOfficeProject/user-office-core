import { BadgeProps, Badge } from '@mui/material';
import React from 'react';

const DotBadge = ({ children, ...rest }: BadgeProps) => {
  return (
    <Badge variant="dot" overlap="circular" {...rest}>
      {children}
    </Badge>
  );
};

export default DotBadge;
