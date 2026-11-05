import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import React from 'react';

type CardEmptyStateProps = {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
};

export default function CardEmptyState({
  icon,
  title,
  description,
  action,
}: CardEmptyStateProps) {
  return (
    <Stack
      data-cy="card-empty-state"
      spacing={1}
      sx={{
        alignItems: 'center',
        textAlign: 'center',
        paddingX: 3,
        paddingY: 5,
      }}
    >
      {icon}
      <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
        {title}
      </Typography>
      {description && (
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      )}
      {action}
    </Stack>
  );
}
