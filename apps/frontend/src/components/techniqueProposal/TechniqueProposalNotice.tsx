import parse from 'html-react-parser';
import React, { useContext } from 'react';

import { UserContext } from 'context/UserContextProvider';
import { PageName } from 'generated/sdk';
import { useGetPageContents } from 'hooks/admin/useGetPageContent';
import { StyledContainer, StyledPaper } from 'styles/StyledComponents';

export default function TechniqueProposalNotice() {
  const { currentRoleId } = useContext(UserContext);
  const [loadingContent, pageContent] = useGetPageContents(
    PageName.TECHNIQUEPROPOSALMANAGEMENTPAGE,
    currentRoleId
  );

  return (
    <StyledContainer maxWidth={false}>
      <StyledPaper margin={[0, 0, 2, 0]}>
        {loadingContent ? (
          <div>Loading...</div>
        ) : (
          parse(Array.isArray(pageContent) ? '' : pageContent)
        )}
      </StyledPaper>
    </StyledContainer>
  );
}
