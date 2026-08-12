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
      sx={(theme) => ({
        display: 'grid',
        // A floor under the label column, so a card whose labels are all short
        // still lines its values up where a longer-labelled card puts them.
        gridTemplateColumns: `auto minmax(${theme.spacing(11)}, auto) 1fr`,
        alignItems: 'center',
        // Icon to label only. The label to value gap is padding on the label, so
        // widening one does not widen the other.
        columnGap: 1,
        rowGap: 1,
      })}
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
      <Typography
        variant="body1"
        color="text.secondary"
        sx={{ paddingRight: 2 }}
      >
        {label}
      </Typography>
      <Typography variant="body1" sx={{ minWidth: 0 }}>
        {children}
      </Typography>
    </>
  );
}
