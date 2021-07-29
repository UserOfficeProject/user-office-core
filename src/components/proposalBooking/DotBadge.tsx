import { BadgeProps, Badge } from '@material-ui/core';
import React from 'react';

const DotBadge = ({ children, ...rest }: BadgeProps) => {
  return (
    <Badge variant="dot" overlap="circle" {...rest}>
      {children}
    </Badge>
  );
};

export default DotBadge;
