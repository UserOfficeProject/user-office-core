import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import LockIcon from '@mui/icons-material/Lock';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import ScheduleIcon from '@mui/icons-material/Schedule';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import Typography from '@mui/material/Typography';
import React from 'react';

import { CardTask, CardTaskStatus } from './CardTask';

export type CardTaskItem = {
  task: CardTask;
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
};

const STATUS_ICON: Record<
  CardTaskStatus,
  { icon: React.ReactNode; color: string }
> = {
  done: { icon: <CheckCircleIcon />, color: 'primary.main' },
  todo: { icon: <RadioButtonUncheckedIcon />, color: 'warning.dark' },
  waiting: { icon: <ScheduleIcon />, color: 'warning.main' },
  locked: { icon: <LockIcon />, color: 'action.disabled' },
};

// Only `locked` is inert, matching the desktop action buttons — a completed step
// can still be reopened to redo it.
const TaskRow = ({ task, onClick }: CardTaskItem) => {
  const actionable = task.status !== 'locked' && !!onClick;
  const { icon, color } = STATUS_ICON[task.status];

  return (
    <ListItemButton
      component="div"
      disableRipple={!actionable}
      onClick={actionable ? onClick : undefined}
      aria-label={
        task.helperText ? `${task.label} — ${task.helperText}` : task.label
      }
      data-cy={`experiment-task-${task.id}`}
      sx={{
        minHeight: task.helperText ? 52 : 48,
        gap: 1.5,
        paddingX: 2,
        paddingY: 0.75,
        cursor: actionable ? 'pointer' : 'default',
        '&:hover': actionable ? undefined : { backgroundColor: 'transparent' },
        '&:not(:last-of-type)': {
          borderBottom: 1,
          borderColor: 'divider',
        },
      }}
      {...(actionable
        ? { role: 'button', tabIndex: 0 }
        : { 'aria-disabled': true })}
    >
      <Box
        aria-hidden
        sx={{ display: 'flex', color, '& .MuiSvgIcon-root': { fontSize: 20 } }}
      >
        {icon}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          variant="body2"
          sx={{
            fontWeight: task.status === 'todo' ? 500 : 400,
            color: task.status === 'locked' ? 'text.disabled' : 'text.primary',
          }}
        >
          {task.label}
        </Typography>
        {task.helperText && (
          <Typography variant="caption" color="text.secondary" component="div">
            {task.helperText}
          </Typography>
        )}
      </Box>
      {actionable && (
        <ChevronRightIcon
          aria-hidden
          sx={{ fontSize: 22, color: 'action.active', opacity: 0.5 }}
        />
      )}
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
      sx={{ borderTop: 1, borderColor: 'divider', backgroundColor: 'grey.50' }}
    >
      {items.map((item) => (
        <TaskRow key={item.task.id} {...item} />
      ))}
    </List>
  );
}
