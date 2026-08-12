import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import React from 'react';

/**
 * Grid owner for CardDetailLine. The lines emit bare cells rather than rows, so
 * the key column sizes itself to the longest label and every row stays aligned.
 */
export function CardDetailList({ children }: { children: React.ReactNode }) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'auto auto 1fr',
        alignItems: 'center',
        columnGap: 1,
        rowGap: 0.75,
      }}
    >
      {children}
    </Box>
  );
}

type CardDetailLineProps = {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
};

/** Must be rendered inside a CardDetailList. */
export default function CardDetailLine({
  icon,
  label,
  children,
}: CardDetailLineProps) {
  return (
    <>
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
        {label}
      </Typography>
      <Typography variant="body2" sx={{ minWidth: 0 }}>
        {children}
      </Typography>
    </>
  );
}
