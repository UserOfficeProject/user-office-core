import parse from 'html-react-parser';
import React from 'react';

import { PageName } from 'generated/sdk';
import { useGetPageContent } from 'hooks/admin/useGetPageContent';
import { belowCompactUi } from 'hooks/common/useResponsive';
import { StyledContainer, StyledPaper } from 'styles/StyledComponents';

const HelpPage = () => {
  const [loadingHelpContent, helpPageContent] = useGetPageContent(
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
        {loadingHelpContent ? null : parse(helpPageContent)}
      </StyledPaper>
    </StyledContainer>
  );
};

export default HelpPage;
