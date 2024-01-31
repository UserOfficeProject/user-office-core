import { Button } from '@mui/material';
import Typography from '@mui/material/Typography';
import React, { useState } from 'react';

import { useCheckAccess } from 'components/common/Can';
import SuperMaterialTable from 'components/common/SuperMaterialTable';
import SafetyNotificationModal from 'components/review/SafetyNotificationModal';
import { BasicUserDetails, InternalReview, UserRole } from 'generated/sdk';
import { useFormattedDateTime } from 'hooks/admin/useFormattedDateTime';
import { useInternalReviewsData } from 'hooks/review/useInternalReviewData';
import { tableIcons } from 'utils/materialIcons';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import { getFullUserName } from 'utils/user';
import { FunctionType } from 'utils/utilTypes';

import CreateUpdateInternalReview from './CreateUpdateInternalReview';

const columns = [
  { title: 'Title', field: 'title' },
  {
    title: 'Reviewer',
    render: (rowData: InternalReview) => getFullUserName(rowData.reviewer),
  },
  { title: 'Created at', field: 'formattedCreatedAt' },
  {
    title: 'Assigned by',
    render: (rowData: InternalReview) =>
      getFullUserName(rowData.assignedByUser),
  },
];

type InternalReviewsTableProps = {
  technicalReviewId: number;
  technicalReviewSubmitted: boolean;
  proposalPk: number;
};

const InternalReviewsTable = ({
  technicalReviewId,
  technicalReviewSubmitted,
  proposalPk,
}: InternalReviewsTableProps) => {
  const { api } = useDataApiWithFeedback();
  const {
    loading,
    internalReviews,
    setInternalReviewsWithLoading: setInternalReviews,
  } = useInternalReviewsData({ technicalReviewId });
  const { toFormattedDateTime } = useFormattedDateTime({
    shouldUseTimeZone: true,
  });
  const isInternalReviewer = useCheckAccess([UserRole.INTERNAL_REVIEWER]);
  const [safetyNotificationModalOpen, setSafetyNotificationModalOpen] =
    useState(false);

  const createModal = (
    onUpdate: FunctionType<void, [InternalReview | null]>,
    onCreate: (internalReview: InternalReview | null) => void,
    editInternalReview: InternalReview | null
  ) => (
    <CreateUpdateInternalReview
      internalReview={editInternalReview}
      close={(internalReview: InternalReview | null) =>
        !!editInternalReview
          ? onUpdate(internalReview)
          : onCreate(internalReview)
      }
      technicalReviewId={technicalReviewId}
      technicalReviewSubmitted={technicalReviewSubmitted}
    />
  );

  const deleteInternalReview = async (id: string | number) => {
    try {
      await api({
        toastSuccessMessage: 'Internal review deleted successfully',
      }).deleteInternalReview({
        input: {
          id: id as number,
          technicalReviewId: technicalReviewId,
        },
      });

      return true;
    } catch (error) {
      return false;
    }
  };

  const reviewsWithFormattedData = internalReviews.map((review) => ({
    ...review,
    formattedCreatedAt: toFormattedDateTime(review.createdAt),
  }));

  const distinctReviewers: BasicUserDetails[] = internalReviews.reduce(
    (accumulator, review) => {
      const reviewer = review.reviewer;

      if (
        reviewer &&
        !accumulator.some(
          (existingReviewer) => existingReviewer.id === reviewer.id
        )
      ) {
        accumulator.push(reviewer);
      }

      return accumulator;
    },
    [] as BasicUserDetails[]
  );

  return (
    <div data-cy="internal-reviews-table">
      <SafetyNotificationModal
        proposalPk={proposalPk}
        userListToNotify={distinctReviewers}
        show={safetyNotificationModalOpen}
        close={() => setSafetyNotificationModalOpen(false)}
      />
      <SuperMaterialTable
        hasAccess={{
          create: !isInternalReviewer,
          remove: !isInternalReviewer,
          update: true,
        }}
        title={
          <Typography variant="h6" component="h2">
            Internal reviews
          </Typography>
        }
        delete={deleteInternalReview}
        createModal={createModal}
        createModalSize="sm"
        setData={setInternalReviews}
        icons={tableIcons}
        columns={columns}
        data={reviewsWithFormattedData}
        isLoading={loading}
        options={{
          search: false,
          padding: 'dense',
        }}
        extraActionButtons={
          <Button
            type="button"
            onClick={() => setSafetyNotificationModalOpen(true)}
            color="primary"
            data-cy="notify-safety-reviewers-button"
          >
            Notify Safety reviewers
          </Button>
        }
      />
    </div>
  );
};

export default InternalReviewsTable;
