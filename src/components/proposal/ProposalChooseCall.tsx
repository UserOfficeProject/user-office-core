import { Typography } from '@material-ui/core';
import React from 'react';
import { Link } from 'react-router-dom';

import { useActiveCalls } from '../../hooks/useActiveCalls';
import { ContentContainer, StyledPaper } from '../../styles/StyledComponents';

export default function ProposalChooseCall() {
  const calls = useActiveCalls({ filter: { isActive: true } });

  if (!calls) {
    return <p>Loading...</p>;
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
