import { Button, TextField, Autocomplete, Grid } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import React, { useState } from 'react';

import { useCheckAccess } from 'components/common/Can';
import { UserRole } from 'generated/sdk';
import { ProposalData } from 'hooks/proposal/useProposalData';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import { getFullUserName } from 'utils/user';
import withConfirm, { WithConfirmType } from 'utils/withConfirm';

type AssignTechnicalReviewProps = {
  proposal: ProposalData;
  onProposalUpdated: (proposal: ProposalData) => void;
  confirm: WithConfirmType;
};

const useStyles = makeStyles((theme) => ({
  submitButton: {
    marginLeft: theme.spacing(2),
  },
}));
function AssignTechnicalReview({
  proposal,
  onProposalUpdated,
  confirm,
}: AssignTechnicalReviewProps) {
  const classes = useStyles();
  const { api } = useDataApiWithFeedback();
  const isUserOfficer = useCheckAccess([UserRole.USER_OFFICER]);

  const [selectedUser, setSelectedUser] = useState(
    proposal.technicalReview?.technicalReviewAssigneeId
  );

  const usersData = proposal.instrument?.scientists || [];
  const beamlineManagerAlreadyExists = proposal.instrument?.scientists.find(
    (scientist) => scientist.id === proposal.instrument?.beamlineManager.id
  );

  if (proposal.instrument?.beamlineManager && !beamlineManagerAlreadyExists) {
    usersData.push(proposal.instrument?.beamlineManager);
  }

  const userIdToUser = (userId?: number | null) =>
    usersData.find((user) => user.id === userId);

  return (
    <Grid container alignItems="center">
      <Grid item xs={3}>
        <Autocomplete
          id="user-list"
          options={usersData}
          renderInput={(params) => (
            <TextField {...params} label="Technical reviewer" margin="none" />
          )}
          getOptionLabel={(option) => getFullUserName(option)}
          onChange={(_event, newValue) => {
            if (newValue) {
              setSelectedUser(newValue.id);
            }
          }}
          value={userIdToUser(selectedUser)}
          disableClearable
          data-cy="user-list"
          disabled={!isUserOfficer && proposal.technicalReview?.submitted}
          ListboxProps={{ title: 'user-list-options' }}
        />
      </Grid>
      <Grid item xs={1}>
        <Button
          onClick={() => {
            if (selectedUser) {
              confirm(
                () =>
                  api({
                    toastSuccessMessage: `Assigned to ${getFullUserName(
                      userIdToUser(selectedUser)
                    )}`,
                  })
                    .updateTechnicalReviewAssignee({
                      userId: selectedUser,
                      proposalPks: [proposal.primaryKey],
                    })
                    .then((result) => {
                      onProposalUpdated({
                        ...proposal,
                        technicalReview: proposal.technicalReview
                          ? {
                              ...proposal.technicalReview,
                              ...result.updateTechnicalReviewAssignee
                                .technicalReviews?.[0],
                            }
                          : null,
                      });
                    }),
                {
                  title: 'Are you sure?',
                  description: `You are about to set ${getFullUserName(
                    userIdToUser(selectedUser)
                  )} as a technical reviewer for this proposal. Are you sure?`,
                  alertText: proposal.technicalReview?.submitted
                    ? "The technical review is already submitted and re-assigning it to another person won't change anything. Better option is to un-submit first and then re-assign."
                    : '',
                }
              )();
            }
          }}
          data-cy="re-assign-submit"
          type="button"
          variant="contained"
          color="primary"
          className={classes.submitButton}
          disabled={!isUserOfficer && proposal.technicalReview?.submitted}
        >
          Assign
        </Button>
      </Grid>
    </Grid>
  );
}

export default withConfirm(AssignTechnicalReview);
