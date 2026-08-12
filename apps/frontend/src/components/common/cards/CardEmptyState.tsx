import Box from '@mui/material/Box';
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
    <Box
      data-cy="card-empty-state"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: 1,
        paddingX: 3,
        paddingY: 5,
      }}
    >
      <Box
        aria-hidden
        sx={{
          display: 'flex',
          color: 'text.disabled',
          '& .MuiSvgIcon-root': { fontSize: 40 },
        }}
      >
        {icon}
      </Box>
      <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
        {title}
      </Typography>
      {description && (
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      )}
      {action && <Box sx={{ marginTop: 1 }}>{action}</Box>}
    </Box>
  );
}
