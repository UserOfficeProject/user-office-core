import makeStyles from '@mui/styles/makeStyles';
import React from 'react';

import CheckBadge from './CheckBadge';
import DotBadge from './DotBadge';

export type ActionButtonState =
  | 'completed'
  | 'active'
  | 'inactive'
  | 'neutral'
  | 'invisible';

interface ActionButtonProps {
  children: React.ReactNode;
  variant: ActionButtonState;
}

const useStyles = makeStyles(() => ({
  completed: {
    color: '#000',
    marginRight: '2px',
    '& .MuiBadge-badge': {
      fontSize: '17px',
      color: '#4ba322',
      textShadow: '-1px 2px 0 white',
    },
  },
  active: {
    color: '#000',
    marginRight: '2px',
    '& .MuiBadge-dot': {
      background: '#eb1a6c',
      boxShadow: '-1px 1px 0 white',
    },
  },
  neutral: {
    marginRight: '2px',
    color: '#000',
  },
  inactive: {
    color: '#BBB',
  },
}));

const ActionButton = ({ children, variant: state }: ActionButtonProps) => {
  const classes = useStyles();

  switch (state) {
    case 'completed':
      return <CheckBadge className={classes.completed}>{children}</CheckBadge>;
    case 'active':
      return <DotBadge className={classes.active}>{children}</DotBadge>;
    case 'inactive':
      return <DotBadge className={classes.inactive}>{children}</DotBadge>;
    case 'neutral':
      return <DotBadge className={classes.neutral}>{children}</DotBadge>;
    case 'invisible':
      return <DotBadge />;
  }
};

export default ActionButton;
