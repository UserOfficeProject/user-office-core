import Box from '@mui/material/Box';
import parse from 'html-react-parser';
import React from 'react';

import { belowCompactUi } from 'hooks/common/useResponsive';

// The content is admin-authored HTML, so it is restyled from the outside rather
// than rewritten. Scoped to the compact breakpoint because above it this is still
// the desktop welcome panel, which must render as before.
export default function DashboardInfoSection({
  pageContent,
}: {
  pageContent: string;
}) {
  return (
    <Box
      data-cy="dashboard-info-content"
      sx={(theme) => ({
        [belowCompactUi(theme)]: {
          '& h1, & h2': {
            ...theme.typography.h6,
            marginTop: 0,
            marginBottom: theme.spacing(1.5),
          },
          '& p, & li': {
            ...theme.typography.body2,
            lineHeight: 1.55,
            color: theme.palette.text.secondary,
          },
          '& ul': { paddingLeft: theme.spacing(2.75) },
          '& a': { minHeight: 44, display: 'inline-block' },
        },
      })}
    >
      {parse(pageContent)}
    </Box>
  );
}
