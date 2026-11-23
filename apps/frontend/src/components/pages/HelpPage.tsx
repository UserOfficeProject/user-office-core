import parse from 'html-react-parser';
import React from 'react';

import { PageName } from 'generated/sdk';
import { useGetPageContents } from 'hooks/admin/useGetPageContent';
import { belowCompactUi } from 'hooks/common/useResponsive';
import { StyledContainer, StyledPaper } from 'styles/StyledComponents';

const HelpPage = () => {
  const [loadingHelpContent, helpPageContent] = useGetPageContents(
    PageName.HELPPAGE
  );

  return (
    <StyledContainer maxWidth={false}>
      <StyledPaper
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
      >
        {!loadingHelpContent && typeof helpPageContent === 'string'
          ? parse(helpPageContent)
          : null}
      </StyledPaper>
    </StyledContainer>
  );
};

export default HelpPage;
