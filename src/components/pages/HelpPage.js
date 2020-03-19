import Grid from '@material-ui/core/Grid';
import parse from 'html-react-parser';
import React from 'react';

import { useGetPageContent } from '../../hooks/useGetPageContent';
import { ContentContainer, StyledPaper } from '../../styles/StyledComponents';

export default function HelpPage() {
  const [loadingHelpContent, helpPageContent] = useGetPageContent('HELPPAGE');

  return (
    <React.Fragment>
      <ContentContainer>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <StyledPaper>
              {loadingHelpContent ? null : parse(helpPageContent)}
            </StyledPaper>
          </Grid>
        </Grid>
      </ContentContainer>
    </React.Fragment>
  );
}
