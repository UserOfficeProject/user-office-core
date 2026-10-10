import Box from '@mui/material/Box';
import { Theme } from '@mui/material/styles';
import React from 'react';

import { BasicComponentProps } from 'components/proposal/IBasicComponentProps';
import { EmbellishmentConfig } from 'generated/sdk';
import { belowCompactUi } from 'hooks/common/useResponsive';

const containmentSx = (theme: Theme) => ({
  [belowCompactUi(theme)]: {
    overflowWrap: 'anywhere',
    '& img, & video, & iframe, & embed, & object': {
      maxWidth: '100%',
      height: 'auto',
    },
    '& table, & pre': {
      display: 'block',
      maxWidth: '100%',
      overflowX: 'auto',
    },
  },
});

export function QuestionaryComponentEmbellishment(props: BasicComponentProps) {
  const config = props.answer.config as EmbellishmentConfig;

  return (
    <Box
      sx={containmentSx}
      dangerouslySetInnerHTML={{
        __html: config.html,
      }}
    />
  );
}
