import parse from 'html-react-parser';
import React from 'react';

import { PageName } from 'generated/sdk';
import { useGetPageContents } from 'hooks/admin/useGetPageContent';
import { StyledContainer, StyledPaper } from 'styles/StyledComponents';

export default function TechniqueProposalNotice() {
  const [loadingContent, pageContent] = useGetPageContents(
    PageName.TECHNIQUEPROPOSALMANAGEMENTPAGE
  );

  return (
    <StyledContainer maxWidth={false}>
      <StyledPaper margin={[0, 0, 2, 0]}>
        {loadingContent ? <div>Loading...</div> : parse(pageContent as string)}
      </StyledPaper>
    </StyledContainer>
  );
}
