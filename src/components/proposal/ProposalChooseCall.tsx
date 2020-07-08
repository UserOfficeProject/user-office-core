import { Typography } from '@material-ui/core';
import React from 'react';
import { useHistory } from 'react-router';
import { Link } from 'react-router-dom';

import { useCallsData } from 'hooks/useCallsData';
import { ContentContainer, StyledPaper } from 'styles/StyledComponents';

export default function ProposalChooseCall() {
  const { loading, callsData } = useCallsData(true);
  const history = useHistory();

  if (loading) {
    return <p>Loading...</p>;
  }

  if (callsData.length === 0) {
    return <p>There are no running calls at the moment</p>;
  }

  if (callsData.length === 1) {
    history.push(`/ProposalCreate/${callsData[0].templateId}`);
  }

  return (
    <ContentContainer>
      <StyledPaper margin={[0]}>
        <Typography component="h1" variant="h4" align="center">
          Choose call
        </Typography>
        <ul>
          {callsData.map(call => {
            const linkTo = '/ProposalCreate/' + call.id;

            return (
              <li key={call.id}>
                <Link to={linkTo}>{call.shortCode}</Link>
              </li>
            );
          })}
        </ul>
      </StyledPaper>
    </ContentContainer>
  );
}
