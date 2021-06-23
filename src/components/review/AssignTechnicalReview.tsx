import { Button, makeStyles, TextField } from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
import React, { useState } from 'react';

import { UserRole } from 'generated/sdk';
import { ProposalData } from 'hooks/proposal/useProposalData';
import { useUsersData } from 'hooks/user/useUsersData';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import { getFullUserName } from 'utils/user';
import withConfirm, { WithConfirmType } from 'utils/withConfirm';

type AssignTechnicalReviewProps = {
  proposal: ProposalData;
  onProposalUpdated: (proposal: ProposalData) => void;
  confirm: WithConfirmType;
};

const useStyles = makeStyles((theme) => ({
  userList: {
    width: '300px',
    marginTop: theme.spacing(3),
    display: 'inline-block',
  },
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

  const [selectedUser, setSelectedUser] = useState(
    proposal.technicalReviewAssignee
  );
  const { usersData } = useUsersData({
    userRole: UserRole.INSTRUMENT_SCIENTIST,
  });

  if (!usersData) {
    return null;
  }

  const userIdToUser = (userId: number | null) =>
    usersData.users.find((user) => user.id === userId);

  return (
    <>
      <Autocomplete
        id="user-list"
        options={usersData.users}
        renderInput={(params) => <TextField {...params} />}
        getOptionLabel={(option) => getFullUserName(option)}
        onChange={(_event, newValue) => {
          if (newValue) {
            setSelectedUser(newValue.id);
          }
        }}
        className={classes.userList}
        value={userIdToUser(selectedUser)}
        disableClearable
        data-cy="user-list"
      />
      <Button
        onClick={() => {
          if (selectedUser) {
            confirm(
              () =>
                api(
                  `Assigned to ${getFullUserName(userIdToUser(selectedUser))}`
                )
                  .updateTechnicalReviewAssignee({
                    userId: selectedUser,
                    proposalPks: [proposal.primaryKey],
                  })
                  .then((result) => {
                    onProposalUpdated({
                      ...proposal,
                      ...result.updateTechnicalReviewAssignee.proposals[0],
                    });
                  }),
              {
                title: 'Are you sure?',
                description: `You are about to set ${getFullUserName(
                  userIdToUser(selectedUser)
                )} as a technical reviewer for this proposal. Are you sure?`,
              }
            )();
          }
        }}
        data-cy="re-assign-submit"
        type="button"
        variant="contained"
        color="primary"
        className={classes.submitButton}
      >
        Assign
      </Button>

      <Button
        onClick={() => {
          onProposalUpdated(proposal);
        }}
        type="button"
        variant="outlined"
        color="primary"
        className={classes.submitButton}
      >
        Cancel
      </Button>
    </>
  );
}

export default withConfirm(AssignTechnicalReview);
