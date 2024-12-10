import parse from 'html-react-parser';
import React from 'react';

import { PageName } from 'generated/sdk';
import { useGetPageContent } from 'hooks/admin/useGetPageContent';
import { StyledContainer, StyledPaper } from 'styles/StyledComponents';

export default function XpressNotice() {
  const [loadingContent, pageContent] = useGetPageContent(
    PageName.XPRESSMANAGEMENTPAGE
  );

  return (
    <StyledContainer maxWidth={false}>
      <StyledPaper margin={[0, 0, 2, 0]}>
        {loadingContent ? <div>Loading...</div> : parse(pageContent as string)}
      </StyledPaper>
    </StyledContainer>
  );
}
