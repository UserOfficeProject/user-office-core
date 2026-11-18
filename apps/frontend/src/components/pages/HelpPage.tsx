import parse from 'html-react-parser';
import React, { useContext } from 'react';

import { UserContext } from 'context/UserContextProvider';
import { PageName } from 'generated/sdk';
import { useGetPageContents } from 'hooks/admin/useGetPageContent';
import { StyledContainer, StyledPaper } from 'styles/StyledComponents';

const HelpPage = () => {
  const { currentRoleId } = useContext(UserContext);
  const [loadingHelpContent, helpPageContent] = useGetPageContents(
    PageName.HELPPAGE,
    currentRoleId
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
