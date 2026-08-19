import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import React from 'react';

const LABEL_SX = { fontSize: 13, lineHeight: 1.4, color: 'text.secondary' };

const VALUE_SX = {
  fontWeight: 500,
  fontSize: 15,
  lineHeight: 1.4,
  overflowWrap: 'anywhere',
};

export function CardDetailList({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      {children}
    </Box>
  );
}

type CardDetailLineProps = {
  /** Give it `fontSize="small"`; it is rendered as passed. */
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
    <Box
      sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, minWidth: 0 }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          flexShrink: 0,
          // One label line (13px x 1.4), so the icon centres on the label
          // rather than on the whole pair.
          height: '18px',
        }}
      >
        {icon}
      </Box>
      <Box
        sx={{
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: '3px',
        }}
      >
        <Typography component="div" sx={LABEL_SX}>
          {label}
        </Typography>
        <Typography component="div" sx={VALUE_SX}>
          {children}
        </Typography>
      </Box>
    </Box>
  );
}
