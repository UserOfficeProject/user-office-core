import MaterialTable, { Column } from '@material-table/core';
import { Delete } from '@mui/icons-material';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  DialogActions,
  DialogContent,
  FormHelperText,
  IconButton,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import StyledDialog from 'components/common/StyledDialog';
import {
  ProposalViewInstrument,
  ProposalViewTechnicalReview,
  UserRole,
} from 'generated/sdk';
import { useCheckAccess } from 'hooks/common/useCheckAccess';
import { useInstrumentsByIdsData } from 'hooks/instrument/useInstrumentsByIdsData';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import { getFullUserName } from 'utils/user';
import withConfirm, { WithConfirmType } from 'utils/withConfirm';

type GroupedReviews = {
  instrumentId: number;
  instrumentName: string;
  reviews: ReviewData[];
};

export type ReviewData = {
  review: ProposalViewTechnicalReview;
  instrument: ProposalViewInstrument;
  proposal: { proposalPk: number; proposalId: string; title: string };
};

const TechnicalBulkReassignModal = ({
  reviews,
  setReviews,
  removeReview,
  instrumentIds,
  confirm,
}: {
  reviews: ReviewData[];
  instrumentIds: number[];
  setReviews: (refetch?: boolean, resetSelection?: boolean) => void;
  removeReview: (reviewId: number) => void;
  confirm: WithConfirmType;
}) => {
  const { t } = useTranslation();
  const { instruments, loadingInstruments } =
    useInstrumentsByIdsData(instrumentIds);

  const { api } = useDataApiWithFeedback();

  const [newReviewersMap, setNewReviewersMap] = useState<Map<number, number>>(
    new Map<number, number>()
  );

  const isUserOfficer = useCheckAccess([UserRole.USER_OFFICER]);

  const RowActionButtons = (review: ReviewData) => {
    const iconButtonStyle = { padding: '7px' };

    return (
      <>
        <Tooltip title={'Remove from bulk reassigning'}>
          <IconButton
            onClick={() => {
              removeReview(review.review.id);
            }}
            style={iconButtonStyle}
          >
            <Delete data-cy={`remove-proposal-${review.review.id}`} />
          </IconButton>
        </Tooltip>
      </>
    );
  };

  const proposalCount = new Map<string, number>();

  const reviewsSortedByInstrument: GroupedReviews[] = reviews.reduce(
    (acc: GroupedReviews[], review) => {
      const instrumentId = review.review.instrumentId as number;
      const instrumentName = review.instrument?.name;

      proposalCount.set(
        review.proposal.proposalId,
        proposalCount.get(review.proposal.proposalId)
          ? (proposalCount.get(review.proposal.proposalId) as number) + 1
          : 1
      );

      const instrumentGroup = acc.find(
        (group) => group.instrumentId === instrumentId
      );

      if (instrumentGroup) {
        instrumentGroup.reviews.push(review);
      } else {
        acc.push({
          instrumentId,
          instrumentName,
          reviews: [review],
        });
      }

      return acc;
    },
    []
  );

  const proposalsWithMultipleInstrument: string[] = [];
  proposalCount.forEach((count, prop) => {
    if (count > 1) {
      proposalsWithMultipleInstrument.push(prop);
    }
  });

  const updateReviews = () => {
    // Map over current instruments as there is a edge case where the map includes instruments that are no longer present
    instruments?.map((inst) => {
      const proposals = reviewsSortedByInstrument
        .find((group) => group.instrumentId === inst.id)
        ?.reviews.map((rev) => rev.proposal.proposalPk);

      newReviewersMap.get(inst.id) &&
        proposals &&
        api().updateTechnicalReviewAssignee({
          instrumentId: inst.id,
          proposalPks: proposals,
          userId: newReviewersMap.get(inst.id) as number,
        });
    });
    setReviews(true, true);
  };

  const instrumentColumns: Column<GroupedReviews>[] = [
    {
      title: t('instrument'),
      field: 'instrumentName',
      sorting: false,
      render: (data) => data.instrumentName,
    },
    {
      title: 'New Technial Reviewer',
      sorting: false,
      render: (data) => {
        const instrument = instruments?.find(
          (inst) => inst.id === data.instrumentId
        );

        const userList = instrument ? [...instrument?.scientists] : [];
        if (
          !userList.find(
            (user) => user.id === instrument?.instrumentContact?.id
          )
        ) {
          instrument?.instrumentContact &&
            instrument &&
            userList.push(instrument?.instrumentContact);
        }

        return (
          <Autocomplete
            id={`user-list-${data.instrumentId}`}
            options={userList}
            renderInput={(params) => (
              <TextField {...params} label="Technical reviewer" margin="none" />
            )}
            getOptionLabel={(option) => getFullUserName(option)}
            onChange={(_event, newValue) => {
              if (instrument && newValue) {
                setNewReviewersMap(
                  newReviewersMap.set(instrument.id, newValue.id)
                );
              }
            }}
            disableClearable
            data-cy={`user-list-${data.instrumentId}`}
          />
        );
      },
    },
  ];

  const proposalColumns: Column<ReviewData>[] = [
    {
      title: 'Actions',
      width: '10%',
      sorting: false,
      removable: false,
      field: 'rowActionButtons',
      render: RowActionButtons,
    },
    {
      title: 'Proposal Id',
      width: '15%',
      render: (data) => data.proposal.proposalId,
    },
    {
      title: 'Proposal Title',
      render: (data) => data.proposal.title,
    },
    {
      title: 'Current Reviewer',
      width: '20%',
      render: (data) => getFullUserName(data.review.technicalReviewAssignee),
    },
  ];

  return (
    <>
      <StyledDialog
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        open={true}
        onClose={(): void => setReviews()}
        maxWidth="lg"
        fullWidth
        title={`Bulk Reassign Proposals Techniqual reviews`}
        data-cy="bulk-reassign-modal"
      >
        <DialogContent>
          <FormHelperText error></FormHelperText>
          {!!proposalsWithMultipleInstrument.length && (
            <Alert severity="warning" data-cy="multi-instrument-alert">
              {`Warning: you have selected proposal(s) with multiple ${t('instrument')}s. All their reviews will appear here: ${proposalsWithMultipleInstrument.toString().replaceAll(',', ', ')}`}
            </Alert>
          )}
          <MaterialTable
            title={
              <Typography variant="h6" component="h1">
                Technical Reviews
              </Typography>
            }
            columns={instrumentColumns}
            data={reviewsSortedByInstrument.map((rev) => {
              return {
                ...rev,
                reviwers: instruments
                  ? instruments.find((inst) => inst.id === rev.instrumentId)
                  : null,
              };
            })}
            isLoading={loadingInstruments}
            options={{
              debounceInterval: 400,
              idSynonym: 'instrumentId',
              search: false,
            }}
            detailPanel={[
              {
                tooltip: 'Show Manager and Scientists',
                render: (rowData) => {
                  return (
                    <Box
                      sx={{
                        '& tr:last-child td': {
                          border: 'none',
                        },
                        '& .MuiPaper-root': {
                          padding: '0 40px',
                          backgroundColor: '#fafafa',
                        },
                      }}
                      data-cy={`reassign-proposals-table-${rowData.rowData.instrumentId}`}
                    >
                      <MaterialTable
                        title={rowData.rowData.instrumentName}
                        data={rowData.rowData.reviews}
                        columns={proposalColumns}
                        options={{
                          idSynonym: 'review',
                          search: false,
                          tableLayout: 'fixed',
                        }}
                      />
                    </Box>
                  );
                },
              },
            ]}
          />
        </DialogContent>
        <DialogActions>
          <Button
            type="button"
            onClick={() => setReviews()}
            data-cy="close-bulk"
          >
            Close
          </Button>
          <Button
            type="button"
            onClick={confirm(updateReviews, {
              title: 'Update Reviewers',
              description: isUserOfficer
                ? `Please ensure you have reviewed which proposals you are reassigning, current reviewers will lose access to complete these reviews.`
                : 'Please ensure you have reviewed which proposals you are reassigning. You will lose access to complete and reassign these reviews.',
            })}
            data-cy="bulk-update"
          >
            Update Reviewers
          </Button>
        </DialogActions>
      </StyledDialog>
    </>
  );
};

export default withConfirm(TechnicalBulkReassignModal);
