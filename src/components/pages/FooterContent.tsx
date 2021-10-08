import Grid from '@material-ui/core/Grid';
import parse from 'html-react-parser';
import React from 'react';

import { PageName } from 'generated/sdk';
import { useGetPageContent } from 'hooks/admin/useGetPageContent';
import { ContentContainer, StyledPaper } from 'styles/StyledComponents';

const FooterContent: React.FC = () => {
  const [loadingFooterContent, footerContent] = useGetPageContent(
    PageName.FOOTERCONTENT
  );

  return (
    <React.Fragment>
      <ContentContainer>
        <Grid container>
          <Grid item xs={12}>
            <StyledPaper>
              {loadingFooterContent ? null : parse(footerContent)}
            </StyledPaper>
          </Grid>
        </Grid>
      </ContentContainer>
    </React.Fragment>
  );
};

export default FooterContent;
