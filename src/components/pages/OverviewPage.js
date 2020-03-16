import Grid from '@material-ui/core/Grid';
import parse from 'html-react-parser';
import React, { useContext } from 'react';

import { UserContext } from '../../context/UserContextProvider';
import { useGetPageContent } from '../../hooks/useGetPageContent';
import { ContentContainer, StyledPaper } from '../../styles/StyledComponents';
import ProposalTableUser from '../proposal/ProposalTableUser';

export default function OverviewPage() {
  const { user } = useContext(UserContext);
  const [loadingHomeContent, homePageContent] = useGetPageContent('HOMEPAGE');

  return (
    <React.Fragment>
      <ContentContainer>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <StyledPaper margin={[0]}>
              {loadingHomeContent ? null : parse(homePageContent)}
            </StyledPaper>
          </Grid>
          <Grid item xs={12}>
            <StyledPaper margin={[0]}>
              <ProposalTableUser id={user.id} />
            </StyledPaper>
          </Grid>
        </Grid>
      </ContentContainer>
    </React.Fragment>
  );
}
