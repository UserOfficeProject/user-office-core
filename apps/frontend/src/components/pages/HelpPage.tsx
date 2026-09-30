import parse from 'html-react-parser';
import React, { useContext } from 'react';

import { UserContext } from 'context/UserContextProvider';
import { PageName } from 'generated/sdk';
import { useGetPageContent } from 'hooks/admin/useGetPageContent';
import { StyledContainer, StyledPaper } from 'styles/StyledComponents';

const HelpPage = () => {
  const { currentRoleId } = useContext(UserContext);
  const [loadingHelpContent, helpPageContent] = useGetPageContent(
    PageName.HELPPAGE,
    true,
    currentRoleId
  );

  return (
    <StyledContainer maxWidth={false}>
      <StyledPaper>
        {loadingHelpContent ? null : parse(helpPageContent)}
      </StyledPaper>
    </StyledContainer>
  );
};

export default HelpPage;
