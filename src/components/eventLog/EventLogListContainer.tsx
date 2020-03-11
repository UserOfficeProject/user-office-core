/**
 * This container component just wraps EventLogList component
 * and gives it a bit different styling.
 * It is used in the user details page for now.
 */

import React from 'react';
import { Container, Grid } from '@material-ui/core';
import { StyledPaper } from '../../styles/StyledComponents';
import EventLogList from './EventLogList';

type EventLogListProps = {
  /** Id of the changed object that we want to list event logs for. */
  changedObjectId?: string | number;
  /** Type of the event we want to list.
   * For example `PROPOSAL`(get all proposal events) or
   * `PROPOSAL_UPDATED`(get all proposal updated events)
   **/
  eventType?: string;
};

const EventLogListContainer: React.FC<EventLogListProps> = props => {
  return (
    <Container maxWidth="lg">
      <Grid>
        <Grid item xs={12}>
          <StyledPaper>
            <EventLogList {...props} />
          </StyledPaper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default EventLogListContainer;
