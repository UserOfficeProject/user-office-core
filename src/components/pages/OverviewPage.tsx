import Grid from '@material-ui/core/Grid';
import parse from 'html-react-parser';
import React, { useContext } from 'react';

import InstrumentsTable from 'components/instrument/InstrumentsTable';
import ProposalTableUser from 'components/proposal/ProposalTableUser';
import ProposalTableReviewer from 'components/review/ProposalTableReviewer';
import { UserContext } from 'context/UserContextProvider';
import { PageName, UserRole } from 'generated/sdk';
import { useGetPageContent } from 'hooks/admin/useGetPageContent';
import { ContentContainer, StyledPaper } from 'styles/StyledComponents';

export default function OverviewPage(props: { userRole: UserRole }) {
  const { user } = useContext(UserContext);
  const [loadingContent, pageContent] = useGetPageContent(
    props.userRole === UserRole.USER ? PageName.HOMEPAGE : PageName.REVIEWPAGE
  );

  let roleBasedOverView = <ProposalTableReviewer />;

  switch (props.userRole) {
    case UserRole.USER:
      roleBasedOverView = <ProposalTableUser id={user.id} />;
      break;
    case UserRole.INSTRUMENT_SCIENTIST:
      roleBasedOverView = <InstrumentsTable />;
      break;

    default:
      break;
  }

  return (
    <React.Fragment>
      <ContentContainer>
        <Grid container spacing={3}>
          {props.userRole !== UserRole.INSTRUMENT_SCIENTIST && (
            <Grid item xs={12}>
              <StyledPaper margin={[0]}>
                {loadingContent ? (
                  <div>Loading...</div>
                ) : (
                  parse(pageContent as string)
                )}
              </StyledPaper>
            </Grid>
          )}
          <Grid item xs={12}>
            <StyledPaper margin={[0]}>{roleBasedOverView}</StyledPaper>
          </Grid>
        </Grid>
      </ContentContainer>
    </React.Fragment>
  );
}
