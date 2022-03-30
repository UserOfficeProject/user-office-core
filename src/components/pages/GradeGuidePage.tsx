import parse from 'html-react-parser';
import React from 'react';

import { PageName } from 'generated/sdk';
import { useGetPageContent } from 'hooks/admin/useGetPageContent';
import { StyledContainer } from 'styles/StyledComponents';

const GradeGuidePage: React.FC = () => {
  const [loadingPage, pageContent] = useGetPageContent(PageName.GRADEGUIDEPAGE);

  return (
    <StyledContainer>{loadingPage ? null : parse(pageContent)}</StyledContainer>
  );
};

export default GradeGuidePage;
