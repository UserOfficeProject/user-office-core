import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import React from 'react';

export function CardDetailList({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {children}
    </Box>
  );
}

type CardDetailLineProps = {
  /** Give it `fontSize="small"`; it is rendered as passed. */
  icon: React.ReactNode;
  label: string;
  /**
   * Puts the value under the label rather than opposite it, for a value that
   * needs the full width to stay on one line.
   */
  stacked?: boolean;
  children: React.ReactNode;
};

/** Must be rendered inside a CardDetailList. */
export default function CardDetailLine({
  icon,
  label,
  stacked = false,
  children,
}: CardDetailLineProps) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
      <Box sx={{ display: 'flex', flexShrink: 0 }}>{icon}</Box>
      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          ...(stacked
            ? { flexDirection: 'column' }
            : { alignItems: 'center', gap: 1 }),
        }}
      >
        <Typography variant="cardLabel" component="div" sx={{ flexShrink: 0 }}>
          {label}
        </Typography>
        <Typography
          variant="cardValue"
          component="div"
          sx={{
            minWidth: 0,
            ...(stacked ? {} : { marginLeft: 'auto', textAlign: 'right' }),
          }}
        >
          {children}
        </Typography>
      </Box>
    </Box>
  );
}
