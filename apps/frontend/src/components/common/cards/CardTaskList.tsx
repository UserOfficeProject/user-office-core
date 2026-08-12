import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import React from 'react';

import { minTouchTarget } from 'hooks/common/useResponsive';

import { CardTask } from './CardTask';

export type CardTaskItem = {
  task: CardTask;
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
};

// Only `locked` is inert, matching the desktop action buttons — a completed step
// can still be reopened to redo it.
const TaskRow = ({ task, onClick }: CardTaskItem) => {
  const actionable = task.status !== 'locked' && !!onClick;

  return (
    <ListItemButton
      component="div"
      disabled={!actionable}
      onClick={onClick}
      data-cy={`experiment-task-${task.id}`}
      sx={(theme) => ({
        minHeight: minTouchTarget(theme),
        gap: 1.5,
        '&:not(:last-of-type)': {
          borderBottom: 1,
          borderColor: 'divider',
        },
      })}
    >
      <ListItemIcon sx={{ minWidth: 0 }}>{task.icon}</ListItemIcon>
      <ListItemText
        primary={task.label}
        secondary={task.helperText}
        slotProps={{
          primary: {
            variant: 'body2',
            sx: { fontWeight: task.status === 'todo' ? 500 : 400 },
          },
          secondary: { variant: 'caption' },
        }}
      />
      {actionable && <ChevronRightIcon fontSize="small" color="action" />}
    </ListItemButton>
  );
};

export default function CardTaskList({ items }: { items: CardTaskItem[] }) {
  if (!items.length) {
    return null;
  }

  return (
    <List
      disablePadding
      sx={{
        borderTop: 1,
        borderColor: 'divider',
        backgroundColor: 'action.hover',
      }}
    >
      {items.map((item) => (
        <TaskRow key={item.task.id} {...item} />
      ))}
    </List>
  );
}
