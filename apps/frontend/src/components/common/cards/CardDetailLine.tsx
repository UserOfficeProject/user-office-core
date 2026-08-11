import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import React from 'react';

type CardDetailLineProps = {
  icon: React.ReactNode;
  children: React.ReactNode;
};

export default function CardDetailLine({
  icon,
  children,
}: CardDetailLineProps) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Box
        aria-hidden
        sx={{
          display: 'flex',
          color: 'action.active',
          opacity: 0.45,
          '& .MuiSvgIcon-root': { fontSize: 18 },
        }}
      >
        {icon}
      </Box>
      <Typography variant="body2" color="text.secondary">
        {children}
      </Typography>
    </Box>
  );
}
