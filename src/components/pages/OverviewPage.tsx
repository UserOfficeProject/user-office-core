import Grid from '@material-ui/core/Grid';
import parse from 'html-react-parser';
import React, { useContext } from 'react';

import { UserContext } from '../../context/UserContextProvider';
import { PageName, UserRole } from '../../generated/sdk';
import { useGetPageContent } from '../../hooks/useGetPageContent';
import { ContentContainer, StyledPaper } from '../../styles/StyledComponents';
import ProposalTableUser from '../proposal/ProposalTableUser';
import ProposalTableReviewer from '../review/ProposalTableReviewer';

export default function OverviewPage(props: { userRole: UserRole }) {
  const { user } = useContext(UserContext);
  const [loadingContent, pageContent] = useGetPageContent(
    props.userRole === UserRole.USER ? PageName.HOMEPAGE : PageName.REVIEWPAGE
  );

  return (
    <React.Fragment>
      <ContentContainer>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <StyledPaper margin={[0]}>
              {loadingContent ? null : parse(pageContent as string)}
            </StyledPaper>
          </Grid>
          <Grid item xs={12}>
            <StyledPaper margin={[0]}>
              {props.userRole === UserRole.USER ? (
                <ProposalTableUser id={user.id} />
              ) : (
                <ProposalTableReviewer />
              )}
            </StyledPaper>
          </Grid>
        </Grid>
      </ContentContainer>
    </React.Fragment>
  );
}
