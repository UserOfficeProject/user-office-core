import React from 'react';

import CheckBadge from './CheckBadge';
import DotBadge from './DotBadge';

export type ActionButtonState =
  | 'completed'
  | 'active'
  | 'inactive'
  | 'neutral'
  | 'pending'
  | 'invisible';

interface ActionButtonProps {
  children: React.ReactNode;
  variant: ActionButtonState;
}

const ActionButton = ({ children, variant: state }: ActionButtonProps) => {
  switch (state) {
    case 'completed':
      return (
        <CheckBadge
          sx={{
            color: '#000',
            marginRight: '2px',
            '& .MuiBadge-badge': {
              fontSize: '17px',
              color: '#4ba322',
              textShadow: '-1px 2px 0 white',
            },
          }}
        >
          {children}
        </CheckBadge>
      );
    case 'active':
      return (
        <DotBadge
          sx={{
            color: '#000',
            marginRight: '2px',
            '& .MuiBadge-dot': {
              background: '#eb1a6c',
              boxShadow: '-1px 1px 0 white',
            },
          }}
        >
          {children}
        </DotBadge>
      );
    case 'inactive':
      return (
        <DotBadge
          sx={{
            color: '#BBB',
          }}
        >
          {children}
        </DotBadge>
      );
    case 'neutral':
      return (
        <DotBadge
          sx={{
            marginRight: '2px',
            color: '#000',
          }}
        >
          {children}
        </DotBadge>
      );
    case 'pending':
      return (
        <CheckBadge
          sx={{
            color: '#000',
            marginRight: '2px',
            '& .MuiBadge-badge': {
              fontSize: '17px',
              color: '#4ba322',
              textShadow: '-1px 2px 0 white',
            },
          }}
        >
          {children}
        </CheckBadge>
      );
    case 'invisible':
      return <DotBadge />;
  }
};

export default ActionButton;
