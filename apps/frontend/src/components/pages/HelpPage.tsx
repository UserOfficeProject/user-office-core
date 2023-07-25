import parse from 'html-react-parser';
import React from 'react';

import { PageName } from 'generated/sdk';
import { useGetPageContent } from 'hooks/admin/useGetPageContent';
import { StyledContainer, StyledPaper } from 'styles/StyledComponents';

const HelpPage = () => {
  const [loadingHelpContent, helpPageContent] = useGetPageContent(
    PageName.HELPPAGE
  );

  return (
    <React.Fragment>
      <StyledContainer>
        <StyledPaper>
          {loadingHelpContent ? null : parse(helpPageContent)}
        </StyledPaper>
      </StyledContainer>
    </React.Fragment>
  );
};

export default HelpPage;
