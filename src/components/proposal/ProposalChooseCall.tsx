import { Typography } from '@material-ui/core';
import React from 'react';
import { useHistory } from 'react-router';
import { Link } from 'react-router-dom';

import { useActiveCalls } from '../../hooks/useActiveCalls';
import { ContentContainer, StyledPaper } from '../../styles/StyledComponents';

export default function ProposalChooseCall() {
  const calls = useActiveCalls({ filter: { isActive: true } });
  const history = useHistory();

  if (!calls) {
    return <p>Loading...</p>;
  }

  if (calls.length == 1) {
    history.push(`/ProposalCreate/${calls[0].templateId}`);
  }

  return (
    <React.Fragment>
      <ContentContainer>
        <StyledPaper margin={[0]}>
          <Typography component="h1" variant="h4" align="center">
            Choose call
          </Typography>
          <ul>
            {calls.map(call => {
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
    </React.Fragment>
  );
}
