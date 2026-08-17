import Box from '@mui/material/Box';
import React from 'react';

import { BasicComponentProps } from 'components/proposal/IBasicComponentProps';
import { EmbellishmentConfig } from 'generated/sdk';
import { belowCompactUi } from 'hooks/common/useResponsive';

export function QuestionaryComponentEmbellishment(props: BasicComponentProps) {
  const config = props.answer.config as EmbellishmentConfig;

  return (
    <Box
      sx={(theme) => ({
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
      })}
      dangerouslySetInnerHTML={{
        __html: config.html,
      }}
    />
  );
}
