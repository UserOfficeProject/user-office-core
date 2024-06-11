import Autocomplete from '@mui/material/Autocomplete';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import React, { useState } from 'react';

import { UserRole } from 'generated/sdk';
import { useCheckAccess } from 'hooks/common/useCheckAccess';
import {
  ProposalDataInstrument,
  ProposalDataTechnicalReview,
} from 'hooks/proposal/useProposalData';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import { getFullUserName } from 'utils/user';
import withConfirm, { WithConfirmType } from 'utils/withConfirm';

type AssignTechnicalReviewProps = {
  technicalReview: ProposalDataTechnicalReview;
  instrument: ProposalDataInstrument;
  onTechnicalReviewUpdated: (
    updatedTechnicalReview: ProposalDataTechnicalReview
  ) => void;
  confirm: WithConfirmType;
};

function AssignTechnicalReview({
  technicalReview,
  instrument,
  onTechnicalReviewUpdated,
  confirm,
}: AssignTechnicalReviewProps) {
  const { api } = useDataApiWithFeedback();
  const isUserOfficer = useCheckAccess([UserRole.USER_OFFICER]);
  const isInternalReviewer = useCheckAccess([UserRole.INTERNAL_REVIEWER]);

  const [selectedUser, setSelectedUser] = useState(
    technicalReview?.technicalReviewAssigneeId
  );

  const usersData = instrument?.scientists || [];
  const instrumentContactAlreadyExists = instrument?.scientists.find(
    (scientist) => scientist.id === instrument?.instrumentContact?.id
  );

  if (instrument?.instrumentContact && !instrumentContactAlreadyExists) {
    usersData.push(instrument?.instrumentContact);
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
          disabled={
            (!isUserOfficer && technicalReview?.submitted) || isInternalReviewer
          }
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
                      proposalPks: [technicalReview.proposalPk],
                      instrumentId: technicalReview.instrumentId,
                    })
                    .then(({ updateTechnicalReviewAssignee }) => {
                      onTechnicalReviewUpdated({
                        ...technicalReview,
                        ...updateTechnicalReviewAssignee[0],
                      });
                    }),
                {
                  title: 'Are you sure?',
                  description: `You are about to set ${getFullUserName(
                    userIdToUser(selectedUser)
                  )} as a technical reviewer for this proposal. Are you sure?`,
                  alertText: technicalReview?.submitted
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
          sx={(theme) => ({ marginLeft: theme.spacing(2) })}
          disabled={
            (!isUserOfficer && technicalReview?.submitted) || isInternalReviewer
          }
        >
          Assign
        </Button>
      </Grid>
    </Grid>
  );
}

export default withConfirm(AssignTechnicalReview);
