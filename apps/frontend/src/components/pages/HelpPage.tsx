import parse from 'html-react-parser';
import React from 'react';

import { PageName } from 'generated/sdk';
import { useGetPageContents } from 'hooks/admin/useGetPageContent';
import { StyledContainer, StyledPaper } from 'styles/StyledComponents';

const HelpPage = () => {
  const [loadingHelpContent, helpPageContent] = useGetPageContents(
    PageName.HELPPAGE
  );

  return (
    <StyledContainer maxWidth={false}>
      <StyledPaper>
        {loadingHelpContent ? null : parse(helpPageContent as string)}
      </StyledPaper>
    </StyledContainer>
  );
};

export default HelpPage;
